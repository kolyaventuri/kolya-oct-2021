import React from 'react';
import Head from 'next/head';

class Home extends React.Component {
  render(): JSX.Element {
    return (
      <div>
        <Head>
          <title>Amplify App</title>
        </Head>
        <section className="section">
          <h1>Amplify App</h1>
        </section>
      </div>
    );
  }
}

export default Home;
