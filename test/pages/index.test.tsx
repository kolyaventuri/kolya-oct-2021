import React from 'react';
import test from 'ava';
import {cleanup, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Home from '../../src/pages';

test.afterEach(cleanup);

test('renders an order book', (t) => {
  // Ava, being async, doesn't play nice with the global-DOM that react testing lib uses
  const {container} = render(<Home />);

  t.not(container.querySelector('[data-testid="order-book"]'), undefined);
});

test('renders a header with the right ticker', (t) => {
  const {container} = render(<Home />);

  const header = container.querySelector('[data-testid="header"]');

  t.not(header, undefined);
  t.true(header?.textContent?.includes('XBTUSD'));
});

test('renders a toggle button in the order book, that when clicked, toggles the ticker', t => {
  render(<Home />);
  const button = screen.getByText('Toggle Feed');

  t.true(screen.getByTestId('header').innerText.includes('XBTUSD'));

  t.not(button, undefined);
  userEvent.click(button);
  t.true(screen.getByTestId('header').innerText.includes('ETHUSD'));
  userEvent.click(button);
  t.true(screen.getByTestId('header').innerText.includes('XBTUSD'));
});
