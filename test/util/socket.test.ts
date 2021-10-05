import test from 'ava';

import {BOOK_URL} from '../../src/constants/urls';
import {getSocket} from '../../src/util/socket';

test('#getSocket returns a memoized socket', (t) => {
  const result = getSocket();
  t.true(result instanceof window.WebSocket);
  t.is(result.url, BOOK_URL);

  const result2 = getSocket();
  t.is(result2, result);
});
