import * as React from 'react';
import {FEED_ID} from '../constants/socket';

import {Book, Spread} from '../types/book';
import {updateBook} from '../util/book';
import {DataMessage, WrappedSocket} from '../util/socket';
import {useStatefulRef} from './use-stateful-ref';

type UseBookResult = [Book, Book, Spread];

export const useBook = (
  ticker: string,
  socket: WrappedSocket | undefined,
): UseBookResult => {
  const [bids, setBids, bidRef] = useStatefulRef<Book>([]);
  const [asks, setAsks, askRef] = useStatefulRef<Book>([]);
  const [spread] = React.useState<Spread>({value: '0.0', percentage: '0.0'});

  React.useEffect(() => {
    if (!socket) {
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

  return [bids, asks, spread];
};
