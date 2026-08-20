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

    let user;
    try {
      user = await authProvider.signUpEmailOnly(email);
    } catch {
      // Email already registered — return identical response (anti-enumeration).
      // Do NOT resend the verification email.
      return { success: true, message: SUCCESS_MESSAGE };
    }

    if (!user) {
      // Unexpected null without throw — treat identically to enumeration guard
      return { success: true, message: SUCCESS_MESSAGE };
    }

    const repos = getRepositories();
    await repos.users.update(user.id, {
      is_first_access: true,
      terms_accepted_at: new Date().toISOString(),
      consent_version: '1.0',
    });

    const verificationToken = await authProvider.createEmailVerificationToken(
      user.id,
      email,
    );

    if (verificationToken) {
      const confirmationUrl = `${baseUrl}/auth/confirm?token=${verificationToken.token}`;
      sendRegistrationEmail({
        email,
        userName: email,
        confirmationLink: confirmationUrl,
      }).catch(() => {
        // Silent fail — email is best-effort
      });
    }

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
