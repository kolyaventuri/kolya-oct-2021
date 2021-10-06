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

// Test('#useSocket changes to CONNECTED status upon recieving the "subscribed" event' , (t) => {
//   // (kolyaventuri): Based off of the subscribed event - see fixtures/pt_xbtusd.init.json
//   const event = {
//     data: JSON.stringify({
//       event: 'subscribed',
//       feed: 'book_ui_1',
//       product_ids: [
//         'ticker'
//       ]
//     })
//   };
//   const {useSocket, events} = getFn();
//   const {result} = renderHook(() => useSocket('ticker'));

//   act(() => {
//     events.onopen();
//     events.onmessage(event);
//   });

//   t.is(result.current[0], ConnectionStatus.CONNECTED);
// });
