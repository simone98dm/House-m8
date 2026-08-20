import { z } from 'zod';
import { getAuthProvider } from '~~/server/providers/auth/factory';
import { getRepositories } from '~~/server/repositories/factory';
import {
  generateAccessToken,
  generateRefreshToken,
  setAuthCookies,
} from '~~/server/utils/jwt';
import { upsertOAuthUserProfile } from '~~/server/utils/oauthProfile';

// Discriminated union: either a magic-link token or OAuth tokens
const confirmSchema = z.union([
  z.object({
    token: z.string().min(1),
  }),
  z.object({
    access_token: z.string().min(1),
    refresh_token: z.string().min(1),
    expires_in: z.number().optional(),
    token_type: z.string().optional(),
    scope: z.string().optional(),
    provider: z.string().optional(),
  }),
]);

/**
 * POST /api/auth/confirm
 *
 * Branch A — magic-link (email verification):
 *   Body: { token: string }
 *   Verifies the email token, mints JWT session, sets auth cookies.
 *
 * Branch B — OAuth callback (unchanged):
 *   Body: { access_token, refresh_token, ... }
 */
export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, confirmSchema.parse);

  // ── Branch A: magic-link email verification ──────────────────────────────
  if ('token' in body) {
    const authProvider = getAuthProvider();

    const identity = await authProvider.confirmEmailVerificationToken(
      body.token,
    );

    if (!identity) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid or expired verification token',
      });
    }

    const accessToken = await generateAccessToken(
      identity.userId,
      identity.email,
    );
    const refreshToken = await generateRefreshToken(
      identity.userId,
      identity.email,
    );
    setAuthCookies(event, accessToken, refreshToken);

    return {
      success: true,
      message: 'Email confirmed successfully',
    };
  }

  // ── Branch B: OAuth session confirmation (unchanged) ─────────────────────
  const {
    access_token,
    refresh_token,
    expires_in,
    token_type,
    scope,
    provider,
  } = body;

  try {
    const authProvider = getAuthProvider();

    if (!authProvider.confirmOAuthSession) {
      throw createError({
        statusCode: 501,
        statusMessage:
          'OAuth confirmation not supported by current auth provider',
      });
    }

    const result = await authProvider.confirmOAuthSession(
      access_token,
      refresh_token,
      {
        expires_in,
        token_type,
        scope,
        provider,
      },
    );

    if (!result) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid confirmation tokens',
      });
    }

    const { user, metadata } = result;
    const repos = getRepositories();

    const { data: existingUser } = await repos.users.getById(user.id);

    const isOAuth = metadata?.provider === 'google';
    const needsProfileUpdate =
      !existingUser ||
      (isOAuth && (!existingUser.first_name || existingUser.is_first_access));

    if (needsProfileUpdate) {
      await upsertOAuthUserProfile(
        repos.users,
        user.id,
        user.email || '',
        metadata as Record<string, unknown>,
        existingUser,
      );
    }

    const accessToken = await generateAccessToken(user.id, user.email || '');
    const refreshToken = await generateRefreshToken(user.id, user.email || '');
    setAuthCookies(event, accessToken, refreshToken);

    return {
      success: true,
      message: 'Email confirmed successfully',
      data: { user },
    };
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Email confirmation failed',
    });
  }
});
