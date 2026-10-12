import { getAuthProvider } from '~~/server/providers/auth/factory';
import { sendRegistrationEmail } from '~~/server/emails';
import { getRepositories } from '~~/server/repositories/factory';
import { createFeatureFlagsProvider } from '~~/server/utils/feature-flags/factory';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  termsAccepted: z.literal(true, {
    errorMap: () => ({
      message: 'You must accept the terms and privacy policy',
    }),
  }),
});

// Generic success message (same for new and pre-existing emails — anti-enumeration)
const SUCCESS_MESSAGE =
  'If this email is new to us, a confirmation link is on its way. Please check your inbox.';

export default defineEventHandler(async (event) => {
  const flagsProvider = createFeatureFlagsProvider();
  const newUsersEnabled = await flagsProvider.getFlag('new-users', false);
  if (!newUsersEnabled) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' });
  }

  const { email } = await readValidatedBody(event, (body) =>
    registerSchema.parse(body),
  );

  const config = useRuntimeConfig();
  const baseUrl = config.public.baseUrl || 'http://localhost:3000';

  try {
    const authProvider = getAuthProvider();

    const sendConfirmationLink = async (userId: string) => {
      const verificationToken = await authProvider.createEmailVerificationToken(
        userId,
        email,
      );
      if (!verificationToken) return;
      sendRegistrationEmail({
        email,
        userName: email,
        confirmationLink: `${baseUrl}/auth/confirm?token=${verificationToken.token}`,
      }).catch(() => {
        // Silent fail — email is best-effort
      });
    };

    let user;
    try {
      user = await authProvider.signUpEmailOnly(email);
    } catch {
      user = null;
    }

    if (!user) {
      // Email already registered. If the account never confirmed, resend the
      // link so the sign-up isn't a dead end; a confirmed account gets nothing.
      // The response is identical either way (anti-enumeration).
      const unconfirmed = await authProvider.getUnconfirmedUserByEmail(email);
      if (unconfirmed) await sendConfirmationLink(unconfirmed.id);
      return { success: true, message: SUCCESS_MESSAGE };
    }

    await getRepositories().users.update(user.id, {
      is_first_access: true,
      terms_accepted_at: new Date().toISOString(),
      consent_version: '1.0',
    });

    await sendConfirmationLink(user.id);

    return { success: true, message: SUCCESS_MESSAGE };
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Registration failed',
    });
  }
});
