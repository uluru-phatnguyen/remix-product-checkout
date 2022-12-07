import { createCookieSessionStorage } from '@remix-run/node';
import { CartItem } from '~/models/cart.server';

const cartSessionKey = 'CART_SESSION_KEY';

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__session',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    path: '/',
    sameSite: 'lax',
    secrets: [process.env.SESSION_SECRET || '@@@###'],
  },
});

export async function getSession(request: Request | string | null | undefined) {
  const cookieHeader = !request || typeof request === 'string' ? request : request.headers.get('Cookie');
  let session = await sessionStorage.getSession(cookieHeader);

  return {
    commitSession() {
      return sessionStorage.commitSession(session);
    },
    // TODO: Get and set cart from redis or something if user is logged in (could probably use a storage abstraction)
    async getCart(): Promise<CartItem[]> {
      return JSON.parse(session.get(cartSessionKey) || '[]');
    },
    async setCart(cart: CartItem[]) {
      session.set(cartSessionKey, JSON.stringify(cart));

      return this.getCart();
    },
  };
}
