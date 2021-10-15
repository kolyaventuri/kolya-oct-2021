import * as React from 'react';
import {Book, Spread as SpreadType} from '../types/book';
import {BookList} from './book-list';
import {Spread} from './spread';

interface Props {
  bids: Book;
  asks: Book;
  spread: SpreadType;
  isMobile: boolean;
}

export const OrderBook = ({
  bids,
  asks,
  spread,
  isMobile,
}: Props): JSX.Element => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const lineRef = React.useRef<HTMLLIElement>(null);
  const maxRows = React.useRef<number>(0);

  React.useEffect(() => {
    const {current: item} = lineRef;
    if (maxRows.current === 0 && item && containerRef.current) {
      const rowHeight = item.offsetHeight;
      const containerHeight = containerRef.current.offsetHeight;
      maxRows.current = Math.floor(containerHeight / rowHeight);
    }
  }, [lineRef.current, maxRows.current, containerRef.current]);

  // TODO: Clean this calculation up
  const visibleBids = bids.slice(0, maxRows.current || 1);
  const visibleAsks = asks.slice(0, maxRows.current || 1);
  const maxSize = Math.max(
    ...[...visibleAsks, ...visibleBids].map((items) => items[2]),
  );
  return (
    <div
      ref={containerRef}
      className="w-full flex-grow overflow-hidden border-gray-800 border-b-2"
    >
      <div
        data-testid="order-book"
        className="flex flex-col lg:flex-row text-white"
      >
        <div className="flex-grow">
          <BookList
            book={visibleBids}
            type="bid"
            isMobile={isMobile}
            maxSize={maxSize}
            lineRef={lineRef} // Only required on one size since the components are identical
          />
        </div>
        {isMobile && (
          <div className="flex-grow">
            <Spread data={spread} />
          </div>
        )}
        <div className="flex-grow">
          <BookList
            book={visibleAsks}
            type="ask"
            isMobile={isMobile}
            maxSize={maxSize}
          />
        </div>
      </div>
    </div>
  );
};
