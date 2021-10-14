import * as React from 'react';
import Head from 'next/head';
import {OrderBook} from '../components/order-book';
import {Header} from '../components/header';
import {useSocket} from '../hooks/use-socket';

const Home = (): JSX.Element => {
  const [ticker] = React.useState('XBTUSD');
  const [status] = useSocket();

  return (
    <>
      <Head>
        <title>Order Book</title>
      </Head>
      <div>
        <Header ticker={ticker} status={status} />
        <OrderBook bids={[]} asks={[]} />
      </div>
    </>
  );
};

export default Home;
