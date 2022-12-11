import type { Session } from '@remix-run/node';
import { isArray } from 'class-validator';
import { PizzaSize, SampleRuleEngines } from '../data.server';
import { getProduct } from '../models/product.server';
import { EVENT_TYPE, RuleEngine } from './rule-engine';
import type { RuleResult, Event } from 'json-rules-engine';

const ruleEngine = new RuleEngine();

// Init Sample Rule:
SampleRuleEngines.map(async (rule) => {
  await ruleEngine.addRule(rule);
});

const cartSessionKey = 'CART_SESSION_KEY';
const voucherSessionKey = 'VOUCHER_SESSION_KEY';

export interface CartItem {
  productId: string;
  name: string;
  description?: string;
  image?: string;
  size: PizzaSize;
  quantity: number;
  price: number;
  totalPrice: number;
  promotionQuantity: number;
  promotionPrice: number;
  promotionTotalPrice: number;
}

export async function addToCart(
  session: Session,
  productId: string,
  quantity: number = 1,
) {
  const product = await getProduct(productId);

  if (!product) {
    throw new Response('Product not found', { status: 404 });
  }

  const cart: CartItem = {
    productId: product.id,
    name: product.name,
    description: product.description ?? '',
    image: product.image ?? '',
    size: product.size,
    quantity: quantity,
    price: product.price,
    totalPrice: product.price,
    promotionQuantity: quantity,
    promotionPrice: product.price,
    promotionTotalPrice: product.price,
  };

  let cartItems = JSON.parse(session.get(cartSessionKey) || '[]');
  const cartItemIndex = cartItems.findIndex((item: CartItem) => item.productId === product.id);

  // If the product is already in the cart, just update the quantity
  if (cartItemIndex >= 0) {
    cartItems[cartItemIndex].quantity = Number(cartItems[cartItemIndex].quantity) + Number(cart.quantity);
    cartItems[cartItemIndex].totalPrice = Number((
      Number(cartItems[cartItemIndex].price) * cartItems[cartItemIndex].quantity
    ).toFixed(2)); // Floating Point

    cartItems[cartItemIndex].promotionQuantity = Number(cartItems[cartItemIndex].promotionQuantity) + Number(cart.promotionQuantity);
    cartItems[cartItemIndex].promotionTotalPrice = Number((
      Number(cartItems[cartItemIndex].promotionPrice) * cartItems[cartItemIndex].promotionQuantity
    ).toFixed(2)); // Floating Point
  } else {
    cartItems.push(cart);
  }

  const voucherCode = await getVoucherCode(session);
  const promotions = await applyVoucher(session, voucherCode, cartItems);
  cartItems = updateCartPromotion(cartItems, promotions);

  session.set(cartSessionKey, JSON.stringify(cartItems));
}

export async function getCartItems(session: Session): Promise<CartItem[]>{
  return JSON.parse(session.get(cartSessionKey) || '[]');
}

export async function removeFromCart(session: Session, productId: string) {
  const product = await getProduct(productId);

  if (!product) {
    throw new Response('Product not found', { status: 404 });
  }

  let cartItems = await getCartItems(session);
  cartItems = cartItems.filter((item) => item.productId !== productId);

  const voucherCode = await getVoucherCode(session);
  const promotions = await applyVoucher(session, voucherCode, cartItems);
  cartItems = updateCartPromotion(cartItems, promotions);

  session.set(cartSessionKey, JSON.stringify(cartItems));
}

export async function getCartItemsCount(session: Session) {
  const cartItems = await getCartItems(session);

  if (!cartItems || !isArray(cartItems)) {
    return 0;
  }

  return cartItems?.reduce((acc: number, item: CartItem) => acc + item.quantity, 0);
}

export async function addVoucherCode(session: Session, voucherCode: string) {
  session.set(voucherSessionKey, voucherCode ?? '');
}

export async function getVoucherCode(session: Session): Promise<string> {
  return session.get(voucherSessionKey) || '';
}

export async function applyVoucher(session: Session, voucherCode: string, cartItems: CartItem[] | null): Promise<Event[]> {
  await addVoucherCode(session, voucherCode);

  cartItems = !cartItems ? await getCartItems(session) : cartItems;
  const promotions: Event[] = [];

  for (let i = 0; i < cartItems.length; i++) {
    const cartItem = cartItems[i];

    const fact = {
      voucherCode: voucherCode ?? '',
      quantity: Number(cartItem.quantity),
      size: cartItem.size,
    };

    let {
      results,         /*  rule results for successful rules */
      // failureResults,  /* rule results for failed rules */
      // events,          /*  array of successful rule events */
      // failureEvents,   /*  array of failed rule events */
      // almanac          /*  Almanac instance representing the run */
    } = await ruleEngine.run(fact);

    results.filter((rr: RuleResult) => rr.result == true).map((rr: RuleResult) => {
      promotions.push(rr.event as Event);
    });
  }

  // Re-Update cart
  cartItems = updateCartPromotion(cartItems, promotions);
  session.set(cartSessionKey, JSON.stringify(cartItems));

  return promotions;
}

function updateCartPromotion(cartItems: CartItem[], promotions: Event[]) {
  for (let cId = 0; cId < cartItems.length; cId++) {
    if (promotions.length === 0) {
      cartItems[cId].promotionPrice = cartItems[cId].price;
      cartItems[cId].promotionQuantity = cartItems[cId].quantity;
      cartItems[cId].promotionTotalPrice = cartItems[cId].totalPrice;
    } else {
      for (let i = 0; i < promotions.length; i++) {
        const promotion = promotions[i];
        const { size = '', buy = 0, deal = 0, price = 0 } = promotion?.params ?? {};

        if (cartItems[cId].size === size) {
          if (promotion.type === EVENT_TYPE.DEAL && cartItems[cId].quantity >= Number(buy)) {
            cartItems[cId].promotionPrice = Number(cartItems[cId].promotionPrice);

            if (cartItems[cId].quantity === Number(buy)) {
              cartItems[cId].promotionQuantity = Number(deal);
            } else if (cartItems[cId].quantity % Number(buy) === 0) {
              cartItems[cId].promotionQuantity = Number(cartItems[cId].quantity / Number(buy)) + Number(deal);
            } else {
              cartItems[cId].promotionQuantity = Number(cartItems[cId].quantity % Number(buy)) + Number(deal);
            }

            cartItems[cId].promotionTotalPrice = Number((
              Number(cartItems[cId].promotionPrice) * cartItems[cId].promotionQuantity
            ).toFixed(2)); // Floating Point
          } else if (promotion.type === EVENT_TYPE.DISCOUNT) {
            cartItems[cId].promotionPrice = Number(price);
            cartItems[cId].promotionQuantity = Number(cartItems[cId].promotionQuantity);
            cartItems[cId].promotionTotalPrice = Number((
              Number(cartItems[cId].promotionPrice) * cartItems[cId].promotionQuantity
            ).toFixed(2)); // Floating Point
          }
        }
      }
    }
  }

  return cartItems;
}
