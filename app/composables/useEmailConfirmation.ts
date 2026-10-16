/**
 * Owns the /auth/confirm page's verification flow: magic-link token
 * verification (POST via useAuth). Extracted from confirm.vue so the
 * page's script stays focused on rendering the four resulting states.
 */
export function useEmailConfirmation() {
  const { t } = useI18n();
  const route = useRoute();
  const auth = useAuth();

  const loading = ref(true);
  const confirmed = ref(false);
  const tokenExpired = ref(false);
  const error = ref('');
  let redirectTimer: ReturnType<typeof setTimeout> | null = null;

  onUnmounted(() => {
    if (redirectTimer) clearTimeout(redirectTimer);
  });

  /**
   * Magic-link branch: POST /api/auth/confirm {token}
   * Sets auth cookies server-side; on success land on /dashboard where the
   * wizard auto-triggers via is_first_access.
   */
  const handleTokenVerification = async (token: string) => {
    try {
      const { data, error: apiError } = await auth.confirmWithToken(token);

      if (apiError || !data?.success) {
        // Treat 400 (expired/used) as a resend opportunity
        tokenExpired.value = true;
        error.value = apiError || t('auth.confirmation.failed');
        return;
      }

      confirmed.value = true;
      // Small delay so user sees success before redirect
      redirectTimer = setTimeout(() => navigateTo('/dashboard'), 1500);
    } catch (err) {
      tokenExpired.value = true;
      if (err && typeof err === 'object' && 'data' in err) {
        error.value =
          (err.data as { statusMessage?: string }).statusMessage ||
          t('auth.confirmation.failed');
      } else {
        error.value = t('auth.confirmation.failed');
      }
    } finally {
      loading.value = false;
    }
  };

  onMounted(async () => {
    try {
      const token = route.query.token as string;
      if (token) {
        await handleTokenVerification(token);
        return;
      }

      error.value = t('auth.confirmation.invalidLink');
      loading.value = false;
    } catch {
      error.value = t('auth.confirmation.failed');
      loading.value = false;
    }
  });

  return { loading, confirmed, tokenExpired, error };
}
