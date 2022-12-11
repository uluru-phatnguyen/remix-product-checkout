import { destroySession, getSession } from "../session.server";
import { addToCart, getCartItems } from "./cart";
import { products } from "../data.server";

const productId = products[0].id;

test("Add to cart with product", async () => {
  const session = await getSession();

  await addToCart(session, productId, 1);

  const items = await getCartItems(session);

  expect(items.length).toEqual(1);
  expect(items[0].productId).toEqual(productId);
});
