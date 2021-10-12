import {Book} from '../types/book';

export const updateBook = (input: Book, newPrices: Book): Book => {
  const book = input.slice(); // Fast deep copy

  for (const [price, size] of newPrices) {
    const index = book.findIndex(([bidPrice]) => bidPrice === price);
    if (index > -1) {
      if (size > 0) {
        book[index][1] = size;
      } else {
        book.splice(index, 1);
      }
    } else if (index === -1 && price > 0) {
      book.push([price, size]);
    }
  }

  return book;
};
