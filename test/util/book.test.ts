import test from 'ava';
import {Book, InputBook} from '../../src/types/book';
import {updateBook} from '../../src/util/book';

import initData from '../../fixtures/pi_xbtusd.init.json';
import runningData from '../../fixtures/pi_xbtusd.json';

test('#updateBook returns a new book, with updated sizes, ordered largest to smallest price', (t) => {
  const input = [
    [2, 2, 2],
    [1, 1, 3],
  ] as Book;
  const updates = [
    [1, 2],
    [2, 3],
  ] as InputBook;

  const result = updateBook(input, updates);

  const expected = [
    [2, 3, 3],
    [1, 2, 5],
  ];
  t.deepEqual(result, expected);
});

test('#updateBook does not mutate input book', (t) => {
  const input = [
    [2, 2, 2],
    [1, 1, 3],
  ] as Book;

  updateBook(input, [
    [1, 2],
    [2, 3],
  ]);

  t.deepEqual(input, [
    [2, 2, 2],
    [1, 1, 3],
  ]); // We could deep-copy, but to be explicit
});

test('#updateBook removes a price if size goes to 0', (t) => {
  const input = [
    [1, 1, 1],
    [2, 2, 3],
    [3, 3, 6],
  ] as Book;
  const result = updateBook(input, [[2, 0]]);

  t.deepEqual(result, [
    [3, 3, 3],
    [1, 1, 4],
  ]);
});

test('#updateBook removes multiple prices if sizes go to 0', (t) => {
  const input = [
    [1, 1, 1],
    [2, 2, 3],
    [3, 3, 6],
    [4, 4, 10],
  ] as Book;
  const result = updateBook(input, [
    [2, 0],
    [1, 0],
  ]);

  t.deepEqual(result, [
    [4, 4, 4],
    [3, 3, 7],
  ]);
});

test('#updateBook only mutates the price(s) that are input', (t) => {
  const input = [
    [1, 1, 1],
    [2, 2, 1],
    [3, 3, 1],
  ] as Book;
  const result = updateBook(input, [[3, 1]]);

  t.deepEqual(result, [
    [3, 1, 1],
    [2, 2, 3],
    [1, 1, 4],
  ]);
});

test('#updateBook returns the same book if nothing changed', (t) => {
  const input = [
    [2, 2, 3],
    [1, 1, 1],
  ] as Book;
  const result = updateBook(input, []);

  t.deepEqual(result, input);
});

test('#updateBook can remove and mutate in the same request', (t) => {
  const input = [
    [1, 1, 1],
    [2, 2, 3],
    [3, 3, 6],
    [4, 4, 10],
  ] as Book;
  const result = updateBook(input, [
    [3, 1],
    [2, 0],
  ]);

  t.deepEqual(result, [
    [4, 4, 4],
    [3, 1, 5],
    [1, 1, 6],
  ]);
});

test('#updateBook handles real data as expected (bids going to 0)', (t) => {
  const input = initData[2].bids as Book;
  const newData = runningData[0].bids as InputBook;

  const result = updateBook(input, newData);
  const zeroBids = result.filter(([, size]) => size === 0);

  t.is(
    zeroBids.length,
    0,
    `Found the following 0-size bids after updateBook: ${JSON.stringify(
      zeroBids,
    )}`,
  );
});

test('#updateBook should be able to return the totals for each side', (t) => {
  const bidBook = [
    [1000, 50],
    [1005, 100],
    [1010, 1000],
  ] as InputBook;

  const expected = [
    [1010, 1000, 1000],
    [1005, 100, 1100],
    [1000, 50, 1150],
  ];

  const result = updateBook([], bidBook);

  t.deepEqual(result, expected);
});
