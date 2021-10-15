import * as React from 'react';
import {Book, Spread as SpreadType} from '../types/book';
import {BookList} from './book-list';
import {Spread} from './spread';

interface Props {
  bids: Book;
  asks: Book;
  spread: SpreadType;
  onToggle: () => void;
  isMobile: boolean;
}

export const OrderBook = ({
  bids,
  asks,
  spread,
  onToggle,
  isMobile,
}: Props): JSX.Element => {
  const maxSize = Math.max(...[...bids, ...asks].map((items) => items[2]));
  return (
    <div className="w-full">
      <div
        data-testid="order-book"
        className="flex flex-col lg:flex-row text-white"
      >
        <div className="flex-grow">
          <BookList
            book={bids}
            type="bid"
            isMobile={isMobile}
            maxSize={maxSize}
          />
        </div>
        {isMobile && (
          <div className="flex-grow">
            <Spread data={spread} />
          </div>
        )}
        <div className="flex-grow">
          <BookList
            book={asks}
            type="ask"
            isMobile={isMobile}
            maxSize={maxSize}
          />
        </div>
      </div>
      <button type="button" onClick={onToggle}>
        Toggle Feed
      </button>
    </div>
  );
};
