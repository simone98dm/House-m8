// server/middleware/rate-limit.ts
//
// Rate-limit strategy:
//   - IP key:    uses socket peer address (not X-Forwarded-For) to prevent header spoofing
//   - Email key: /api/auth/signin additionally keys on submitted email so per-account
//                brute-force is blocked regardless of source IP cycling
//   - Combined key is `ip:email` for signin, `ip` for all other auth endpoints
//
// TODO: replace in-process Map with Redis/Vercel KV for multi-instance deployments

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const RATE_LIMITED_PREFIXES = [
  '/api/auth/signin',
  '/api/auth/password-reset',
  '/api/auth/refresh',
  '/api/auth/register',
  '/api/invitation/redeem',
];

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 10;

function pruneExpired(): void {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) store.delete(key);
  }
}

function checkLimit(key: string, event: import('h3').H3Event): void {
  const now = Date.now();
  if (store.size > 10_000) pruneExpired();

  const entry = store.get(key) ?? { count: 0, resetAt: now + WINDOW_MS };
  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + WINDOW_MS;
  }
  entry.count++;
  store.set(key, entry);

  if (entry.count > MAX_REQUESTS) {
    setResponseHeader(event, 'Retry-After', 60);
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many requests. Please try again later.',
    });
  }
}

export default defineEventHandler(async (event) => {
  const path = event.path ?? '';
  if (!RATE_LIMITED_PREFIXES.some((prefix) => path.startsWith(prefix))) return;

  // Use socket peer address — cannot be spoofed via headers.
  // On Vercel/behind a reverse-proxy the peer is the proxy itself; that is
  // acceptable since it still provides a shared throttle across all clients.
  const ip =
    event.node.req.socket?.remoteAddress ?? getRequestIP(event) ?? 'unknown';

  // For sign-in and register, also throttle per submitted email to block
  // per-account brute-force / mailbombing from distributed IPs.
  if (
    path.startsWith('/api/auth/signin') ||
    path.startsWith('/api/auth/register')
  ) {
    try {
      const body = await readBody(event);
      const email =
        typeof body?.email === 'string' ? body.email.toLowerCase().trim() : '';
      if (email) {
        checkLimit(`email:${email}`, event);
      }
    } catch {
      // If body already consumed or parse fails, fall through to IP-only limit
    }
  }

  checkLimit(`ip:${ip}`, event);
});
