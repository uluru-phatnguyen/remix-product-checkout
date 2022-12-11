import { getAllProducts, getProduct } from "./product.server";
import { products } from "../data.server";

test("Get list products", async () => {
  const products = await getAllProducts();

  expect(products.length).toBe(3);
});

test("Get product", async () => {
  const product = await getProduct(products[0].id);

  expect(product?.id).to(products[0].id);
});
