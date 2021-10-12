import test from 'ava';
import {Book} from '../../src/types/book';
import {updateBook} from '../../src/util/book';

test('#updateBook returns a new book, with updated sizes', (t) => {
  const input = [
    [1, 1],
    [2, 2],
  ] as Book;
  const updates = [
    [1, 2],
    [2, 3],
  ] as Book;

  const result = updateBook(input, updates);

  t.deepEqual(result, updates);
});

test('#updateBook does not mutate input book', (t) => {
  const input = [
    [1, 1],
    [2, 2],
  ] as Book;
  const existing = [...input]; // Deep copy

  updateBook(input, [
    [1, 2],
    [2, 3],
  ]);

  t.deepEqual(input, existing);
});

test('#updateBook removes a price if size goes to 0', (t) => {
  const input = [
    [1, 1],
    [2, 2],
    [3, 3],
  ] as Book;
  const result = updateBook(input, [[2, 0]]);

  t.deepEqual(result, [
    [1, 1],
    [3, 3],
  ]);
});

test('#updateBook only mutates the price(s) that are input', (t) => {
  const input = [
    [1, 1],
    [2, 2],
    [3, 3],
  ] as Book;
  const result = updateBook(input, [[3, 1]]);

  t.deepEqual(result, [
    [1, 1],
    [2, 2],
    [3, 1],
  ]);
});

test('#updateBook returns the same book if nothing changed', (t) => {
  const input = [
    [1, 1],
    [2, 2],
  ] as Book;
  const result = updateBook(input, []);

  t.deepEqual(result, input);
});

test('#updateBook can remove and mutate in the same request', (t) => {
  const input = [
    [1, 1],
    [2, 2],
    [3, 3],
    [4, 4],
  ] as Book;
  const result = updateBook(input, [
    [3, 1],
    [2, 0],
  ]);

  t.deepEqual(result, [
    [1, 1],
    [3, 1],
    [4, 4],
  ]);
});
