import type { RuleProperties } from 'json-rules-engine';
import { BOOLEAN_EXPRESSION, RULE_OPERATOR, EVENT_TYPE } from './utils/rule-engine';

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
    id: '6db94ec1-e0be-4958-af76-22353467c22f',
    name: 'Small Pizza',
    description: '10\'\' Pizza for one person',
    size: PizzaSize.SMALL,
    price: 11.99,
    currency: CurrencySymbol.AUD,
    image: '/products/pizza/1.jpg',
    category: 'PIZZA',
  },
  {
    id: '5e6ca1f4-a7b8-400e-8958-c5cbb38d3bb0',
    name: 'Medium Pizza',
    description: '12\'\' Pizza for two persons',
    size: PizzaSize.MEDIUM,
    price: 15.99,
    currency: CurrencySymbol.AUD,
    image: '/products/pizza/1.jpg',
    category: 'PIZZA',
  },
  {
    id: '2fc55532-82cd-461d-aed5-2a7b941f40ab',
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

export const SampleRuleEngines: RuleProperties[] = [
  {
    name: 'microsoft',
    conditions: {
      [BOOLEAN_EXPRESSION.ALL]: [
        {
          fact: 'voucherCode',
          operator: RULE_OPERATOR.EQUAL,
          value: 'Microsoft',
        },
        {
          fact: 'size',
          operator: RULE_OPERATOR.EQUAL,
          value: PizzaSize.SMALL,
        },
        {
          fact: 'quantity',
          operator: RULE_OPERATOR.GREATER_THAN_INCLUSIVE,
          value: 3,
        },
      ]
    },
    event: {
      type: EVENT_TYPE.DEAL,
      params: {
        size: PizzaSize.SMALL,
        buy: 3,
        deal: 2,
      }
    }
  },
  {
    name: 'facebook',
    conditions: {
      [BOOLEAN_EXPRESSION.ALL]: [
        {
          fact: 'voucherCode',
          operator: RULE_OPERATOR.EQUAL,
          value: 'Facebook',
        },
        {
          fact: 'size',
          operator: RULE_OPERATOR.EQUAL,
          value: PizzaSize.MEDIUM,
        },
        {
          fact: 'quantity',
          operator: RULE_OPERATOR.GREATER_THAN_INCLUSIVE,
          value: 5,
        },
      ]
    },
    event: {
      type: EVENT_TYPE.DEAL,
      params: {
        size: PizzaSize.MEDIUM,
        buy: 5,
        deal: 4,
      }
    }
  },
  {
    name: 'amazon',
    conditions: {
      [BOOLEAN_EXPRESSION.ALL]: [
        {
          fact: 'voucherCode',
          operator: RULE_OPERATOR.EQUAL,
          value: 'Amazon',
        },
        {
          fact: 'size',
          operator: RULE_OPERATOR.EQUAL,
          value: PizzaSize.LARGE,
        },
        {
          fact: 'quantity',
          operator: RULE_OPERATOR.GREATER_THAN_INCLUSIVE,
          value: 1,
        },
      ]
    },
    event: {
      type: EVENT_TYPE.DISCOUNT,
      params: {
        size: PizzaSize.LARGE,
        price: 19.99,
        currency: CurrencySymbol.AUD,
      }
    }
  }
];

type WhereInput = { where: { id: { in: Readonly<string[]> } } };
type WhereName = { where: { name: string } };

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
  rule: {
    findMany: (whereInput?: WhereName) => {
      console.log('rule#findMany');
      if (whereInput) {
        return SampleRuleEngines.filter((rule) => whereInput.where.name === rule.name);
      }

      return SampleRuleEngines;
    },
  }
};
