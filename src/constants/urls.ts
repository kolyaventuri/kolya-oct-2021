/* eslint-disable node/prefer-global/process */
const prodUrl = 'wss://www.cryptofacilities.com/ws/v1';
const url = process.env.NEXT_PUBLIC_WS_HOST ?? prodUrl;
export const BOOK_URL = process.env.NEXT_PUBLIC_ENV === 'local' ? url : prodUrl;
