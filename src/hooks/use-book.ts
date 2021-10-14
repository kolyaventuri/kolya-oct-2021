import * as React from 'react';
import {FEED_ID} from '../constants/socket';

import {Book} from '../types/book';
import {updateBook} from '../util/book';
import {DataMessage, WrappedSocket} from '../util/socket';
import {useStatefulRef} from './use-stateful-ref';

type UseBookResult = [Book, Book];

export const useBook = (
  ticker: string,
  socket: WrappedSocket | undefined,
): UseBookResult => {
  const [bids, setBids, bidRef] = useStatefulRef<Book>([]);
  const [asks, setAsks, askRef] = useStatefulRef<Book>([]);

  React.useEffect(() => {
    if (!socket || socket?.isOpen) {
      return;
    }

    socket.on('open', () => {
      socket.send('subscribe', {
        feed: FEED_ID,
        product_ids: [`PI_${ticker}`],
      });
    });

    socket.on('message', (event) => {
      if (event.type === 'data') {
        const {payload} = event as DataMessage;
        const newBids = updateBook(bidRef.current, payload.bids);
        const newAsks = updateBook(askRef.current, payload.asks);

        setBids(newBids);
        setAsks(newAsks);
      }
    });
  }, [ticker, socket]);

  return [bids, asks];
};
