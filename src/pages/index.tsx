import * as React from 'react';
import Head from 'next/head';
import {OrderBook} from '../components/order-book';
import {Header} from '../components/header';
import {DisconnectOverlay} from '../components/disconnect-overlay';
import {useSocket} from '../hooks/use-socket';
import {useBook} from '../hooks/use-book';

const Home = (): JSX.Element => {
  const [ticker, setTicker] = React.useState('XBTUSD');
  const [overlayVisible, setOverlayVisible] = React.useState(false);
  const [isMobile] = React.useState(false);
  const [status, socket] = useSocket();
  const [bid, ask, spread, actions] = useBook(ticker, socket);

  React.useEffect(() => {
    document.addEventListener('visibilitychange', () => {
      if (!overlayVisible && document.hidden) {
        setOverlayVisible(true);
        if (socket?.isOpen) {
          actions.unsubscribe();
          socket.close();
        }
      }
    });
  });

  const onToggle = () => {
    let feed = 'XBTUSD';
    if (ticker === feed) {
      feed = 'ETHUSD';
    }

    setTicker(feed);
  };

  const reconnect = () => {
    actions.reset();
    socket?.open();
    setOverlayVisible(false);
  };

  return (
    <>
      <Head>
        <title>Order Book</title>
      </Head>
      <div>
        <Header
          ticker={ticker}
          status={status}
          spread={spread}
          isMobile={isMobile}
        />
        <OrderBook
          bids={bid}
          asks={ask}
          spread={spread}
          isMobile={isMobile}
          onToggle={onToggle}
        />
        {overlayVisible && <DisconnectOverlay onReconnectClick={reconnect} />}
      </div>
    </>
  );
};

export default Home;
