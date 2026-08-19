import {
  verifyAuthCompat,
  ensureHouseMember,
} from '~~/server/utils/repository-auth';
import { getRepositories } from '~~/server/repositories/factory';

export default defineEventHandler(async (event) => {
  const user = await verifyAuthCompat(event);
  const shareId = getRouterParam(event, 'id');

  if (!shareId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Share ID is required',
    });
  }

  const repos = getRepositories();

  // Get the share with expense info
  const shareResult = await repos.expenses.getShareById(shareId);
  if (shareResult.error || !shareResult.data) {
    throw createError({
      statusCode: 404,
      statusMessage: shareResult.error || 'Share not found',
    });
  }

  const share = shareResult.data;

  // Each member settles only their own position. Membership alone used to be
  // enough here, which let any member mark another member's share paid (or
  // unpaid) — someone else's debt, altered without their involvement.
  if (share.user_id !== user.id) {
    throw createError({
      statusCode: 403,
      statusMessage: 'You can only settle your own share',
    });
  }

  if (share.expense?.house_id) {
    await ensureHouseMember(share.expense.house_id, user.id);
  }

  // Update the share to mark it as unpaid
  const result = await repos.expenses.updateShare(shareId, {
    is_paid: false,
    paid_at: null,
  });

  if (result.error || !result.data) {
    throw createError({
      statusCode: 500,
      statusMessage: result.error || 'Failed to mark share as unpaid',
    });
  }

  return {
    data: {
      success: true,
      share: result.data,
    },
  };
});
