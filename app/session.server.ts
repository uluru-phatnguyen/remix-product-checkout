import { createCookieSessionStorage } from '@remix-run/node';

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__session',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    path: '/',
    sameSite: 'lax',
    secrets: [process.env.SESSION_SECRET || '@@@###'],
  },
});

export const { getSession, commitSession, destroySession } = sessionStorage;
