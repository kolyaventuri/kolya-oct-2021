import * as React from 'react';
import {FEED_ID} from '../constants/socket';
import {Book} from '../types/book';
import {ConnectionStatus} from '../types/socket';
import {updateBook as mutateBook} from '../util/book';
import {DataMessage, getSocket} from '../util/socket';

type UseSocketResult = [
  ConnectionStatus,
  Book, // Bid
  Book, // Ask
];

export const useSocket = (ticker: string): UseSocketResult => {
  const [status, setStatus] = React.useState(ConnectionStatus.OFFLINE);
  const [lastUpdate, setLastUpdate] = React.useState<number>(Date.now());
  const [currentBids, setBids] = React.useState<Array<[number, number]>>([]);
  const [currentAsks, setAsks] = React.useState<Array<[number, number]>>([]);

  React.useEffect(() => {
    const socket = getSocket();

    socket.on('open', () => {
      setStatus(ConnectionStatus.CONNECTING);

      socket.send('subscribe', {
        feed: FEED_ID,
        product_ids: [ticker],
      });
    });

    socket.on('close', () => {
      setStatus(ConnectionStatus.OFFLINE);
    });

    socket.on('message', (event) => {
      if (event.type === 'subscribed') {
        setStatus(ConnectionStatus.CONNECTED);
        return;
      }

      if (event.type === 'data') {
        const tDelta = Date.now() - lastUpdate;
        if (tDelta < 250) {
          return;
        }

        setLastUpdate(Date.now());

        const {bids, asks} = event.payload as DataMessage['payload'];
        mutateBook(currentBids, bids);
        mutateBook(currentAsks, asks);

        setBids(currentBids);
        setAsks(currentAsks);
      }
    });
  }, [ticker]);

  return [status, currentBids, currentAsks];
};
