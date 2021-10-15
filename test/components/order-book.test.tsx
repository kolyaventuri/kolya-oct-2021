import React from 'react';
import test, {ExecutionContext} from 'ava';
import {
  cleanup,
  render,
  screen,
  within,
  fireEvent,
} from '@testing-library/react';

import {OrderBook} from '../../src/components/order-book';
import {Book} from '../../src/types/book';

const bids = [
  [15_000.5, 2, 3],
  [47_000.5, 5, 6],
] as Book;
const asks = [
  [71_000.2, 8, 9],
  [60_000.2, 11, 12],
] as Book;
const spread = {
  value: '17.0',
  percentage: '0.05%',
};
const formatter = new Intl.NumberFormat();

const setHeightMultiplier = (n = 3): void => {
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
    configurable: true,
    get() {
      const value = 30;
      if (this.getAttribute('data-testid') === 'book-container') {
        return value * n;
      }

      return value;
    },
  });
};

test.before((t) => {
  const context = t.context as Record<string, any>;
  setHeightMultiplier();
  context.component = render(
    <OrderBook bids={bids} asks={asks} spread={spread} isMobile={false} />,
  );
});
test.after(cleanup);

const rerender = (
  t: ExecutionContext,
  props: Record<string, any> = {},
): void => {
  // Rerender the component to update refs
  (t.context as Record<string, any>).component.rerender(
    <OrderBook
      bids={bids}
      asks={asks}
      spread={spread}
      isMobile={false}
      {...props}
    />,
  );
};

test('renders a list of formatted bids', (t) => {
  // Rerender the component to update refs
  rerender(t);
  const list = screen.getByTestId('bid-list');
  t.not(list, undefined);

  const {getAllByTestId} = within(list);
  const items = getAllByTestId('entry');

  t.is(items.length, bids.length);
  for (const [i, bid] of bids.entries()) {
    const [price, size, total] = bid;
    const {getByTestId} = within(items[i]);

    t.true(
      getByTestId('bid-total').textContent?.includes(
        `${formatter.format(total)}`,
      ),
    );
    t.true(
      getByTestId('bid-size').textContent?.includes(
        `${formatter.format(size)}`,
      ),
    );
    t.true(
      getByTestId('bid-price').textContent?.includes(
        `${formatter.format(price)}`,
      ),
    );
  }
});

test('renders a list of formatted asks', (t) => {
  // Rerender the component to update refs
  rerender(t);
  const list = screen.getByTestId('ask-list');
  t.not(list, undefined);

  const {getAllByTestId} = within(list);
  const items = getAllByTestId('entry');

  t.is(items.length, asks.length);
  for (const [i, ask] of asks.entries()) {
    const [price, size, total] = ask;
    const {getByTestId} = within(items[i]);

    t.true(
      getByTestId('ask-total').textContent?.includes(
        `${formatter.format(total)}`,
      ),
    );
    t.true(
      getByTestId('ask-size').textContent?.includes(
        `${formatter.format(size)}`,
      ),
    );
    t.true(
      getByTestId('ask-price').textContent?.includes(
        `${formatter.format(price)}`,
      ),
    );
  }
});

test('each entry has a background, proportional to its total against the max total', (t) => {
  // Rerender the component to update refs
  rerender(t);
  const list = screen.getByTestId('bid-list');
  const {getAllByTestId} = within(list);
  const items = getAllByTestId('entry');

  const bid = items[0];
  const {getByTestId} = within(bid);

  const background = getByTestId('entry-bg');
  // Max is 12, first item is 3 in the bids = 25%
  t.is(background.style.width, '25%');
});

test('renders a finite number of items based on the screen size', (t) => {
  // Rerender the component to update refs
  rerender(t, {
    bids: [
      [1, 1],
      [2, 2],
      [3, 3],
      [4, 4],
      [5, 5],
    ],
    asks: [
      [1, 1],
      [2, 2],
      [3, 3],
      [4, 4],
      [5, 5],
    ],
  });
  const list = screen.getByTestId('bid-list');
  const {getAllByTestId} = within(list);
  const items = getAllByTestId('entry');

  t.is(items.length, 3); // Max length is 3 based on screen size of height 90
});

test('re-calculates the number that can be rendered on resize', (t) => {
  // Rerender the component to update refs
  const fn = () => {
    rerender(t, {
      bids: [
        [1, 1],
        [2, 2],
        [3, 3],
        [4, 4],
        [5, 5],
      ],
      asks: [
        [1, 1],
        [2, 2],
        [3, 3],
        [4, 4],
        [5, 5],
      ],
    });
  };

  fn();
  setHeightMultiplier(2.5);
  fireEvent(window, new Event('resize'));
  // Continously re-render to step through ref updates
  fn();
  fn();

  const list = screen.getByTestId('bid-list');
  const {getAllByTestId} = within(list);
  const items = getAllByTestId('entry');

  t.is(items.length, 2); // Max length is 2 based on screen size of height 75
});
