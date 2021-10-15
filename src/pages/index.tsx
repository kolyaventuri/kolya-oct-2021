import * as React from 'react';
import Head from 'next/head';
import {OrderBook} from '../components/order-book';
import {Header} from '../components/header';
import {DisconnectOverlay} from '../components/disconnect-overlay';
import {useSocket} from '../hooks/use-socket';
import {useBook} from '../hooks/use-book';
import {Footer} from '../components/footer';

const Home = (): JSX.Element => {
  const [ticker, setTicker] = React.useState('XBTUSD');
  const [overlayVisible, setOverlayVisible] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [status, socket] = useSocket();
  const [bid, ask, spread, actions] = useBook(ticker, socket);

  const checkMobile = () => {
    const mobile = window.matchMedia('screen and (max-width: 768px)').matches;
    setIsMobile(mobile);
  };

  React.useEffect(() => {
    checkMobile();

    document.addEventListener('visibilitychange', () => {
      if (!overlayVisible && document.hidden) {
        setOverlayVisible(true);
        if (socket?.isOpen) {
          actions.unsubscribe();
          socket.close();
        }
      }
    });

    window.addEventListener('resize', () => {
      checkMobile();
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
      <div className="flex flex-col min-h-screen">
        <Header
          ticker={ticker}
          status={status}
          spread={spread}
          isMobile={isMobile}
        />
        <OrderBook bids={bid} asks={ask} spread={spread} isMobile={isMobile} />
        <Footer onToggle={onToggle} />
      </div>
      {overlayVisible && <DisconnectOverlay onReconnectClick={reconnect} />}
    </>
  );
};

export default Home;
