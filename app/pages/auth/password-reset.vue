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
        <UiButton
          to="/auth/forgot-password"
          size="lg"
          full-width
          :aria-label="$t('a11y.buttons.requestNewResetLink')"
        >
          {{ t('auth.passwordReset.missingToken.requestButton') }}
        </UiButton>
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
        <UiButton
          to="/auth/forgot-password"
          size="lg"
          full-width
          :aria-label="$t('a11y.buttons.requestNewResetLink')"
        >
          {{ t('auth.passwordReset.invalidToken.requestButton') }}
        </UiButton>
        <UiButton
          variant="secondary"
          size="lg"
          full-width
          :aria-label="$t('a11y.buttons.goToLogin')"
          @click="navigateTo('/auth/login')"
        >
          {{ t('auth.passwordReset.invalidToken.loginButton') }}
        </UiButton>
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
        <UiInput
          id="new-password"
          v-model="password"
          type="password"
          :label="$t('auth.passwordReset.newPassword')"
          :placeholder="$t('auth.passwordReset.newPassword')"
          autocomplete="new-password"
          minlength="8"
          required
          :disabled="loading"
          :error="passwordTooShort"
          :hint="
            passwordTooShort ? t('auth.passwordReset.passwordHint') : undefined
          "
        >
          <template #icon><AuthIconLock /></template>
        </UiInput>

        <UiInput
          id="confirm-password"
          v-model="confirmPassword"
          type="password"
          :label="$t('auth.passwordReset.confirmPassword')"
          :placeholder="$t('auth.passwordReset.confirmPassword')"
          autocomplete="new-password"
          minlength="8"
          required
          :disabled="loading"
          :error="passwordsMismatch"
          :hint="
            passwordsMismatch
              ? t('auth.passwordReset.passwordMismatch')
              : undefined
          "
        >
          <template #icon><AuthIconLock /></template>
        </UiInput>

        <UiButton
          type="submit"
          size="lg"
          full-width
          :loading="loading"
          :disabled="!isValidForm"
          :aria-label="$t('a11y.buttons.resetPassword')"
        >
          {{ loading ? $t('common.loading') : t('auth.passwordReset.button') }}
        </UiButton>
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

.confirm-body {
  font-size: var(--fs-md);
  color: var(--fg-muted);
  line-height: 1.65;
  margin-bottom: 28px;
  max-width: 300px;
}

.confirm-redirect {
  font-size: var(--fs-sm);
  color: var(--fg-subtle);
}

.confirm-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}
</style>
