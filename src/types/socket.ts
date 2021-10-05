export interface SubscribeOptions {
  feed: string;
  product_ids: string[];
}

export interface UnsubscribeOptions extends SubscribeOptions {}
