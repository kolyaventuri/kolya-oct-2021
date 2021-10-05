import test from 'ava';
import {stub} from 'sinon';

import {BOOK_URL} from '../../src/constants/urls';
import {getSocket, WrappedSocket} from '../../src/util/socket';

test('#getSocket returns a memoized wrapped socket', (t) => {
  const result = getSocket();
  t.true(result instanceof WrappedSocket);
  // @ts-expect-error - Bypass private to check for existence
  t.is(result.__socket.url, BOOK_URL);

  const result2 = getSocket();
  t.is(result2, result);
});

test('can add open event to wrapped socket', (t) => {
  const socket = getSocket();
  const fn = () => {};
  socket.on('open', fn);

  // @ts-expect-error - Bypass private to check for existence
  t.is(socket.__socket.onopen, fn);
});

test('can add close event to wrapped socket', (t) => {
  const socket = getSocket();
  const fn = () => {};
  socket.on('close', fn);

  // @ts-expect-error - Bypass private to check for existence
  t.is(socket.__socket.onclose, fn);
});

test('can add error event to wrapped socket', (t) => {
  const socket = getSocket();
  const fn = () => {};
  socket.on('error', fn);

  // @ts-expect-error - Bypass private to check for existence
  t.is(socket.__socket.onerror, fn);
});

test('can add message event to wrapped socket', (t) => {
  const socket = getSocket();
  const fn = () => {};
  socket.on('message', fn);

  // @ts-expect-error - Bypass private to check for existence
  t.is(socket.__socket.onmessage, fn);
});

test('WrappedSocket#send sends an event to the socket', (t) => {
  const sendStub = stub(window.WebSocket.prototype, 'send');
  const socket = getSocket();

  socket.send('subscribe', {
    feed: 'abc',
    product_ids: ['123'],
  });

  t.true(
    sendStub.calledWith(
      JSON.stringify({
        event: 'subscribe',
        feed: 'abc',
        product_ids: ['123'],
      }),
    ),
  );

  sendStub.restore();
});
