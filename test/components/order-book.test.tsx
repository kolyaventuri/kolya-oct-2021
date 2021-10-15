import React from 'react';
import test from 'ava';
import {cleanup, render, screen, within} from '@testing-library/react';

import {OrderBook} from '../../src/components/order-book';
import {Book} from '../../src/types/book';

const bids = [
  [1, 2, 3],
  [4, 5, 6],
] as Book;
const asks = [
  [7, 8, 9],
  [10, 11, 12],
] as Book;
const spread = {
  value: '17.0',
  percentage: '0.05%',
};

test.before(() => {
  render(
    <OrderBook
      bids={bids}
      asks={asks}
      spread={spread}
      isMobile={false}
      onToggle={() => {}}
    />,
  );
});
test.after(cleanup);

test('renders a list of bids', (t) => {
  const list = screen.getByTestId('bid-list');
  t.not(list, undefined);

  const {getAllByTestId} = within(list);
  const items = getAllByTestId('entry');

  t.is(items.length, bids.length);
  for (const [i, bid] of bids.entries()) {
    const [price, size, total] = bid;
    const {getByTestId} = within(items[i]);

    t.true(getByTestId('bid-total').textContent?.includes(`${total}`));
    t.true(getByTestId('bid-size').textContent?.includes(`${size}`));
    t.true(getByTestId('bid-price').textContent?.includes(`${price}`));
  }
});

test('renders a list of asks', (t) => {
  const list = screen.getByTestId('ask-list');
  t.not(list, undefined);

  const {getAllByTestId} = within(list);
  const items = getAllByTestId('entry');

  t.is(items.length, asks.length);
  for (const [i, ask] of asks.entries()) {
    const [price, size, total] = ask;
    const {getByTestId} = within(items[i]);

    t.true(getByTestId('ask-total').textContent?.includes(`${total}`));
    t.true(getByTestId('ask-size').textContent?.includes(`${size}`));
    t.true(getByTestId('ask-price').textContent?.includes(`${price}`));
  }
});
