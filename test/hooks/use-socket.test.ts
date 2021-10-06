import test from 'ava';
import proxyquire from 'proxyquire';
import {stub} from 'sinon';
import {act, renderHook} from '@testing-library/react-hooks';

import {FEED_ID} from '../../src/constants/socket';
import {useSocket as realUseSocket} from '../../src/hooks/use-socket';
import {ConnectionStatus} from '../../src/types/socket';

type CallbackFn = (...args: any[]) => void;
const getFn = () => {
  const events: Record<string, CallbackFn> = {};
  const actions = {
    send: stub(),
    close: stub(),
    open: stub(),
  };
  const getSocket = () => ({
    on(event: string, callback: (...args: any[]) => void) {
      events[`on${event}`] = callback;
    },
    send(...args: any[]) {
      actions.send(...args);
    },
    close() {},
    open() {},
  });

  const {useSocket} = proxyquire.noCallThru()<{
    useSocket: typeof realUseSocket;
  }>('../../src/hooks/use-socket', {
    '../util/socket': {getSocket},
  });

  return {useSocket, events, actions};
};

test('#useSocket returns the status, and a bid and ask array', (t) => {
  const {useSocket} = getFn();
  const {result} = renderHook(() => useSocket('ticker'));
  const [status, bid, ask] = result.current;

  t.is(status, ConnectionStatus.OFFLINE);
  t.deepEqual(bid, []);
  t.deepEqual(ask, []);
});

test('#useSocket sets the connection status to CONNECTING on open', (t) => {
  const {useSocket, events} = getFn();
  const {result} = renderHook(() => useSocket('ticker'));

  act(() => {
    events.onopen();
  });

  t.is(result.current[0], ConnectionStatus.CONNECTING);
});

test('#useSocket attempts to subscribe to the ticker after open', (t) => {
  const {useSocket, events, actions} = getFn();

  renderHook(() => useSocket('ticker'));

  act(() => {
    events.onopen();
  });

  t.true(
    actions.send.calledWith('subscribe', {
      feed: FEED_ID,
      product_ids: ['ticker'],
    }),
  );
});

test('#useSocket changes to CONNECTED status upon recieving the "subscribed" message', (t) => {
  // (kolyaventuri): Pre-parsed as part of the socket. See util/socket.ts
  const event = {
    type: 'subscribed',
  };
  const {useSocket, events} = getFn();
  const {result} = renderHook(() => useSocket('ticker'));

  act(() => {
    events.onopen();
    events.onmessage(event);
  });

  t.is(result.current[0], ConnectionStatus.CONNECTED);
});

test('#useSocket changes to OFFLINE status upon recieving the "close" event', (t) => {
  const {useSocket, events} = getFn();
  const {result} = renderHook(() => useSocket('ticker'));

  act(() => {
    events.onclose();
  });

  t.is(result.current[0], ConnectionStatus.OFFLINE);
});

test('#useSocket updates the bid and ask along with a data event', (t) => {
  const {useSocket, events} = getFn();
  const {result} = renderHook(() => useSocket('ticker'));

  t.deepEqual(result.current[1], []);
  t.deepEqual(result.current[2], []);

  const event = {
    type: 'data',
    payload: {
      bid: [
        [1, 1],
        [2, 2],
      ],
      ask: [
        [3, 1],
        [4, 2],
      ],
    },
  };

  act(() => {
    events.onmessage(event);
  });

  t.deepEqual(result.current[1], event.payload.bid);
  t.deepEqual(result.current[2], event.payload.ask);
});
