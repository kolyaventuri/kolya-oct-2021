import {Book, InputBook} from '../types/book';

// Fast deep-clone - avoids issues caused by pass by reference
const cloneBook = (input: Book): Book => input.map((items) => [...items]);

export const updateBook = (input: Book, newPrices: InputBook): Book => {
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
      book.push([price, size, -1]); // -1 - Placeholder, yet to be calculated
    }
  }

  book.sort(([priceA], [priceB]) => priceA - priceB);

  let total = 0;
  return book.map((entry) => {
    total += entry[1]; // Size
    entry[2] = total;
    return entry;
  });
};
