import * as React from 'react';
import {Book} from '../types/book';

interface ListProps {
  book: Book;
  type: 'bid' | 'ask';
  isMobile: boolean;
}

export const BookList = ({book, type, isMobile: _}: ListProps): JSX.Element => (
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
