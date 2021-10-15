import React from 'react';
import test from 'ava';
import {cleanup, render, screen} from '@testing-library/react';

import Home from '../../src/pages';

test.afterEach(cleanup);

test('renders an order book', (t) => {
  render(<Home />);

  t.not(screen.getByTestId('order-book'), undefined);
});

test('renders a header with the right ticker', (t) => {
  render(<Home />);

  const header = screen.getByTestId('header');

  t.not(header, undefined);
  t.true(header.textContent?.includes('XBTUSD'));
});
