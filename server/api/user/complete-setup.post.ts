import { z } from 'zod';
import { verifyAuthCompat } from '~~/server/utils/repository-auth';
import { getRepositories } from '~~/server/repositories/factory';
import { getAuthProvider } from '~~/server/providers/auth/factory';

const setupSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128),
});

/**
 * POST /api/user/complete-setup
 * Wizard Step 1: persist the user's name and set their initial password.
 * Only callable from an authenticated session (magic-link confirmed before wizard loads).
 */
export default defineEventHandler(async (event) => {
  const user = await verifyAuthCompat(event);
  const { firstName, lastName, password } = await readValidatedBody(
    event,
    setupSchema.parse,
  );

  const repos = getRepositories();
  const authProvider = getAuthProvider();

  // Guard: only callable before setup is complete (first_name not yet set).
  // This blocks password resets and repeat wizard invocations on already-set-up accounts.
  const { data: existing } = await repos.users.getById(user.id);
  if (existing?.first_name) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Setup already completed',
    });
  }

  // Update name fields
  const { error: updateError } = await repos.users.update(user.id, {
    first_name: firstName,
    last_name: lastName,
  });

  if (updateError) {
    throw createError({ statusCode: 500, statusMessage: updateError });
  }

  // Set password
  const passwordSet = await authProvider.setPassword(user.id, password);
  if (!passwordSet) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to set password',
    });
  }

  return { success: true };
});
