import * as React from 'react';
import NextDoc, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
  DocumentInitialProps,
} from 'next/document';

class Document extends NextDoc {
  static async getInitialProps(
    context: DocumentContext,
  ): Promise<DocumentInitialProps> {
    const initialProps = await NextDoc.getInitialProps(context);
    return {...initialProps};
  }

  render(): JSX.Element {
    return (
      <Html lang="en" className="h-screen">
        <Head />
        <body className="h-screen">
          <Main />
          <NextScript />
          <style jsx global>{`
            /* Resolves an issue preventing full-height pages */
            #__next {
              height: 100vh;
              display: flex;
              flex-flow: column;
            }
          `}</style>
        </body>
      </Html>
    );
  }
}

export default Document;
