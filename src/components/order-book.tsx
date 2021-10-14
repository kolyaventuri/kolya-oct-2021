import * as React from 'react';
import {Book} from '../types/book';

interface Props {
  bids: Book;
  asks: Book;
}

export const OrderBook = ({bids, asks}: Props): JSX.Element => (
  <div>
    <div>
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
