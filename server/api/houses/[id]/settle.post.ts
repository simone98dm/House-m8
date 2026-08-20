import { z } from 'zod';
import {
  verifyAuthCompat,
  ensureHouseMember,
} from '~~/server/utils/repository-auth';
import { getRepositories } from '~~/server/repositories/factory';

const bodySchema = z.object({
  from_user_id: z.string().uuid(),
  to_user_id: z.string().uuid(),
});

export default defineEventHandler(async (event) => {
  const user = await verifyAuthCompat(event);
  const houseId = getRouterParam(event, 'id');

  if (!houseId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'House ID is required',
    });
  }

  await ensureHouseMember(houseId, user.id);

  const { from_user_id, to_user_id } = await readValidatedBody(
    event,
    bodySchema.parse,
  );

  // Only the debtor or the creditor can trigger settlement
  if (user.id !== from_user_id && user.id !== to_user_id) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Not authorized to settle this transaction',
    });
  }

  const repos = getRepositories();
  const result = await repos.expenses.settleUserToUser(
    houseId,
    from_user_id,
    to_user_id,
  );

  if (result.error) {
    throw createError({ statusCode: 500, statusMessage: result.error });
  }

  return { data: { settled_count: result.data?.count ?? 0 } };
});
