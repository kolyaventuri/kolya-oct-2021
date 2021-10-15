import * as React from 'react';
import {Book, Spread} from '../types/book';

interface Props {
  bids: Book;
  asks: Book;
  spread: Spread;
  onToggle: () => void;
}

interface ListProps {
  book: Book;
  type: 'bid' | 'ask';
}

const BookList = ({book, type}: ListProps): JSX.Element => (
  <ul data-testid={`${type}-list`}>
    {book.map(([price, size, total]) => (
      <li key={`${type}-${price}`}>
        <span data-testid={`${type}-total`}>{total}</span>
        <span data-testid={`${type}-size`}>{size}</span>
        <span data-testid={`${type}-price`}>{price}</span>
      </li>
    ))}
  </ul>
);

export const OrderBook = ({
  bids,
  asks,
  spread,
  onToggle,
}: Props): JSX.Element => (
  <div data-testid="order-book">
    <div>
      <button type="button" onClick={onToggle}>
        Toggle Feed
      </button>
      <p>
        Spread: {spread.value} / {spread.percentage}
      </p>
      <h1>Bids</h1>
      <BookList book={bids} type="bid" />
    </div>
    <div>
      <h1>Asks</h1>
      <BookList book={asks} type="ask" />
    </div>
  </div>
);
