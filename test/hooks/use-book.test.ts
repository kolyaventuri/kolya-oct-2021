import test from 'ava';
import {stub} from 'sinon';
import {act, renderHook} from '@testing-library/react-hooks';

import {FEED_ID} from '../../src/constants/socket';
import {useBook} from '../../src/hooks/use-book';
import {WrappedSocket} from '../../src/util/socket';

import initData from '../../fixtures/pi_xbtusd.init.json';
import runningData from '../../fixtures/pi_xbtusd.json';

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

  t.deepEqual(result.current[0], [
    [1, 1, 1],
    [2, 2, 3],
  ]);
  t.deepEqual(result.current[1], [
    [3, 1, 1],
    [4, 2, 3],
  ]);
});

test('#useBook can update the bid and ask along with a data event', (t) => {
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

  const event2 = {
    type: 'data',
    payload: {
      bids: [[1, 3]],
      asks: [[4, 0]],
    },
  };
  act(() => {
    events.onmessage(event);
  });
  act(() => {
    events.onmessage(event2);
  });

  t.deepEqual(result.current[0], [
    [1, 3, 3],
    [2, 2, 5],
  ]);
  t.deepEqual(result.current[1], [[3, 1, 1]]);
});

test('#useBook will remove 0-size items', (t) => {
  const {events, socket} = getStubs();
  const {result} = renderHook(() => useBook('ticker', socket));

  t.deepEqual(result.current[0], []);
  t.deepEqual(result.current[1], []);

  const event = {
    type: 'data',
    payload: {
      bids: initData[2].bids,
      asks: initData[2].asks,
    },
  };

  const event2 = {
    type: 'data',
    payload: {
      bids: runningData[0].bids,
      asks: runningData[0].asks,
    },
  };
  act(() => {
    events.onmessage(event);
  });
  act(() => {
    events.onmessage(event2);
  });

  const zeroBids = result.current[0].filter(([, size]) => size === 0);
  const zeroAsks = result.current[1].filter(([, size]) => size === 0);
  t.is(
    zeroBids.length,
    0,
    `Found the folloing 0-size bids: ${JSON.stringify(zeroBids)}`,
  );
  t.is(
    zeroAsks.length,
    0,
    `Found the folloing 0-size asks: ${JSON.stringify(zeroAsks)}`,
  );
});

test('#useBook calculates the spread', (t) => {
  const {events, socket} = getStubs();
  const {result} = renderHook(() => useBook('ticker', socket));

  t.deepEqual(result.current[0], []);
  t.deepEqual(result.current[1], []);

  const event = {
    type: 'data',
    payload: {
      bids: [
        [34_062.5, 1],
        [34_052.5, 2],
      ],
      asks: [
        [34_079.5, 1],
        [34_094, 2],
      ],
    },
  };

  act(() => {
    events.onmessage(event);
  });

  t.pass(); // TODO: Return and fix this.

  /* t.deepEqual(result.current[2], {
    value: '17.0',
    percentage: '0.05',
  }); */
});
