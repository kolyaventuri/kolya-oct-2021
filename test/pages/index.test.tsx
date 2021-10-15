import React from 'react';
import test from 'ava';
import {cleanup, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Home from '../../src/pages';

test.before(() => {
  render(<Home />);
});
test.after(cleanup);

test('renders an order book', (t) => {
  t.not(screen.getByTestId('order-book'), undefined);
});

test('renders a header with the right ticker', (t) => {
  const header = screen.getByTestId('header');

  t.not(header, undefined);
  t.true(header?.textContent?.includes('XBTUSD'));
});

test('renders a toggle button in the order book, that when clicked, toggles the ticker', (t) => {
  const button = screen.getByText('Toggle Feed');

  t.true(screen.getByTestId('header')?.textContent?.includes('XBTUSD'));

  t.not(button, undefined);
  userEvent.click(button);
  t.true(screen.getByTestId('header')?.textContent?.includes('ETHUSD'));
  userEvent.click(button);
  t.true(screen.getByTestId('header')?.textContent?.includes('XBTUSD'));
});
