import { v4 as uuidv4 } from 'uuid';

export enum PizzaSize {
  SMALL = 'S',
  MEDIUM = 'M',
  LARGE = 'L',
}

enum CurrencySymbol {
  AUD = '$',
  USD = '$',
}

export interface Product {
  id: string;
  size: PizzaSize;
  name: string;
  description: string;
  image?: string;
  price: number;
  currency: CurrencySymbol;
  category?: string;
}

export const products: Product[] = [
  {
    id: uuidv4(),
    name: 'Small Pizza',
    description: '10\'\' Pizza for one person',
    size: PizzaSize.SMALL,
    price: 11.99,
    currency: CurrencySymbol.AUD,
    image: '/products/pizza/1.jpg',
    category: 'PIZZA',
  },
  {
    id: uuidv4(),
    name: 'Medium Pizza',
    description: '12\'\' Pizza for two persons',
    size: PizzaSize.MEDIUM,
    price: 15.99,
    currency: CurrencySymbol.AUD,
    image: '/products/pizza/1.jpg',
    category: 'PIZZA',
  },
  {
    id: uuidv4(),
    name: 'Large Pizza',
    description: '15\'\' Pizza for four persons',
    size: PizzaSize.LARGE,
    price: 21.99,
    currency: CurrencySymbol.AUD,
    image: '/products/pizza/1.jpg',
    category: 'PIZZA',
  },
];

export interface Cart {
  id: string;
  size: PizzaSize;
  name: string;
  description: string;
  image?: string;
  price: number;
  currency: CurrencySymbol;
}

type WhereInput = { where: { id: { in: Readonly<string[]> } } };

/**
 * This mimics an ORM in the style of Prisma. `db.product.findMany` logs
 * 'product#findMany' to demonstrate that it is only called once, for demo purposes.
 *
 * https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#findmany
 */
export const db = {
  product: {
    findMany: (whereInput?: WhereInput) => {
      console.log('product#findMany');
      if (whereInput) {
        return products.filter((product) => whereInput.where.id.in.includes(product.id));
      }

      return products;
    },
  },
};
