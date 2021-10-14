import test from 'ava';
import {stub} from 'sinon';
import proxyquire from 'proxyquire';
import {
  getSocket as realGetSocket,
  WrappedSocket as realWrappedSocket,
} from '../../src/util/socket';
import {delay} from '../helpers/delay';
import initData from '../../fixtures/pi_xbtusd.init.json';
import runningData from '../../fixtures/pi_xbtusd.json';

const BOOK_URL = 'wss://some-url/';

// Wrapped proxyquire call, so every test gets its own unique socket instance
const getSocket = () => {
  const {getSocket: getSocketFn, WrappedSocket} = proxyquire<{
    getSocket: typeof realGetSocket;
    WrappedSocket: typeof realWrappedSocket;
  }>('../../src/util/socket', {
    '../constants/urls': {BOOK_URL},
  });

  return {socket: getSocketFn(), WrappedSocket, getSocketFn};
};

test('#getSocket returns a memoized wrapped socket', (t) => {
  const {getSocketFn, WrappedSocket} = getSocket();
  const socket = getSocketFn(); // Explicitly use the same instance
  t.true(socket instanceof WrappedSocket);
  // @ts-expect-error - Bypass private to check for existence
  t.is(socket.__socket.url, BOOK_URL);

  const result2 = getSocketFn();
  t.is(result2, socket);
});

test('can add open event to wrapped socket', (t) => {
  const {socket} = getSocket();
  const fn = stub();
  socket.on('open', fn);

  // @ts-expect-error - Bypass private to check for existence
  socket.__socket.onopen();
  t.true(fn.called);
});

test('can add close event to wrapped socket', (t) => {
  const {socket} = getSocket();
  const fn = stub();
  socket.on('close', fn);

  // @ts-expect-error - Bypass private to check for existence
  socket.__socket.onclose();
  t.true(fn.called);
});

test('can add error event to wrapped socket', (t) => {
  const {socket} = getSocket();
  const fn = stub();
  socket.on('error', fn);

  // @ts-expect-error - Bypass private to check for existence
  socket.__socket.onerror();
  t.true(fn.called);
});

test('can add message event to wrapped socket', (t) => {
  const {socket} = getSocket();
  const fn = stub();
  socket.on('message', fn);

  // @ts-expect-error - Bypass private to check for existence
  socket.__socket.onmessage({data: '{"foo": 123}'});
  t.true(
    fn.calledWith({
      type: 'generic',
      payload: {foo: 123},
    }),
  );
});

test('can add multiple events of the same type to the scoket', (t) => {
  const {socket} = getSocket();
  const fn1 = stub();
  socket.on('message', fn1);

  const fn2 = stub();
  socket.on('message', fn2);

  // @ts-expect-error - Bypass private to check for existence
  socket.__socket.onmessage({data: '{"foo": 123}'});
  t.true(
    fn1.calledWith({
      type: 'generic',
      payload: {foo: 123},
    }),
  );
  t.true(
    fn2.calledWith({
      type: 'generic',
      payload: {foo: 123},
    }),
  );
});

test('WrappedSocket#send sends an event to the socket', (t) => {
  const sendStub = stub(window.WebSocket.prototype, 'send');
  const {socket} = getSocket();

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

test('WrappedSocket#close closes the socket', (t) => {
  const closeStub = stub(window.WebSocket.prototype, 'close');
  const {socket} = getSocket();

  socket.close();
  t.true(closeStub.called);

  closeStub.restore();
});

test('WrappedSocket#open reopens a closed socket', async (t) => {
  const {socket} = getSocket();
  const OldWS = window.WebSocket;
  const constructorStub = stub().callsFake(
    (url: string, ...args: any[]) => new OldWS(url, ...args),
  );

  // @ts-expect-error - Overwrite
  window.WebSocket = (...args: any[]) => {
    return constructorStub(...args);
  };

  socket.close();
  await delay();
  socket.open();

  t.true(constructorStub.called);
});

test('WrappedSocket#open re-binds whichever events were listened', async (t) => {
  const {socket} = getSocket();
  const fn = stub();
  socket.on('open', fn);

  const OldWS = window.WebSocket;
  const constructorStub = stub().callsFake(
    (url: string, ...args: any[]) => new OldWS(url, ...args),
  );

  // @ts-expect-error - Overwrite
  window.WebSocket = (...args: any[]) => {
    return constructorStub(...args);
  };

  socket.close();
  await delay();
  socket.open();

  // @ts-expect-error - Direct access
  t.is(socket.__handlers.open[0], fn);
});

test('WrappedSocket#open, if socket is already open, does not re-open it', (t) => {
  const {socket} = getSocket();
  const OldWS = window.WebSocket;
  const constructorStub = stub().callsFake(
    (url: string, ...args: any[]) => new OldWS(url, ...args),
  );

  // @ts-expect-error - Overwrite
  window.WebSocket = (...args: any[]) => {
    return constructorStub(...args);
  };

  socket.open();

  t.false(constructorStub.called);
});

test('WrappedSocket#on with a message event of type subscribed sends back the right data', (t) => {
  const {socket} = getSocket();

  socket.on('message', (event) => {
    if (event.type === 'subscribed') {
      t.true(typeof event.payload === 'undefined');
    } else {
      t.fail(`Expected type "subscribed", got "${event.type}"`);
    }
  });

  // @ts-expect-error - Direct access
  socket.__handlers.message[0]({
    data: JSON.stringify(initData[1]),
  });
});

test('WrappedSocket#on with a message event of type data (via snapshot) sends back the right data', (t) => {
  const {socket} = getSocket();

  socket.on('message', (event) => {
    if (event.type === 'data') {
      t.deepEqual(event.payload, {
        bids: initData[2].bids,
        asks: initData[2].asks,
      });
    } else {
      t.fail(`Expected type "data", got "${event.type}"`);
    }
  });

  // @ts-expect-error - Direct access
  socket.__handlers.message[0]({
    data: JSON.stringify(initData[2]),
  });
});

test('WrappedSocket#on with a message event of type data (via delta) sends back the right data', (t) => {
  const {socket} = getSocket();

  socket.on('message', (event) => {
    if (event.type === 'data') {
      t.deepEqual(event.payload, {
        bids: runningData[0].bids,
        asks: runningData[0].asks,
      });
    } else {
      t.fail(`Expected type "data", got "${event.type}"`);
    }
  });

  // @ts-expect-error - Direct access
  socket.__handlers.message[0]({
    data: JSON.stringify(runningData[0]),
  });
});

test('WrappedSocket#isOpen returns true if the socket ReadyState is OPEN', (t) => {
  const {socket} = getSocket();
  // @ts-expect-error - Direct access
  const stateStub = stub(socket.__socket, 'readyState');
  stateStub.get(() => 1); // 1 = ReadyState.OPEN

  t.true(socket.isOpen);

  stateStub.restore();
});

test('WrappedSocket#isOpen returns false if the socket ReadyState is NOT OPEN', (t) => {
  const {socket} = getSocket();

  t.false(socket.isOpen);
});

test('WrappedSocket#on for event "open" emits immediately if socket is already open', (t) => {
  const {socket} = getSocket();

  // @ts-expect-error - Direct access
  const stateStub = stub(socket.__socket, 'readyState');
  stateStub.get(() => 1); // 1 = ReadyState.OPEN

  const fn = stub();
  socket.on('open', fn);

  t.true(fn.called);
});
