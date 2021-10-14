import * as React from 'react';
import {FEED_ID} from '../constants/socket';

import {Book} from '../types/book';
import {DataMessage, WrappedSocket} from '../util/socket';

type UseBookResult = [Book, Book];

export const useBook = (
  ticker: string,
  socket: WrappedSocket | undefined,
): UseBookResult => {
  const [bids, setBids] = React.useState<Book>([]);
  const [asks, setAsks] = React.useState<Book>([]);

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
        const newBids = payload.bids;
        const newAsks = payload.asks;

        setBids(newBids);
        setAsks(newAsks);
      }
    });
  }, [ticker, socket]);

  return [bids, asks];
};
