import {
  verifyAuthCompat,
  ensureHouseMember,
} from '~~/server/utils/repository-auth';
import { getRepositories } from '~~/server/repositories/factory';

export default defineEventHandler(async (event) => {
  const user = await verifyAuthCompat(event);
  const houseId = getRouterParam(event, 'id');

  if (!houseId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'House ID is required',
    });
  }

  // Verify user is member of house
  await ensureHouseMember(houseId, user.id);

  const repos = getRepositories();
  const result = await repos.houses.getMembers(houseId);

  if (result.error || !result.data) {
    throw createError({
      statusCode: 500,
      statusMessage: result.error || 'Failed to fetch members',
    });
  }

  return { data: result.data };
});
