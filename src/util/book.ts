import {Book, InputBook} from '../types/book';

// Fast deep-clone - avoids issues caused by pass by reference
const cloneBook = (input: Book): Book => input.map((items) => [...items]);

interface UpdateBookArgs {
  input: Book;
  newPrices: InputBook;
  smallToLarge?: boolean;
}

export const updateBook = ({
  input,
  newPrices,
  smallToLarge = false,
}: UpdateBookArgs): Book => {
  if (newPrices.length === 0) {
    return input;
  }

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

  if (smallToLarge) {
    book.sort(([priceA], [priceB]) => priceA - priceB);
  } else {
    book.sort(([priceA], [priceB]) => priceB - priceA);
  }

  let total = 0;
  return book.map((entry) => {
    total += entry[1]; // Size
    entry[2] = total;
    return entry;
  });
};
