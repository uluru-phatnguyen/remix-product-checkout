import { getProduct } from './product.server';
import { PizzaSize } from '~/data.server';
import { getSession } from '~/session.server';

export interface CartItem {
  productId: string;
  name: string;
  size: PizzaSize;
  quantity: number;
  price: number;
  totalPrice: number;
}

// export async function getShoppingCart(userId: string) {
//   return prisma.cart.findFirst({
//     where: { id: userId },
//     include: {
//       cartItems: {
//         include: {
//           product: true,
//         },
//       },
//     },
//   });
// }

// export async function getCartItemsCount(userId: string) {
//   const cart = await getShoppingCart(userId);
//   if (!cart) {
//     return 0;
//   }
//   return cart.cartItems.reduce((acc, item) => acc + item.quantity, 0);
// }

// export async function addShoppingCart(userId: string) {
//   return prisma.cart.create({
//     data: {
//       id: userId,
//     },
//   });
// }

export async function addToCart(
  request: Request,
  cart: {
    productId: string,
    size: PizzaSize,
    quantity: number,
    name: string,
    price: number,
    totalPrice: number,
  }
) {
  const product = await getProduct(cart.productId);

  if (!product) {
    throw new Response('Product not found', { status: 404 });
  }

  const session = await getSession(request);
  const cartItems = await session.getCart();
  const cartItemIndex = cartItems.findIndex((item) => item.productId === cart.productId);

  let cartItem;
  // If the product is already in the cart, just update the quantity
  if (cartItemIndex >= 0) {
    cartItems[cartItemIndex].quantity = cartItems[cartItemIndex].quantity + cart.quantity;
    cartItems[cartItemIndex].totalPrice = Number(cartItems[cartItemIndex].price) * cartItems[cartItemIndex].quantity;

    cartItem = cartItems[cartItemIndex];
  } else {
    cartItem = cart;
    cartItems.push(cartItem);
  }

  session.setCart(cartItems);

  return cartItem;
}

// export async function removeFromCart(userId: string, productId: string) {
//   const cart = await getShoppingCart(userId);

//   return prisma.cartItem.deleteMany({
//     where: {
//       cartId: cart!.id,
//       productId,
//     },
//   });
// }
