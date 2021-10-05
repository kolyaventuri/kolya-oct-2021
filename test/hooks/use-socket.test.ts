import test from 'ava';
import proxyquire from 'proxyquire';
import {stub} from 'sinon';

import {useSocket as realUseSocket} from '../../src/hooks/use-socket';
import {ConnectionStatus} from '../../src/types/socket';
import {useMemo, useState, useEffect} from '../helpers/stubs/hooks';

type CallbackFn = (...args: any[]) => void;
const getFn = () => {
  const events: Record<string, CallbackFn> = {};
  const actions = {
    send: stub(),
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
    react: {useMemo, useState, useEffect},
  });

  return {useSocket, events, actions};
};

test('#useSocket returns the status, and a bid and ask array', (t) => {
  const {useSocket} = getFn();
  const [status, bid, ask] = useSocket('ticker');

  t.is(status, ConnectionStatus.OFFLINE);
  t.deepEqual(bid, []);
  t.deepEqual(ask, []);
});
