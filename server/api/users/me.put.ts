import { z } from 'zod';
import { verifyAuthCompat } from '~~/server/utils/repository-auth';
import { getRepositories } from '~~/server/repositories/factory';
import { OCCUPATION_TYPES } from '~~/server/repositories/interfaces/IUserRepository';

/**
 * PUT /api/users/me
 * Update current authenticated user's profile
 */

const profileUpdateSchema = z
  .object({
    first_name: z.string().min(1).max(50),
    last_name: z.string().min(1).max(50),
    // The sign-in identity. Normalised to lower case so a case-only change
    // can't slip past the UNIQUE index and create a second effective account.
    email: z
      .string()
      .email()
      .max(255)
      .transform((value) => value.trim().toLowerCase()),
    preferred_currency: z.enum(['USD', 'EUR']),
    avatar_url: z.string().url().max(500).nullable(),
    birthdate: z.string().max(20).nullable(),
    bio: z.string().max(500).nullable(),
    is_smoker: z.boolean(),
    is_first_access: z.boolean(),
    gender: z.string().max(50).nullable(),
    birthplace: z.string().max(100).nullable(),
    occupation_type: z.enum(OCCUPATION_TYPES).nullable(),
    study_field: z.string().max(100).nullable(),
    job_title: z.string().max(100).nullable(),
    languages: z.array(z.string().max(50)).max(20).nullable(),
    nationality: z.string().max(100).nullable(),
    pets: z.string().max(200).nullable(),
    telephone: z.string().max(20).nullable(),
    instagram: z.string().max(100).nullable(),
    twitter: z.string().max(100).nullable(),
    linkedin: z.string().max(200).nullable(),
    tiktok: z.string().max(100).nullable(),
  })
  .partial();

export default defineEventHandler(async (event) => {
  const user = await verifyAuthCompat(event);
  const updates = await readValidatedBody(event, profileUpdateSchema.parse);

  if (Object.keys(updates).length === 0) {
    throw createError({
      statusCode: 400,
      message: 'No valid fields to update',
    });
  }

  const repos = getRepositories();

  // Claiming an address that already belongs to someone else is a client
  // error, not a server one — and it must not report WHICH account holds it.
  if (updates.email && updates.email !== user.email.toLowerCase()) {
    const { data: existing } = await repos.users.getByEmail(updates.email);
    if (existing && existing.id !== user.id) {
      throw createError({
        statusCode: 409,
        message: 'That email address is already in use',
      });
    }
  }

  const { data, error } = await repos.users.update(user.id, updates);

  if (error) {
    // The uniqueness check above races: two requests can both pass it. The
    // UNIQUE index is the real guard, so translate its violation rather than
    // reporting a 500.
    if (/duplicate key|unique/i.test(error)) {
      throw createError({
        statusCode: 409,
        message: 'That email address is already in use',
      });
    }
    throw createError({
      statusCode: 500,
      message: error,
    });
  }

  if (!data) {
    throw createError({
      statusCode: 404,
      message: 'User not found',
    });
  }

  return { data };
});
