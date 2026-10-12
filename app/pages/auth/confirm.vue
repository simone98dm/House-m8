<script lang="ts" setup>
definePageMeta({
  layout: false,
});

const { t } = useI18n();

useSeoMeta({
  title: t('seo.titles.confirmEmail'),
  robots: 'noindex, nofollow',
});

const { loading, confirmed, tokenExpired, error } = useEmailConfirmation();
</script>

<template>
  <AuthShell :card-padding-bottom="40">
    <AuthConfirmStateCard
      v-if="loading"
      variant="pending"
      :icon-label="$t('auth.confirmation.processing')"
    >
      <template #icon><AuthIconSpinner :size="32" /></template>
      <h1 class="auth-heading">{{ t('auth.confirmation.title') }}</h1>
      <p class="confirm-body">{{ t('auth.confirmation.processing') }}</p>
    </AuthConfirmStateCard>

    <AuthConfirmStateCard v-else-if="confirmed && !error" variant="success">
      <template #icon><AuthIconCheck :size="32" /></template>
      <h1 class="auth-heading">
        {{ t('auth.confirmation.success.title') }}
      </h1>
      <p class="confirm-body">
        {{ t('auth.confirmation.success.message') }}<br />
        <span class="confirm-redirect">{{
          t('auth.confirmation.success.redirect')
        }}</span>
      </p>
      <UiButton
        size="lg"
        full-width
        :aria-label="$t('a11y.buttons.goToDashboard')"
        @click="navigateTo('/dashboard')"
      >
        {{ t('common.goHome') }}
      </UiButton>
    </AuthConfirmStateCard>

    <AuthConfirmStateCard v-else-if="tokenExpired" variant="danger">
      <template #icon><AuthIconAlert :size="32" /></template>
      <h1 class="auth-heading">
        {{ t('auth.confirmation.expired.title') }}
      </h1>
      <p class="confirm-body">{{ t('auth.confirmation.expired.message') }}</p>
      <div class="confirm-actions">
        <UiButton
          to="/auth/register"
          size="lg"
          full-width
          :aria-label="$t('auth.confirmation.expired.resendButton')"
        >
          {{ t('auth.confirmation.expired.resendButton') }}
        </UiButton>
        <UiButton
          variant="secondary"
          size="lg"
          full-width
          :aria-label="$t('a11y.buttons.goToLogin')"
          @click="navigateTo('/auth/login')"
        >
          {{ t('auth.confirmation.error.loginButton') }}
        </UiButton>
      </div>
    </AuthConfirmStateCard>

    <AuthConfirmStateCard v-else variant="danger">
      <template #icon>
        <svg
          width="32"
          height="32"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </template>
      <h1 class="auth-heading">
        {{ t('auth.confirmation.error.title') }}
      </h1>
      <p class="confirm-body">{{ error }}</p>
      <div class="confirm-actions">
        <UiButton
          size="lg"
          full-width
          :aria-label="$t('a11y.buttons.goToLogin')"
          @click="navigateTo('/auth/login')"
        >
          {{ t('auth.confirmation.error.loginButton') }}
        </UiButton>
        <UiButton
          variant="secondary"
          size="lg"
          full-width
          :aria-label="$t('a11y.buttons.signUp')"
          @click="navigateTo('/auth/register')"
        >
          {{ t('auth.confirmation.error.registerButton') }}
        </UiButton>
      </div>
    </AuthConfirmStateCard>
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
