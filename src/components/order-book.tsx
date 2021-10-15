import * as React from 'react';
import {Book, Spread} from '../types/book';

interface Props {
  bids: Book;
  asks: Book;
  spread: Spread;
}

export const OrderBook = ({bids, asks, spread}: Props): JSX.Element => (
  <div data-testid="order-book">
    <div>
      <p>
        Spread: {spread.value} / {spread.percentage}
      </p>
      <h1>Bids</h1>
      <ul>
        {bids.map(([price, size]) => (
          <li key={`bid-${price}`}>
            {price} / {size}
          </li>
        ))}
      </ul>
    </div>
    <div>
      <h1>Asks</h1>
      <ul>
        {asks.map(([price, size]) => (
          <li key={`ask-${price}`}>
            {price} / {size}
          </li>
        ))}
      </ul>
    </div>
  </div>
);
