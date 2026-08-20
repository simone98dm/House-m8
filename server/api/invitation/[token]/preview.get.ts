import { getRepositories } from '~~/server/repositories/factory';

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, 'token');

  if (!token) {
    throw createError({ statusCode: 400, statusMessage: 'Token required' });
  }

  const repos = getRepositories();

  const { data: invitation } = await repos.houses.getInvitationByToken(token);

  if (
    !invitation ||
    invitation.used ||
    new Date(invitation.expires_at) < new Date()
  ) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Invitation not found or expired',
    });
  }

  const { data: house } = await repos.houses.getById(
    invitation.house_id,
    false,
  );
  if (!house) {
    throw createError({ statusCode: 404, statusMessage: 'House not found' });
  }

  const { data: members } = await repos.houses.getMembers(invitation.house_id);

  return {
    data: {
      house_name: house.name,
      member_count: members?.length ?? 0,
    },
  };
});
