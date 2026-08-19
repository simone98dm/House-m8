<script lang="ts" setup>
definePageMeta({
  layout: false,
});

const { t } = useI18n();

useSeoMeta({
  title: t('seo.titles.passwordReset'),
  robots: 'noindex, nofollow',
});

const route = useRoute();
const { confirmReset } = usePasswordReset();

const token = computed(() => (route.query.token as string) || '');
const hasToken = computed(() => !!token.value);

const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const tokenInvalid = ref(false);
const success = ref(false);
const networkError = ref('');
let redirectTimer: ReturnType<typeof setTimeout> | null = null;

onUnmounted(() => {
  if (redirectTimer) clearTimeout(redirectTimer);
});

const passwordTooShort = computed(
  () => password.value.length > 0 && password.value.length < 8,
);
const passwordsMismatch = computed(
  () =>
    confirmPassword.value.length > 0 &&
    password.value !== confirmPassword.value,
);
const isValidForm = computed(
  () =>
    password.value.length >= 8 &&
    confirmPassword.value.length >= 8 &&
    password.value === confirmPassword.value,
);

const submit = async () => {
  if (loading.value || !isValidForm.value || !hasToken.value) return;
  loading.value = true;
  networkError.value = '';
  try {
    const result = await confirmReset(token.value, password.value);

    if (result.success) {
      success.value = true;
      redirectTimer = setTimeout(
        () => navigateTo('/auth/login?reset=true'),
        2000,
      );
      return;
    }

    if (result.errorType === 'invalid-token') {
      tokenInvalid.value = true;
      return;
    }

    // Never render result.error raw — it can carry an untranslated
    // server/fetch-layer string. Always route through t().
    networkError.value = t('auth.passwordReset.errors.network');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <AuthShell>
    <AuthConfirmStateCard v-if="!hasToken" variant="danger">
      <template #icon><AuthIconAlert :size="32" /></template>
      <h1 class="auth-heading">
        {{ t('auth.passwordReset.missingToken.title') }}
      </h1>
      <p class="confirm-body">
        {{ t('auth.passwordReset.missingToken.message') }}
      </p>
      <div class="confirm-actions">
        <NuxtLink
          to="/auth/forgot-password"
          class="btn btn-primary btn-full"
          :aria-label="$t('a11y.buttons.requestNewResetLink')"
        >
          {{ t('auth.passwordReset.missingToken.requestButton') }}
        </NuxtLink>
      </div>
    </AuthConfirmStateCard>

    <AuthConfirmStateCard v-else-if="tokenInvalid" variant="danger">
      <template #icon><AuthIconAlert :size="32" /></template>
      <h1 class="auth-heading">
        {{ t('auth.passwordReset.invalidToken.title') }}
      </h1>
      <p class="confirm-body">
        {{ t('auth.passwordReset.invalidToken.message') }}
      </p>
      <div class="confirm-actions">
        <NuxtLink
          to="/auth/forgot-password"
          class="btn btn-primary btn-full"
          :aria-label="$t('a11y.buttons.requestNewResetLink')"
        >
          {{ t('auth.passwordReset.invalidToken.requestButton') }}
        </NuxtLink>
        <button
          class="btn btn-secondary btn-full"
          :aria-label="$t('a11y.buttons.goToLogin')"
          @click="navigateTo('/auth/login')"
        >
          {{ t('auth.passwordReset.invalidToken.loginButton') }}
        </button>
      </div>
    </AuthConfirmStateCard>

    <AuthConfirmStateCard v-else-if="success" variant="success">
      <template #icon><AuthIconCheck :size="32" /></template>
      <h1 class="auth-heading">
        {{ t('auth.passwordReset.success.title') }}
      </h1>
      <p class="confirm-body">
        {{ t('auth.passwordReset.success.message') }}<br />
        <span class="confirm-redirect">{{
          t('auth.passwordReset.success.redirect')
        }}</span>
      </p>
    </AuthConfirmStateCard>

    <template v-else>
      <h1 class="auth-heading">{{ t('auth.passwordReset.title') }}</h1>
      <p class="auth-sub">{{ t('auth.passwordReset.subtitle') }}</p>

      <div
        v-if="networkError"
        id="password-reset-error"
        class="auth-alert auth-alert-error"
        role="alert"
        aria-live="assertive"
      >
        <AuthIconAlert />
        {{ networkError }}
      </div>

      <form class="auth-form" novalidate @submit.prevent="submit">
        <div class="input-group">
          <label class="input-label" for="new-password">{{
            $t('auth.passwordReset.newPassword')
          }}</label>
          <div class="input-with-icon">
            <span class="input-icon" aria-hidden="true">
              <svg
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </span>
            <input
              id="new-password"
              v-model="password"
              class="input"
              type="password"
              :placeholder="$t('auth.passwordReset.newPassword')"
              autocomplete="new-password"
              minlength="8"
              required
              :disabled="loading"
              aria-required="true"
              :aria-describedby="
                passwordTooShort ? 'new-password-hint' : undefined
              "
            />
          </div>
          <p
            v-if="passwordTooShort"
            id="new-password-hint"
            class="input-hint"
            role="alert"
          >
            {{ t('auth.passwordReset.passwordHint') }}
          </p>
        </div>

        <div class="input-group">
          <label class="input-label" for="confirm-password">{{
            $t('auth.passwordReset.confirmPassword')
          }}</label>
          <div class="input-with-icon">
            <span class="input-icon" aria-hidden="true">
              <svg
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </span>
            <input
              id="confirm-password"
              v-model="confirmPassword"
              class="input"
              type="password"
              :placeholder="$t('auth.passwordReset.confirmPassword')"
              autocomplete="new-password"
              minlength="8"
              required
              :disabled="loading"
              aria-required="true"
              :aria-describedby="
                passwordsMismatch ? 'confirm-password-hint' : undefined
              "
            />
          </div>
          <p
            v-if="passwordsMismatch"
            id="confirm-password-hint"
            class="input-hint"
            role="alert"
          >
            {{ t('auth.passwordReset.passwordMismatch') }}
          </p>
        </div>

        <button
          type="submit"
          class="btn btn-primary auth-submit"
          :disabled="loading || !isValidForm"
          :aria-label="$t('a11y.buttons.resetPassword')"
        >
          <AuthIconSpinner v-if="loading" />
          {{ loading ? $t('common.loading') : t('auth.passwordReset.button') }}
        </button>
      </form>
    </template>
  </AuthShell>
</template>

<style scoped>
.auth-bg::before {
  content: '';
  position: absolute;
  width: 600px;
  height: 600px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: radial-gradient(
    circle,
    rgba(59, 130, 246, 0.08) 0%,
    transparent 65%
  );
  pointer-events: none;
}

.input-hint {
  font-size: var(--text-sm);
  color: var(--danger-fg);
  margin-top: 4px;
}

.confirm-body {
  font-size: var(--text-md);
  color: var(--fg-muted);
  line-height: 1.65;
  margin-bottom: 28px;
  max-width: 300px;
}

.confirm-redirect {
  font-size: var(--text-sm);
  color: var(--fg-subtle);
}

.confirm-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.btn-full {
  width: 100%;
  justify-content: center;
  padding: 11px 16px;
  font-size: var(--text-lg);
  font-weight: 600;
}
</style>
