import test from 'ava';

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
