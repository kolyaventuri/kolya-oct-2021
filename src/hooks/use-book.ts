import * as React from 'react';
import {FEED_ID} from '../constants/socket';

import {Book, Spread} from '../types/book';
import {updateBook} from '../util/book';
import {DataMessage, WrappedSocket} from '../util/socket';
import {useStatefulRef} from './use-stateful-ref';

const initialSpread: Spread = {
  value: '0.0',
  percentage: '0.00%',
};

const calculateSpread = (bid: Book, ask: Book): Spread => {
  if (bid.length === 0 || ask.length === 0) {
    return initialSpread;
  }

  const topBid = bid[0][0];
  const topAsk = ask[0][0];

  const value = Math.abs(topBid - topAsk);
  const percentage = (value / topBid) * 100;
  const precision = Math.floor(value).toString(10).length + 1;

  return {
    value: value.toPrecision(precision),
    percentage: percentage.toFixed(2) + '%',
  };
};

interface Actions {
  subscribe: () => void;
  unsubscribe: () => void;
  reset: () => void;
}
type UseBookResult = [Book, Book, Spread, Actions];

export const useBook = (
  ticker: string,
  socket: WrappedSocket | undefined,
): UseBookResult => {
  const [previousTicker, setPreviousTicker] = React.useState(ticker);
  const [bids, setBids, bidRef] = useStatefulRef<Book>([]);
  const [asks, setAsks, askRef] = useStatefulRef<Book>([]);
  const [spread, setSpread] = React.useState<Spread>(initialSpread);
  const actions: Actions = {
    subscribe() {
      socket?.send('subscribe', {
        feed: FEED_ID,
        product_ids: [`PI_${ticker}`],
      });
    },
    unsubscribe() {
      socket?.send('unsubscribe', {
        feed: FEED_ID,
        product_ids: [`PI_${previousTicker}`],
      });
    },
    reset() {
      setBids([]);
      setAsks([]);
      setSpread(initialSpread);
    },
  };

  React.useEffect(() => {
    if (!socket) {
      return;
    }

    if (ticker !== previousTicker) {
      actions.unsubscribe();
      actions.subscribe();

      setPreviousTicker(ticker);
      actions.reset();
    }

    socket.on('open', () => {
      actions.subscribe();
    });

    socket.on('message', (event) => {
      if (event.type === 'data') {
        const {payload} = event as DataMessage;
        const newBids = updateBook({
          input: bidRef.current,
          newPrices: payload.bids,
        });
        const newAsks = updateBook({
          input: askRef.current,
          newPrices: payload.asks,
          smallToLarge: true,
        });

        setBids(newBids);
        setAsks(newAsks);
        setSpread(calculateSpread(newBids, newAsks));
      }
    });
  }, [ticker, socket]);

  return [bids, asks, spread, actions];
};
