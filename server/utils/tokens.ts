import { randomBytes, createHash } from 'node:crypto';

/**
 * Generate a secure random token for email verification
 * @param length Token length (default: 32 bytes = 64 hex characters)
 * @returns Secure random token string
 */
export const generateSecureToken = (length = 32): string => {
  return randomBytes(length).toString('hex');
};

/**
 * Hash a token for secure storage
 * @param token Plain token to hash
 * @returns Hashed token
 */
export const hashToken = (token: string): string => {
  return createHash('sha256').update(token).digest('hex');
};

/**
 * Generate verification token with expiration
 * @param expirationHours Hours until token expires (default: 24)
 * @returns Object with token and expiration date
 */
export const generateVerificationToken = (
  expirationHours = 24,
): { token: string; expiresAt: Date } => {
  const token = generateSecureToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expirationHours);

  return { token, expiresAt };
};
