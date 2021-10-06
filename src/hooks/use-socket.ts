import * as React from 'react';
import {FEED_ID} from '../constants/socket';
import {ConnectionStatus} from '../types/socket';
import {DataMessage, getSocket} from '../util/socket';

type UseSocketResult = [
  ConnectionStatus,
  Array<[number, number]>, // Bid
  Array<[number, number]>, // Ask
];

export const useSocket = (ticker: string): UseSocketResult => {
  const socket = React.useMemo(() => getSocket(), []);
  const [status, setStatus] = React.useState(ConnectionStatus.OFFLINE);
  const [bid, setBid] = React.useState<Array<[number, number]>>([]);
  const [ask, setAsk] = React.useState<Array<[number, number]>>([]);

  React.useEffect(() => {
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
        const {bid, ask} = event.payload as DataMessage['payload'];

        setBid(bid);
        setAsk(ask);
      }
    });
  }, [ticker, socket]);

  return [status, bid, ask];
};
