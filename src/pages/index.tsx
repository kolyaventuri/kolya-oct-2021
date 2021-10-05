import * as React from 'react';
import Head from 'next/head';
import {OrderBook} from '../components/order-book';
import {Header} from '../components/header';

const Home = (): JSX.Element => {
  const [ticker] = React.useState('XBTUSD');

  return (
    <>
      <Head>
        <title>Order Book</title>
      </Head>
      <div>
        <Header ticker={ticker} />
        <OrderBook />
      </div>
    </>
  );
};

export default Home;
