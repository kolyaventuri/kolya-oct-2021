import test from 'ava';
import proxyquire from 'proxyquire';
import {stub} from 'sinon';
import {renderHook} from '@testing-library/react-hooks';

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
      events[event] = callback;
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

  t.is(status, ConnectionStatus.CONNECTING);
  t.deepEqual(bid, []);
  t.deepEqual(ask, []);
});

test('#useSocket initially attempts to set up the socket', (t) => {
  const {useSocket, actions} = getFn();

  renderHook(() => useSocket('ticker'));
  t.true(
    actions.send.calledWith('subscribe', {
      feed: FEED_ID,
      product_ids: ['ticker'],
    }),
  );
});

test('#useSocket sets the connection status to CONNECTING on init', (t) => {
  const {useSocket} = getFn();
  const {result} = renderHook(() => useSocket('ticker'));
  const [status] = result.current;

  t.is(status, ConnectionStatus.CONNECTING);
});
