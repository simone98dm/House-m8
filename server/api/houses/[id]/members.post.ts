import { z } from 'zod';
import { verifyAuth } from '~~/server/utils/auth';
import { ensureHouseAdmin } from '~~/server/utils/repository-auth';
import { getRepositories } from '~~/server/repositories/factory';
import { sendNewTenantNotification } from '~~/server/emails';

const addMemberSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export default defineEventHandler(async (event) => {
  const user = await verifyAuth(event);
  const houseId = getRouterParam(event, 'id');
  // Owner or delegated admin: adding members is exactly the power delegation
  // exists for. A base member must not be able to add people to the house.
  await ensureHouseAdmin(houseId, user.id);

  const { email } = await readValidatedBody(event, addMemberSchema.parse);

  if (!houseId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'House ID is required',
    });
  }

  const repos = getRepositories();

  // Verify user is member of house
  const { data: role, error: roleError } = await repos.houses.getMemberRole(
    houseId,
    user.id,
  );

  if (roleError || !role) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Not a member of this house',
    });
  }

  // Find user by email
  const { data: targetUser, error: userError } =
    await repos.users.getByEmail(email);

  if (userError || !targetUser) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found',
    });
  }

  // Check if user is already a member
  const isMember = await repos.houses.isMember(houseId, targetUser.id);

  if (isMember) {
    throw createError({
      statusCode: 409,
      statusMessage: 'User is already a member of this house',
    });
  }

  // Add member
  const { data: newMember, error } = await repos.houses.addMember(
    houseId,
    targetUser.id,
    'member',
  );

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to add member',
    });
  }

  // Get house details for email notification
  const { data: house } = await repos.houses.getById(houseId);

  // Get all current members to notify them
  const { data: existingMembers } = await repos.houses.getMembers(houseId);

  // Send notification emails to existing members (non-blocking)
  if (house && existingMembers && newMember?.user) {
    const notifications = existingMembers
      .filter((m) => m.user?.email && m.user_id !== targetUser.id)
      .map((member) => {
        const memberUser = member.user;
        if (!memberUser) return Promise.resolve();

        return sendNewTenantNotification({
          email: memberUser.email,
          tenantName: memberUser.first_name || 'Member',
          newTenantName: `${targetUser.first_name} ${targetUser.last_name}`,
          houseName: house.name,
        }).catch(() => {
          // Silent fail for email notifications
        });
      });

    // Send all notifications in parallel
    Promise.all(notifications).catch(() => {
      // Silent fail for email batch
    });
  }

  return {
    data: {
      ...newMember,
      user: targetUser,
    },
  };
});
