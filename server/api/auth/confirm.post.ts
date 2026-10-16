import { z } from 'zod';
import { getAuthProvider } from '~~/server/providers/auth/factory';
import {
  generateAccessToken,
  generateRefreshToken,
  setAuthCookies,
} from '~~/server/utils/jwt';

const confirmSchema = z.object({
  token: z.string().min(1),
});

/**
 * POST /api/auth/confirm
 *
 * Magic-link (email verification):
 *   Body: { token: string }
 *   Verifies the email token. A sign-up confirmation also mints a session.
 *   An email-change confirmation does not: the link went to the new address,
 *   and holding that mailbox alone must not grant access to the account.
 *
 * Google sign-in is handled server-side by /api/auth/google/callback; this
 * endpoint must never accept client-supplied third-party tokens.
 */
export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, confirmSchema.parse);

  const authProvider = getAuthProvider();

  const identity = await authProvider.confirmEmailVerificationToken(body.token);

  if (!identity) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid or expired verification token',
    });
  }

  if (!identity.isEmailChange) {
    const accessToken = await generateAccessToken(
      identity.userId,
      identity.email,
    );
    const refreshToken = await generateRefreshToken(
      identity.userId,
      identity.email,
    );
    setAuthCookies(event, accessToken, refreshToken);
  }

  return {
    success: true,
    message: 'Email confirmed successfully',
  };
});
