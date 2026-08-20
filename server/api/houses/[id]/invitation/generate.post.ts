import { z } from 'zod';
import {
  verifyAuthCompat,
  ensureHouseAdmin,
} from '~~/server/utils/repository-auth';
import { getRepositories } from '~~/server/repositories/factory';
import { sendMemberInviteEmail } from '~~/server/emails';
import consola from 'consola';

const generateSchema = z
  .object({
    // Optional: if provided, the invite email (with both link and code) is sent
    email: z.string().email().optional(),
  })
  .optional();

export default defineEventHandler(async (event) => {
  try {
    const user = await verifyAuthCompat(event);
    const houseId = getRouterParam(event, 'id');

    if (!houseId) {
      throw createError({ statusCode: 400, message: 'House ID is required' });
    }

    await ensureHouseAdmin(houseId, user.id);

    const body = await readBody(event).catch(() => null);
    const parsed = generateSchema.safeParse(body);
    const inviteeEmail =
      parsed.success && parsed.data?.email ? parsed.data.email : null;

    const repos = getRepositories();

    const result = await repos.houses.createInvitation(
      houseId,
      inviteeEmail ?? '',
      user.id,
    );

    if (result.error || !result.data) {
      throw createError({
        statusCode: 500,
        message: result.error || 'Failed to generate invitation',
      });
    }

    const invitation = result.data;

    // Attach 6-digit code alongside the token
    const codeResult = await repos.houses.attachInviteCode(invitation.id);

    const code = codeResult.data?.code ?? null;
    const codeExpiresAt = codeResult.data?.code_expires_at ?? null;

    if (codeResult.error) {
      consola.warn(
        '[generate.post] attachInviteCode failed:',
        codeResult.error,
      );
    }

    // Send invite email with both link and code if inviteeEmail is provided
    if (inviteeEmail && code && codeExpiresAt) {
      const config = useRuntimeConfig();
      const baseUrl = config.public.baseUrl || 'http://localhost:3000';

      // Fetch inviter name
      const { data: inviterUser } = await repos.users.getById(user.id);
      const inviterName = inviterUser?.first_name
        ? `${inviterUser.first_name} ${inviterUser.last_name || ''}`.trim()
        : user.email;

      const { data: house } = await repos.houses.getById(houseId);
      const houseName = house?.name ?? 'the house';

      const inviteLink = `${baseUrl}/house/join/${invitation.token}`;
      const codeExpiresAtFormatted = new Date(codeExpiresAt).toLocaleString(
        'en-GB',
        { dateStyle: 'medium', timeStyle: 'short' },
      );

      sendMemberInviteEmail({
        email: inviteeEmail,
        inviterName,
        houseName,
        inviteLink,
        code,
        codeExpiresAt: codeExpiresAtFormatted,
      }).catch((err) => {
        consola.warn('[generate.post] sendMemberInviteEmail failed:', err);
      });
    }

    return {
      data: {
        token: invitation.token,
        expires_at: invitation.expires_at,
        code,
        code_expires_at: codeExpiresAt,
      },
    };
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }
    throw createError({ statusCode: 500, message: 'Internal server error' });
  }
});
