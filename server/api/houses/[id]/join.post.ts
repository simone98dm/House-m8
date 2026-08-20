import { z } from 'zod';
import { verifyAuthCompat } from '~~/server/utils/repository-auth';
import { getRepositories } from '~~/server/repositories/factory';

const joinSchema = z.object({
  token: z.string().min(1, 'Invitation token is required'),
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

  const { token } = await readValidatedBody(event, joinSchema.parse);

  const repos = getRepositories();

  // Validate the invitation token
  const { data: invitation, error: inviteError } =
    await repos.houses.getInvitationByToken(token);

  if (inviteError || !invitation) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Invalid or expired invitation',
    });
  }

  if (invitation.house_id !== houseId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Invitation does not match this house',
    });
  }

  if (invitation.used) {
    throw createError({
      statusCode: 410,
      statusMessage: 'Invitation has already been used',
    });
  }

  if (new Date() > new Date(invitation.expires_at)) {
    throw createError({
      statusCode: 410,
      statusMessage: 'Invitation has expired',
    });
  }

  // Check if user is already a member
  const isMember = await repos.houses.isMember(houseId, user.id);

  if (isMember) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Already a member of this house',
    });
  }

  // Add user as new member
  const { error: addError } = await repos.houses.addMember(
    houseId,
    user.id,
    'member',
  );

  if (addError) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to join house',
    });
  }

  return { data: { message: 'Successfully joined house' } };
});
