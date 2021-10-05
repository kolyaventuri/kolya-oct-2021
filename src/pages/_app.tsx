import * as React from 'react';
import {AppProps} from 'next/dist/shared/lib/router/router';
import '../styles/index.scss';

const App = ({Component, pageProps}: AppProps): JSX.Element => {
  return <Component {...pageProps} />;
};

export default App;
