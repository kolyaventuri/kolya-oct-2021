import test from 'ava';
import {stub} from 'sinon';
import {act, renderHook} from '@testing-library/react-hooks';

import {FEED_ID} from '../../src/constants/socket';
import {useBook} from '../../src/hooks/use-book';
import {WrappedSocket} from '../../src/util/socket';

import initData from '../../fixtures/pi_xbtusd.init.json';
import runningData from '../../fixtures/pi_xbtusd.json';

// https://stackoverflow.com/a/46634877/3685123
type Mutable<T> = {-readonly [P in keyof T]: T[P]};

type CallbackFn = (...args: any[]) => void;
const getStubs = () => {
  const events: Record<string, CallbackFn> = {};
  const actions = {
    send: stub(),
    close: stub(),
    open: stub(),
  };
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const socket = {
    on(event: string, callback: (...args: any[]) => void) {
      events[`on${event}`] = callback;
    },
    send(...args: any[]) {
      actions.send(...args);
    },
    close() {},
    open() {},
    isOpen: false,
  } as WrappedSocket;

  return {events, actions, socket};
};

test('#useBook returns an initially empty bid and ask array', (t) => {
  const {result} = renderHook(() => useBook('ticker', undefined));
  const [bid, ask] = result.current;

  t.deepEqual(bid, []);
  t.deepEqual(ask, []);
});

test('#useBook does not error out, and does nothing yet, if the socket is not yet ready', (t) => {
  const {result} = renderHook(() => useBook('ticker', undefined));

  t.is(result.error, undefined);
});

test('#useBook attempts to subscribe to the ticker after socket is open', (t) => {
  const {actions, socket, events} = getStubs();
  socket.on('open', () => {
    (socket as Mutable<WrappedSocket>).isOpen = true;
  });

  renderHook(() => useBook('ticker', socket));

  act(() => {
    events.onopen();
  });

  t.true(
    actions.send.calledWith('subscribe', {
      feed: FEED_ID,
      product_ids: ['PI_ticker'],
    }),
  );
});

test('#useBook sets the bid and ask along with a data event', (t) => {
  const {events, socket} = getStubs();
  const {result} = renderHook(() => useBook('ticker', socket));

  t.deepEqual(result.current[0], []);
  t.deepEqual(result.current[1], []);

  const event = {
    type: 'data',
    payload: {
      bids: [
        [1, 1],
        [2, 2],
      ],
      asks: [
        [3, 1],
        [4, 2],
      ],
    },
  };

  act(() => {
    events.onmessage(event);
  });

  t.deepEqual(result.current[0], [
    [2, 2, 2],
    [1, 1, 3],
  ]);
  t.deepEqual(result.current[1], [
    [3, 1, 1],
    [4, 2, 3],
  ]);
});

test('#useBook can update the bid and ask along with a data event', (t) => {
  const {events, socket} = getStubs();
  const {result} = renderHook(() => useBook('ticker', socket));

  t.deepEqual(result.current[0], []);
  t.deepEqual(result.current[1], []);

  const event = {
    type: 'data',
    payload: {
      bids: [
        [1, 1],
        [2, 2],
      ],
      asks: [
        [3, 1],
        [4, 2],
      ],
    },
  };

  const event2 = {
    type: 'data',
    payload: {
      bids: [[1, 3]],
      asks: [[4, 0]],
    },
  };
  act(() => {
    events.onmessage(event);
  });
  act(() => {
    events.onmessage(event2);
  });

  t.deepEqual(result.current[0], [
    [2, 2, 2],
    [1, 3, 5],
  ]);
  t.deepEqual(result.current[1], [[3, 1, 1]]);
});

test('#useBook will remove 0-size items', (t) => {
  const {events, socket} = getStubs();
  const {result} = renderHook(() => useBook('ticker', socket));

  t.deepEqual(result.current[0], []);
  t.deepEqual(result.current[1], []);

  const event = {
    type: 'data',
    payload: {
      bids: initData[2].bids,
      asks: initData[2].asks,
    },
  };

  const event2 = {
    type: 'data',
    payload: {
      bids: runningData[0].bids,
      asks: runningData[0].asks,
    },
  };
  act(() => {
    events.onmessage(event);
  });
  act(() => {
    events.onmessage(event2);
  });

  const zeroBids = result.current[0].filter(([, size]) => size === 0);
  const zeroAsks = result.current[1].filter(([, size]) => size === 0);
  t.is(
    zeroBids.length,
    0,
    `Found the folloing 0-size bids: ${JSON.stringify(zeroBids)}`,
  );
  t.is(
    zeroAsks.length,
    0,
    `Found the folloing 0-size asks: ${JSON.stringify(zeroAsks)}`,
  );
});

test('#useBook calculates the spread', (t) => {
  const {events, socket} = getStubs();
  const {result} = renderHook(() => useBook('ticker', socket));

  t.deepEqual(result.current[0], []);
  t.deepEqual(result.current[1], []);

  const event = {
    type: 'data',
    payload: {
      bids: [
        [34_062.5, 1],
        [34_052.5, 2],
      ],
      asks: [
        [34_079.5, 1],
        [34_094, 2],
      ],
    },
  };

  act(() => {
    events.onmessage(event);
  });

  t.deepEqual(result.current[2], {
    value: '17.0',
    percentage: '0.05%',
  });
});

test('#useBook calculates smaller spreads', (t) => {
  const {events, socket} = getStubs();
  const {result} = renderHook(() => useBook('ticker', socket));

  t.deepEqual(result.current[0], []);
  t.deepEqual(result.current[1], []);

  const event = {
    type: 'data',
    payload: {
      bids: [
        [34_062.5, 1],
        [34_052.5, 2],
      ],
      asks: [
        [34_067.5, 1],
        [34_094, 2],
      ],
    },
  };

  act(() => {
    events.onmessage(event);
  });

  t.deepEqual(result.current[2], {
    value: '5.0',
    percentage: '0.01%',
  });
});

test('#useBook calculates large spreads', (t) => {
  const {events, socket} = getStubs();
  const {result} = renderHook(() => useBook('ticker', socket));

  t.deepEqual(result.current[0], []);
  t.deepEqual(result.current[1], []);

  const event = {
    type: 'data',
    payload: {
      bids: [
        [34_062.5, 1],
        [34_052.5, 2],
      ],
      asks: [
        [34_167.5, 1],
        [34_194, 2],
      ],
    },
  };

  act(() => {
    events.onmessage(event);
  });

  t.deepEqual(result.current[2], {
    value: '105.0',
    percentage: '0.31%',
  });
});

test('#useBook unsubscribes from the old ticker, and to the new one, if the ticker changes', (t) => {
  const {actions, socket, events} = getStubs();
  socket.on('open', () => {
    (socket as Mutable<WrappedSocket>).isOpen = true;
  });

  const {rerender} = renderHook(({ticker}) => useBook(ticker, socket), {
    initialProps: {
      ticker: 'ticker',
    },
  });

  act(() => {
    events.onopen();
    rerender({ticker: 'newTicker'});
  });

  t.true(
    actions.send.calledWith('unsubscribe', {
      feed: FEED_ID,
      product_ids: ['PI_ticker'],
    }),
  );

  t.true(
    actions.send.calledWith('subscribe', {
      feed: FEED_ID,
      product_ids: ['PI_newTicker'],
    }),
  );
});

test('#useBook clears bids and asks if unsubscribing', (t) => {
  const {socket, events} = getStubs();

  const {rerender, result} = renderHook(({ticker}) => useBook(ticker, socket), {
    initialProps: {
      ticker: 'ticker',
    },
  });

  act(() => {
    events.onmessage({
      type: 'data',
      payload: {
        bids: [
          [34_062.5, 1],
          [34_052.5, 2],
        ],
        asks: [
          [34_167.5, 1],
          [34_194, 2],
        ],
      },
    });
    rerender({ticker: 'newTicker'});
  });

  t.deepEqual(result.current[0], []);
  t.deepEqual(result.current[1], []);
  t.deepEqual(result.current[2], {value: '0.0', percentage: '0.00%'});
});

test('#useBook returns an actions object, that can unsubscribe to the feed', (t) => {
  const {socket, actions: actionStubs} = getStubs();
  const {result} = renderHook(() => useBook('ticker', socket));

  const actions = result.current[3];
  t.is(typeof actions, 'object');

  const {unsubscribe} = actions;

  act(() => {
    unsubscribe();
  });

  t.true(
    actionStubs.send.calledWith('unsubscribe', {
      feed: FEED_ID,
      product_ids: [`PI_ticker`],
    }),
  );
});

test('#useBook returns an actions object, that can subscribe to the feed', (t) => {
  const {socket, actions: actionStubs} = getStubs();
  const {result} = renderHook(() => useBook('ticker', socket));

  const actions = result.current[3];
  t.is(typeof actions, 'object');

  const {subscribe} = actions;

  act(() => {
    subscribe();
  });

  t.true(
    actionStubs.send.calledWith('subscribe', {
      feed: FEED_ID,
      product_ids: [`PI_ticker`],
    }),
  );
});

test('#useBook returns an actions object, that can reset the data', (t) => {
  const {socket, events} = getStubs();

  const {result} = renderHook(() => useBook('ticker', socket));
  const actions = result.current[3];

  act(() => {
    events.onmessage({
      type: 'data',
      payload: {
        bids: [
          [34_062.5, 1],
          [34_052.5, 2],
        ],
        asks: [
          [34_167.5, 1],
          [34_194, 2],
        ],
      },
    });

    actions.reset();
  });

  t.deepEqual(result.current[0], []);
  t.deepEqual(result.current[1], []);
  t.deepEqual(result.current[2], {value: '0.0', percentage: '0.00%'});
});
