<script lang="ts" setup>
definePageMeta({
  layout: false,
});

const { t } = useI18n();

useSeoMeta({
  title: t('seo.titles.forgotPassword'),
  robots: 'noindex, nofollow',
});

const { requestReset } = usePasswordReset();

const email = ref('');
const loading = ref(false);
const submitted = ref(false);
const error = ref('');

const submit = async () => {
  if (loading.value || !email.value) return;
  loading.value = true;
  error.value = '';
  try {
    const result = await requestReset(email.value);
    if (result.error) {
      error.value = t('auth.forgotPassword.errors.network');
      return;
    }
    submitted.value = true;
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <AuthShell>
    <template v-if="submitted">
      <div class="auth-success-state">
        <div class="auth-success-icon" aria-hidden="true">
          <AuthIconEmail :size="28" />
        </div>
        <h1 class="auth-heading" style="text-align: center">
          {{ t('auth.forgotPassword.sent.title') }}
        </h1>
        <p class="auth-sub" style="text-align: center">
          {{ t('auth.forgotPassword.sent.message') }}
        </p>
        <UiButton
          size="lg"
          full-width
          :aria-label="$t('a11y.buttons.goToLogin')"
          @click="navigateTo('/auth/login')"
        >
          {{ t('auth.forgotPassword.sent.button') }}
        </UiButton>
      </div>
    </template>

    <template v-else>
      <h1 class="auth-heading">{{ t('auth.forgotPassword.title') }}</h1>
      <p class="auth-sub">{{ t('auth.forgotPassword.subtitle') }}</p>

      <div
        v-if="error"
        id="forgot-password-error"
        class="auth-alert auth-alert-error"
        role="alert"
        aria-live="assertive"
      >
        <AuthIconAlert />
        {{ error }}
      </div>

      <form class="auth-form" novalidate @submit.prevent="submit">
        <UiInput
          id="email"
          v-model="email"
          type="email"
          :label="$t('auth.forgotPassword.email')"
          :placeholder="$t('auth.forgotPassword.email')"
          autocomplete="email"
          required
          :disabled="loading"
          :aria-describedby="error ? 'forgot-password-error' : undefined"
        >
          <template #icon><AuthIconEmail /></template>
        </UiInput>

        <UiButton
          type="submit"
          size="lg"
          full-width
          :loading="loading"
          :disabled="!email"
          :aria-label="$t('a11y.buttons.sendResetLink')"
        >
          {{ loading ? $t('common.loading') : t('auth.forgotPassword.button') }}
        </UiButton>
      </form>
    </template>

    <template v-if="!submitted" #footer-link>
      {{ t('auth.forgotPassword.rememberPassword') }}
      <NuxtLink to="/auth/login">{{
        t('auth.forgotPassword.backToLogin')
      }}</NuxtLink>
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

.auth-success-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
}

.auth-success-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--success-subtle);
  color: var(--success-fg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}
</style>
