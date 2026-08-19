import {
  getRefreshToken,
  verifyToken,
  generateAccessToken,
  generateRefreshToken,
  setAuthCookies,
  clearAuthCookies,
} from '~~/server/utils/jwt';
import { getPostgresPool } from '~~/server/utils/postgres';

export default defineEventHandler(async (event) => {
  const refreshToken = getRefreshToken(event);

  if (!refreshToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'No refresh token found',
    });
  }

  const payload = await verifyToken(refreshToken, 'refresh');

  if (!payload) {
    clearAuthCookies(event);
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid refresh token',
    });
  }

  // Check DB revocation
  const pool = getPostgresPool();
  if (payload.jti) {
    const row = await pool.query(
      'SELECT revoked_at FROM refresh_tokens WHERE jti = $1',
      [payload.jti],
    );
    if (!row.rows[0] || row.rows[0].revoked_at) {
      clearAuthCookies(event);
      throw createError({ statusCode: 401, statusMessage: 'Token revoked' });
    }
    // Revoke old token
    await pool.query(
      'UPDATE refresh_tokens SET revoked_at = NOW() WHERE jti = $1',
      [payload.jti],
    );
  }

  // Generate new tokens
  const newAccessToken = await generateAccessToken(
    payload.userId,
    payload.email,
  );
  const newRefreshToken = await generateRefreshToken(
    payload.userId,
    payload.email,
  );

  // Set cookies
  setAuthCookies(event, newAccessToken, newRefreshToken);

  return { status: 'success' };
});
