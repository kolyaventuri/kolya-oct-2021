import test from 'ava';
import {stub} from 'sinon';
import {act, renderHook} from '@testing-library/react-hooks';

import {FEED_ID} from '../../src/constants/socket';
import {useBook} from '../../src/hooks/use-book';
import {WrappedSocket} from '../../src/util/socket';

// https://stackoverflow.com/a/46634877/3685123
type Mutable<T> = {-readonly [P in keyof T]: T[P]};

type CallbackFn = (...args: any[]) => void;
const getStubs = () => {
  const events: Record<string, CallbackFn> = {};
  const actions = {
    send: stub(),
    close: stub(),
    open: stub(),
  };
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const socket = {
    on(event: string, callback: (...args: any[]) => void) {
      events[`on${event}`] = callback;
    },
    send(...args: any[]) {
      actions.send(...args);
    },
    close() {},
    open() {},
    isOpen: false,
  } as WrappedSocket;

  return {events, actions, socket};
};

test('#useBook returns an initially empty bid and ask array', (t) => {
  const {result} = renderHook(() => useBook('ticker', undefined));
  const [bid, ask] = result.current;

  t.deepEqual(bid, []);
  t.deepEqual(ask, []);
});

test('#useBook does not error out, and does nothing yet, if the socket is not yet ready', (t) => {
  const {result} = renderHook(() => useBook('ticker', undefined));

  t.is(result.error, undefined);
});

test('#useBook attempts to subscribe to the ticker after socket is open', (t) => {
  const {actions, socket, events} = getStubs();
  socket.on('open', () => {
    (socket as Mutable<WrappedSocket>).isOpen = true;
  });

  renderHook(() => useBook('ticker', socket));

  act(() => {
    events.onopen();
  });

  t.true(
    actions.send.calledWith('subscribe', {
      feed: FEED_ID,
      product_ids: ['PI_ticker'],
    }),
  );
});

test('#useBook sets the bid and ask along with a data event', (t) => {
  const {events, socket} = getStubs();
  const {result} = renderHook(() => useBook('ticker', socket));

  t.deepEqual(result.current[0], []);
  t.deepEqual(result.current[1], []);

  const event = {
    type: 'data',
    payload: {
      bids: [
        [1, 1],
        [2, 2],
      ],
      asks: [
        [3, 1],
        [4, 2],
      ],
    },
  };

  act(() => {
    events.onmessage(event);
  });

  t.deepEqual(result.current[0], event.payload.bids);
  t.deepEqual(result.current[1], event.payload.asks);
});
