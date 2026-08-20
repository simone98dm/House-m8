import type { IUserRepository } from '~~/server/repositories/interfaces/IUserRepository';
import { logger } from '~~/server/utils/logger';

interface OAuthMetadata {
  first_name?: unknown;
  last_name?: unknown;
  full_name?: unknown;
  name?: unknown;
  avatar_url?: unknown;
  picture?: unknown;
  is_first_access?: unknown;
  provider?: unknown;
  [key: string]: unknown;
}

interface ExtractedName {
  firstName: string;
  lastName: string;
  avatarUrl: string | undefined;
}

/** Extracts first name, last name, and avatar URL from OAuth metadata. */
export function extractNameFromMetadata(
  metadata: OAuthMetadata,
  emailFallback: string,
): ExtractedName {
  let firstName =
    typeof metadata.first_name === 'string' ? metadata.first_name.trim() : '';
  let lastName =
    typeof metadata.last_name === 'string' ? metadata.last_name.trim() : '';

  if (!firstName && !lastName) {
    const fullName = String(
      (metadata.full_name as string) || (metadata.name as string) || '',
    ).trim();
    if (fullName) {
      const parts = fullName.split(' ');
      firstName = parts[0] || '';
      lastName = parts.slice(1).join(' ');
    }
  }

  if (!firstName) {
    firstName = emailFallback.split('@')[0] || 'User';
  }

  const avatarUrl =
    (metadata.avatar_url as string) ||
    (metadata.picture as string) ||
    undefined;

  return { firstName, lastName, avatarUrl };
}

/** Creates or updates a user profile from OAuth data. Throws on failure. */
export async function upsertOAuthUserProfile(
  usersRepo: IUserRepository,
  userId: string,
  userEmail: string,
  metadata: OAuthMetadata | undefined,
  existingUser:
    | {
        id?: string;
        first_name?: string | null;
        is_first_access?: boolean | null;
      }
    | null
    | undefined,
): Promise<void> {
  const { firstName, lastName, avatarUrl } = extractNameFromMetadata(
    metadata ?? {},
    userEmail,
  );

  const profileData = {
    email: userEmail,
    first_name: firstName,
    last_name: lastName,
    avatar_url: avatarUrl,
    is_first_access: (metadata?.is_first_access as boolean) ?? true,
  };

  const updateId = existingUser?.id ?? userId;
  const profileResult = existingUser
    ? await usersRepo.update(updateId, profileData)
    : await usersRepo.create(userId, profileData);

  if (profileResult.error) {
    logger.error('Failed to upsert user profile during OAuth', {
      userId,
      error: profileResult.error,
    });
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to set up user profile',
    });
  }
}
