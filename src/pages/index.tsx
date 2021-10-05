import React from 'react';
import Head from 'next/head';
import {OrderBook} from '../components/order-book';

const Home = (): JSX.Element => (
  <>
    <Head>
      <title>Order Book</title>
    </Head>
    <div>
      <OrderBook />
    </div>
  </>
);

export default Home;
