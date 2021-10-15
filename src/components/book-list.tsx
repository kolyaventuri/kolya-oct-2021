import * as React from 'react';
import cx from 'classnames';
import {Book} from '../types/book';

type BookType = 'bid' | 'ask';

const textClass = 'inline flex-grow text-right px-10 w-1/3';

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
    <li className="flex border-b-2 border-gray-800 py-1">
      {names.map((name) => (
        <span
          key={`label-${name}-${type}`}
          className={cx('uppercase font-semibold text-gray-500', textClass)}
        >
          {name}
        </span>
      ))}
    </li>
  );
};

const color = {
  bid: 'green-400',
  ask: 'red-500',
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
      className={cx(textClass, `text-${color[type]}`)}
    >
      {price}
    </span>,
  ];
  if (type === 'ask' || isMobile) {
    cells.reverse();
  }

  return cells;
};

interface ListProps {
  book: Book;
  maxSize: number;
  type: BookType;
  isMobile: boolean;
}

export const BookList = ({
  book,
  type,
  isMobile,
  maxSize,
}: ListProps): JSX.Element => {
  const side = type === 'ask' || isMobile ? 'left' : 'right';

  return (
    <ul data-testid={`${type}-list`}>
      {!isMobile && <BookHeader type={type} isMobile={isMobile} />}
      {book.map(([price, size, total]) => {
        const width = `${(total / maxSize) * 100}%`;
        return (
          <li
            key={`${type}-${price}`}
            className="flex relative"
            data-testid="entry"
          >
            <div
              className={cx(
                `absolute ${side}-0 h-full opacity-25 bg-${color[type]}`,
              )}
              style={{width}}
              data-testid="entry-bg"
            />
            {getCells({type, isMobile, price, size, total})}
          </li>
        );
      })}
    </ul>
  );
};
