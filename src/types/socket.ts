export interface SubscribeOptions {
  feed: string;
  product_ids: string[];
}

export interface UnsubscribeOptions extends SubscribeOptions {}

export const enum ConnectionStatus {
  OFFLINE = 'OFFLINE',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
}
