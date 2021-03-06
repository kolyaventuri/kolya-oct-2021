export type InputBook = Array<[number, number]>; // API response: Price, Size
export type Book = Array<[number, number, number]>; // Price, Size, Total

// String types to enforce deicmals
export interface Spread {
  value: string;
  percentage: string;
}
