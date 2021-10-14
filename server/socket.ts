/*
 * (kolyaventuri): Extremely rudimentary websocket server, designed
 * to mimic the CryptoFacilities WS endpoint, for testing purposes only.
 *
 * Not to be used for true-to-life data, as it's just going to spit back
 * the same data in a loop.
 */

/* TODO: Eslint (via XO) is disabled for this file due to seemingly un-resolvable indentation issues.
 * Prettier keeps fighting the inter and I need to look into why. */

import {WebSocket, WebSocketServer} from 'ws';

import xbtInit from '../fixtures/pi_xbtusd.init.json';
import xbtRunning from '../fixtures/pi_xbtusd.json';

const dataSets: Record<
  string,
  {
    init: typeof xbtInit;
    running: typeof xbtRunning;
  }
> = {
  PI_XBTUSD: {
    init: xbtInit,
    running: xbtRunning,
  },
};

const wss = new WebSocketServer({port: 8080});

const connections: Record<
  string,
  {
    socket: WebSocket;
    subscriptions: string[];
    next: number;
  }
> = {};

wss.on('connection', (ws) => {
  const id = Math.random().toString();
  connections[id] = {
    socket: ws,
    subscriptions: [],
    next: 0,
  };
  console.log('WS Connection Established');

  ws.on('message', (message) => {
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    const data = JSON.parse(message.toString()) as Record<string, any>;

    if (data.event === 'subscribe') {
      // (kolyaventuri): Send initial data
      for (const pid of data.product_ids as string[]) {
        for (const data of dataSets[pid].init) {
          connections[id].socket.send(JSON.stringify(data));
        }
      }

      connections[id].subscriptions.push(...(data.product_ids as string[]));
    } else if (data.event === 'unsubscribe') {
      for (const key of data.product_ids as string[]) {
        const i = connections[id].subscriptions.indexOf(key);
        if (i > -1) {
          connections[id].subscriptions.splice(i, 1);
        }
      }
    }
  });
});

setInterval(() => {
  for (const conn of Object.values(connections)) {
    for (const sub of conn.subscriptions) {
      if (dataSets[sub]) {
        const index = conn.next;

        console.log('--Send item', index)
        conn.socket.send(JSON.stringify(dataSets[sub].running[index]));
        conn.next += 1;
        if (conn.next >= dataSets[sub].running.length) {
          conn.next = 0;
        }
      }
    }
  }
}, 100);

wss.on('listening', () => {
  console.log('Local socket server listening on 8080');
});
