import React from 'react';
import test from 'ava';
import {cleanup, render, screen, fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import proxyquire from 'proxyquire';
import {stub} from 'sinon';

import {ConnectionStatus} from '../../src/types/socket';

const socket = {
  on() {},
  send() {},
  open: stub(),
  close: stub(),
};
const actions = {
  reset: stub(),
  unsubscribe: stub(),
};
const useSocket = stub().returns([ConnectionStatus.CONNECTED, socket]);
const useBook = stub().returns([[], [], {}, actions]);

const Home = proxyquire.noCallThru()('../../src/pages', {
  '../hooks/use-socket': {useSocket},
  '../hooks/use-book': {useBook},
}).default;

test.before(() => {
  render(<Home />);
});
test.after(cleanup);
test.beforeEach(() => {
  socket.close.reset();
  socket.open.reset();
  actions.unsubscribe.reset();
});

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

test('renders disconnected overlay if the document loses focus', (t) => {
  t.is(screen.queryByTestId('dc-overlay'), null);

  // Overwrite read-only property
  Object.defineProperty(document, 'hidden', {
    configurable: true,
    get: () => true,
  });
  fireEvent(document, new Event('visibilitychange'));

  t.not(screen.queryByTestId('dc-overlay'), null);
});

test('disconnected overlay stays visible even if the document re-gains focus', (t) => {
  // Overwrite read-only property
  Object.defineProperty(document, 'hidden', {
    configurable: true,
    get: () => true,
  });
  fireEvent(document, new Event('visibilitychange'));
  Object.defineProperty(document, 'hidden', {
    configurable: true,
    get: () => false,
  });
  fireEvent(document, new Event('visibilitychange'));

  t.not(screen.queryByTestId('dc-overlay'), null);
});

test('unsubscribes from the feed and closes the socket connection if document loses focus', (t) => {
  Object.defineProperty(document, 'hidden', {
    configurable: true,
    get: () => true,
  });
  fireEvent(document, new Event('visibilitychange'));

  t.true(actions.unsubscribe.called);
  t.true(socket.close.called);
});

test('renders a Reconnect button on the disconnect overlay that fires the reset action, and socket.open', (t) => {
  Object.defineProperty(document, 'hidden', {
    configurable: true,
    get: () => true,
  });
  fireEvent(document, new Event('visibilitychange'));

  userEvent.click(screen.getByText('Reconnect'));

  t.true(actions.reset.called);
  t.true(socket.open.called);

  t.is(screen.queryByText('Reconnect'), null);
});
