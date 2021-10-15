import * as React from 'react';
import cx from 'classnames';
import {Book} from '../types/book';

type BookType = 'bid' | 'ask';
interface ListProps {
  book: Book;
  type: BookType;
  isMobile: boolean;
}

const textClass = 'inline flex-grow text-right px-10';

const order = {
  bid: ['total', 'size', 'price'],
  ask: ['price', 'size', 'total'],
};
const BookHeader = ({
  type,
  isMobile,
}: {
  type: BookType;
  isMobile: boolean;
}): JSX.Element => {
  const names = order[type === 'ask' || isMobile ? 'ask' : 'bid'];

  return (
    <li className="flex">
      {names.map((name) => (
        <span
          key={`label-${name}-${type}`}
          className={cx('uppercase', textClass)}
        >
          {name}
        </span>
      ))}
    </li>
  );
};

const textColor = {
  bid: 'text-green-400',
  ask: 'text-red-500',
};

interface RowProps {
  type: BookType;
  isMobile: boolean;
  price: number;
  size: number;
  total: number;
}
const getCells = ({
  type,
  isMobile,
  price,
  size,
  total,
}: RowProps): JSX.Element[] => {
  const cells = [
    <span
      key={`${type}-total-${price}`}
      data-testid={`${type}-total`}
      className={textClass}
    >
      {total}
    </span>,
    <span
      key={`${type}-size-${price}`}
      data-testid={`${type}-size`}
      className={textClass}
    >
      {size}
    </span>,
    <span
      key={`${type}-price-${price}`}
      data-testid={`${type}-price`}
      className={cx(textClass, textColor[type])}
    >
      {price}
    </span>,
  ];
  if (type === 'ask' || isMobile) {
    cells.reverse();
  }

  return cells;
};

export const BookList = ({book, type, isMobile}: ListProps): JSX.Element => (
  <ul data-testid={`${type}-list`}>
    {!isMobile && <BookHeader type={type} isMobile={isMobile} />}
    {book.map(([price, size, total]) => (
      <li key={`${type}-${price}`} className="flex">
        {getCells({type, isMobile, price, size, total})}
      </li>
    ))}
  </ul>
);
