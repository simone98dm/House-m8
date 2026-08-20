import { getAuthProvider } from '~~/server/providers/auth/factory';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const { token } = query;

  if (!token || typeof token !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Verification token is required',
    });
  }

  try {
    const authProvider = getAuthProvider();

    // Verify email using auth provider
    const success = await authProvider.verifyEmail(token);

    if (!success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid or expired verification token',
      });
    }

    return {
      success: true,
      message: 'Email verified successfully',
    };
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to verify email',
    });
  }
});
