import {
  verifyAuthCompat,
  ensureHouseMember,
} from '~~/server/utils/repository-auth';
import { getRepositories } from '~~/server/repositories/factory';
import { sendLeavingHomeConfirmation } from '~~/server/emails';
import { getBaseUrl } from '~~/server/utils/email';

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

  const repos = getRepositories();

  // The owner can never leave: there is exactly one owner per house
  // (DB-enforced) and no ownership transfer exists, so letting them go would
  // orphan the house. Archiving it is the owner's exit. The previous message
  // pointed at a transfer flow that does not exist.
  const isOwner = await repos.houses.isOwner(houseId, user.id);
  if (isOwner) {
    throw createError({
      statusCode: 403,
      statusMessage:
        'The house owner cannot leave the house. Archive the house instead.',
    });
  }

  // All balances (debts and credits) must be settled
  const { data: balance, error: balanceError } =
    await repos.balance.getUserBalance(houseId, user.id);
  if (balanceError || !balance) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to check balance',
    });
  }

  if (balance.net_balance < -0.01) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Settle all balances before leaving the house',
    });
  }

  // Remove member
  const result = await repos.houses.removeMember(houseId, user.id);
  if (result.error) {
    throw createError({
      statusCode: 500,
      statusMessage: result.error || 'Failed to leave house',
    });
  }

  // Archive house if no active members remain
  const { data: remaining } = await repos.houses.getMembers(houseId);
  if (!remaining || remaining.length === 0) {
    const { error: archiveError } = await repos.houses.archiveHouse(houseId);
    if (archiveError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to archive house',
      });
    }
  }

  // Send confirmation email (non-blocking)
  const houseResult = await repos.houses.getById(houseId, false);
  const userResult = await repos.users.getById(user.id);
  if (houseResult.data && userResult.data) {
    const baseURL = getBaseUrl();
    sendLeavingHomeConfirmation({
      email: userResult.data.email,
      userName: `${userResult.data.first_name} ${userResult.data.last_name}`,
      houseName: houseResult.data.name,
      ratingLink: `${baseURL}/houses/${houseId}/rating`,
    }).catch(() => {});
  }

  return { data: { message: 'Successfully left house' } };
});
