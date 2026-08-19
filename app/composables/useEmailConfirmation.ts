/**
 * Owns the /auth/confirm page's verification flow: magic-link token
 * verification (POST via useAuth) and hash-based OAuth/signup confirmation
 * (POST /api/auth/confirm via useApi). Extracted from confirm.vue so the
 * page's script stays focused on rendering the four resulting states.
 */
export function useEmailConfirmation() {
  const { t } = useI18n();
  const route = useRoute();
  const api = useApi();
  const auth = useAuth();

  const loading = ref(true);
  const confirmed = ref(false);
  const tokenExpired = ref(false);
  const error = ref('');
  let redirectTimer: ReturnType<typeof setTimeout> | null = null;

  onUnmounted(() => {
    if (redirectTimer) clearTimeout(redirectTimer);
  });

  const parseHashParams = (hash: string) => {
    const params: Record<string, string> = {};
    const hashString = hash.replace('#', '');
    hashString.split('&').forEach((pair) => {
      const [key, value] = pair.split('=');
      if (key && value) params[key] = decodeURIComponent(value);
    });
    return params;
  };

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

  const handleEmailConfirmation = async (
    accessToken: string,
    refreshToken: string,
    confirmationType?: string,
    tokenMetadata?: {
      expires_in?: string;
      token_type?: string;
      provider?: string;
      scope?: string;
    },
  ) => {
    try {
      const response = (await api.fetch('/api/auth/confirm', {
        method: 'POST',
        body: {
          access_token: accessToken,
          refresh_token: refreshToken,
          type: confirmationType,
          expires_in: tokenMetadata?.expires_in
            ? Number.parseInt(tokenMetadata.expires_in)
            : undefined,
          token_type: tokenMetadata?.token_type,
          provider: tokenMetadata?.provider,
          scope: tokenMetadata?.scope,
        },
      })) as { success: boolean; message?: string };

      if (response.success) {
        confirmed.value = true;
        const isOAuth = confirmationType !== 'signup';
        const redirectPath = isOAuth ? '/' : '/auth/login?confirmed=true';
        redirectTimer = setTimeout(() => navigateTo(redirectPath), 2000);
      } else {
        error.value = response.message || t('auth.confirmation.failed');
      }
    } catch (err) {
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

      const hashParams = route.hash ? parseHashParams(route.hash) : route.query;
      const {
        access_token,
        refresh_token,
        type,
        expires_in,
        token_type,
        provider,
        scope,
      } = hashParams;
      if (access_token && refresh_token) {
        await handleEmailConfirmation(
          access_token as string,
          refresh_token as string,
          type as string,
          {
            expires_in: expires_in as string,
            token_type: token_type as string,
            provider: provider as string,
            scope: scope as string,
          },
        );
      } else {
        error.value = t('auth.confirmation.invalidLink');
        loading.value = false;
      }
    } catch {
      error.value = t('auth.confirmation.failed');
      loading.value = false;
    }
  });

  return { loading, confirmed, tokenExpired, error };
}
