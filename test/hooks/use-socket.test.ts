import test from 'ava';
import proxyquire from 'proxyquire';
import {act, renderHook} from '@testing-library/react-hooks';

import {useSocket as realUseSocket} from '../../src/hooks/use-socket';
import {ConnectionStatus} from '../../src/types/socket';

type CallbackFn = (...args: any[]) => void;
const getFn = () => {
  const events: Record<string, CallbackFn> = {};
  const getSocket = () => ({
    on(event: string, callback: (...args: any[]) => void) {
      events[`on${event}`] = callback;
    },
  });

  const {useSocket} = proxyquire.noCallThru()<{
    useSocket: typeof realUseSocket;
  }>('../../src/hooks/use-socket', {
    '../util/socket': {getSocket},
  });

  return {useSocket, events};
};

test('#useSocket returns the status, and an initially undefined socket', (t) => {
  const {useSocket} = getFn();
  const {result} = renderHook(() => useSocket());
  const [status, socket] = result.current;

  t.is(status, ConnectionStatus.OFFLINE);
  t.is(socket, undefined);
});

test('#useSocket sets the connection status to CONNECTING on open', (t) => {
  const {useSocket, events} = getFn();
  const {result} = renderHook(() => useSocket());

  act(() => {
    events.onopen();
  });

  t.is(result.current[0], ConnectionStatus.CONNECTING);
});

test('#useSocket changes to CONNECTED status upon recieving the "subscribed" message', (t) => {
  // (kolyaventuri): Pre-parsed as part of the socket. See util/socket.ts
  const event = {
    type: 'subscribed',
  };
  const {useSocket, events} = getFn();
  const {result} = renderHook(() => useSocket());

  act(() => {
    events.onopen();
    events.onmessage(event);
  });

  t.is(result.current[0], ConnectionStatus.CONNECTED);
});

test('#useSocket changes to OFFLINE status upon recieving the "close" event', (t) => {
  const {useSocket, events} = getFn();
  const {result} = renderHook(() => useSocket());

  act(() => {
    events.onclose();
  });

  t.is(result.current[0], ConnectionStatus.OFFLINE);
});
