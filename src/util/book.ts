import {Book} from '../types/book';

// Fast deep-clone - avoids issues caused by pass by reference
const cloneBook = (input: Book): Book => input.map((items) => [...items]);

export const updateBook = (input: Book, newPrices: Book): Book => {
  const book = cloneBook(input);

  for (const [price, size] of newPrices) {
    const index = book.findIndex(([bidPrice]) => bidPrice === price);

    if (index > -1) {
      if (size > 0) {
        book[index][1] = size;
      } else {
        book.splice(index, 1);
      }
    } else if (size > 0) {
      book.push([price, size]);
    }
  }

  return book;
};
