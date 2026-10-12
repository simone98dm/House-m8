// server/middleware/rate-limit.ts
//
// Throttles write requests to sensitive endpoints coming from the same source.
// Two stages per key, inside a fixed window:
//   1. slow   after SLOW_AFTER hits each further request is delayed, growing
//             by DELAY_STEP_MS per hit up to MAX_DELAY_MS
//   2. block  after MAX_REQUESTS hits the request is refused with 429 and a
//             Retry-After header until the window resets
//
// Counters live in Postgres (rate_limits table) so they are shared across
// serverless instances.
//
// Keys:
//   - `ip:<route>:<ip>`           every limited route, per client IP and route
//   - `signin:<email hash>:<ip>`  /api/auth/signin only: guesses against one
//                                 account from one address
//
// No key is built from the email alone: that would let anyone lock a victim's
// address out from elsewhere. Caps on mail sent to one inbox live where the
// mail is sent (sign-up resend, password reset and invite cooldowns).
import type { H3Event } from 'h3';
import consola from 'consola';
import { hitRateLimit } from '../utils/rate-limit-store';
import { hashToken } from '../utils/tokens';

interface LimitedRoute {
  name: string;
  pattern: RegExp;
}

const LIMITED_ROUTES: LimitedRoute[] = [
  { name: 'signin', pattern: /^\/api\/auth\/signin/ },
  { name: 'password-reset', pattern: /^\/api\/auth\/password-reset/ },
  { name: 'refresh', pattern: /^\/api\/auth\/refresh/ },
  { name: 'register', pattern: /^\/api\/auth\/register/ },
  { name: 'confirm', pattern: /^\/api\/auth\/confirm/ },
  { name: 'redeem', pattern: /^\/api\/invitation\/redeem/ },
  { name: 'email-change', pattern: /^\/api\/users\/me\/email/ },
  {
    name: 'invite',
    pattern: /^\/api\/houses\/[^/]+\/(invitation\/generate|members\/?$)/,
  },
];

const WINDOW_SECONDS = 60;
const SLOW_AFTER = 5;
const MAX_REQUESTS = 10;
const DELAY_STEP_MS = 500;
const MAX_DELAY_MS = 2000;

// Reads are never throttled: GET /api/houses/:id/members shares its path with
// the limited POST, and every limited endpoint is a write.
const UNLIMITED_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function checkLimit(event: H3Event, key: string): Promise<void> {
  let count: number;
  try {
    count = await hitRateLimit(key, WINDOW_SECONDS);
  } catch (error) {
    // Fail open: a database outage must not take authentication down too.
    consola.error('Rate limit store unavailable, allowing request', error);
    return;
  }

  if (count > MAX_REQUESTS) {
    setResponseHeader(event, 'Retry-After', WINDOW_SECONDS);
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many requests. Please try again later.',
    });
  }

  if (count > SLOW_AFTER) {
    await sleep(Math.min((count - SLOW_AFTER) * DELAY_STEP_MS, MAX_DELAY_MS));
  }
}

async function readEmail(event: H3Event): Promise<string> {
  try {
    const body = await readBody(event);
    return typeof body?.email === 'string'
      ? body.email.toLowerCase().trim()
      : '';
  } catch {
    return '';
  }
}

export default defineEventHandler(async (event) => {
  if (UNLIMITED_METHODS.has(event.method)) return;

  const path = (event.path ?? '').split('?')[0] ?? '';
  const route = LIMITED_ROUTES.find((r) => r.pattern.test(path));
  if (!route) return;

  // On Vercel the client address is the first x-forwarded-for hop / x-real-ip
  // set by the platform. This trusts the hosting proxy to overwrite those
  // headers; off-proxy deployments fall back to the socket peer.
  const ip =
    getRequestIP(event, { xForwardedFor: true }) ??
    event.node.req.socket?.remoteAddress ??
    'unknown';

  // IP first: a blocked source never reaches the second counter.
  await checkLimit(event, `ip:${route.name}:${ip}`);

  if (route.name === 'signin') {
    const email = await readEmail(event);
    // Hashed so the key has a fixed size whatever the client submits.
    if (email) await checkLimit(event, `signin:${hashToken(email)}:${ip}`);
  }
});
