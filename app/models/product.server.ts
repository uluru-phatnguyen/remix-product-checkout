import { db } from '../data.server';

export async function getAllProducts() {
  return await db.product.findMany();
}

export async function getProducts(ids: Readonly<string[]>) {
  return await db.product.findMany({
    where: {
      id: {
        in: ids
      },
    }
  });
}

export async function getProduct(id: string) {
  const products = await db.product.findMany({
    where: {
      id: {
        in: [id]
      },
    }
  });

  if (products && products?.length) {
    return products[0];
  }

  return null;
}
