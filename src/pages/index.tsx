import * as React from 'react';
import Head from 'next/head';
import {OrderBook} from '../components/order-book';
import {Header} from '../components/header';
import {useSocket} from '../hooks/use-socket';
import {useBook} from '../hooks/use-book';

const Home = (): JSX.Element => {
  const [ticker, setTicker] = React.useState('XBTUSD');
  const [status, socket] = useSocket();
  const [bid, ask, spread] = useBook(ticker, socket);

  const onToggle = () => {
    let feed = 'XBTUSD';
    if (ticker === feed) {
      feed = 'ETHUSD';
    }

    setTicker(feed);
  }

  return (
    <>
      <Head>
        <title>Order Book</title>
      </Head>
      <div>
        <Header ticker={ticker} status={status} />
        <OrderBook bids={bid} asks={ask} spread={spread} onToggle={onToggle}/>
      </div>
    </>
  );
};

export default Home;
