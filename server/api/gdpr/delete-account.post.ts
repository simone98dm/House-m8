import { z } from 'zod';
import { verifyAuthCompat } from '~~/server/utils/repository-auth';
import { getRepositories } from '~~/server/repositories/factory';
import { sendAccountDeletionRequestedEmail } from '~~/server/emails/index';

const schema = z.object({
  confirm: z.literal(true, {
    errorMap: () => ({ message: 'confirm must be true' }),
  }),
});

export default defineEventHandler(async (event) => {
  const user = await verifyAuthCompat(event);
  await readValidatedBody(event, schema.parse);

  const config = useRuntimeConfig();
  const baseUrl = config.public.baseUrl || 'http://localhost:3000';
  const repos = getRepositories();

  const { scheduledFor, cancelToken } = await repos.gdpr.softDeleteUser(
    user.id,
  );

  const cancelLink = `${baseUrl}/settings/privacy?cancel_token=${cancelToken}`;
  const scheduledForStr = scheduledFor.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const { data: profile } = await repos.users.getById(user.id);

  sendAccountDeletionRequestedEmail({
    email: user.email,
    userName: profile?.first_name ?? user.email,
    cancelLink,
    scheduledFor: scheduledForStr,
  }).catch(() => {});

  // ponytail: deletion is a 30-day soft-delete, not immediate — keeping the
  // session alive lets the user reach the in-app "Cancel deletion" button on
  // this same settings page instead of only via the emailed link.
  return {
    message: 'Account deletion scheduled.',
    scheduled_for: scheduledFor.toISOString(),
  };
});
