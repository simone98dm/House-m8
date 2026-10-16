<script lang="ts" setup>
definePageMeta({
  layout: false,
});

const { t } = useI18n();

useSeoMeta({
  title: t('seo.titles.login'),
  robots: 'noindex, nofollow',
});

const route = useRoute();
const userStore = useUserStore();
const auth = useAuth();
const { isEnabled } = useFeatureFlags();

const email = ref('');
const password = ref('');
const rememberMe = ref(false);
const loading = ref(false);
const error = ref('');

const confirmationSuccess = computed(() => route.query.confirmed === 'true');
const passwordResetSuccess = computed(() => route.query.reset === 'true');

const redirectPath = computed(() => {
  const redirect = route.query.redirect;
  if (typeof redirect === 'string' && !redirect.startsWith('/auth/')) {
    return redirect;
  }
  return '/dashboard';
});

const signIn = async () => {
  if (loading.value) return;
  loading.value = true;
  error.value = '';
  try {
    const result = await userStore.login(
      email.value,
      password.value,
      rememberMe.value,
    );
    if (result.success) {
      await navigateTo(redirectPath.value, { replace: true });
    } else {
      error.value = result.error || t('auth.errors.loginFailed');
    }
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : t('auth.errors.loginFailed');
  } finally {
    loading.value = false;
  }
};

const signInWithGoogle = async () => {
  if (loading.value) return;
  loading.value = true;
  error.value = '';
  try {
    if (redirectPath.value !== '/dashboard') {
      sessionStorage.setItem('auth_redirect', redirectPath.value);
    }
    const response = await auth.signInWithGoogle();
    if (response.error) {
      error.value = response.error;
      loading.value = false;
    }
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : t('auth.errors.loginFailed');
    loading.value = false;
  }
};
</script>

<template>
  <!-- The Google button below stays raw: AuthShell owns the .btn-google
       variant and it is not on UiButton's scale. -->
  <AuthShell>
    <h1 class="auth-heading">{{ $t('auth.login.title') }}</h1>
    <p class="auth-sub">{{ $t('auth.login.subtitle') }}</p>

    <div
      v-if="confirmationSuccess"
      class="auth-alert auth-alert-success"
      role="alert"
    >
      <AuthIconCheck />
      {{ $t('auth.login.emailConfirmed') }}
    </div>

    <div
      v-if="passwordResetSuccess"
      class="auth-alert auth-alert-success"
      role="alert"
    >
      <AuthIconCheck />
      {{ $t('auth.login.passwordResetSuccess') }}
    </div>

    <div
      v-if="error"
      class="auth-alert auth-alert-error"
      role="alert"
      aria-live="assertive"
    >
      <AuthIconAlert />
      {{ error }}
    </div>

    <form class="auth-form" novalidate @submit.prevent="signIn">
      <UiInput
        id="email"
        v-model="email"
        type="email"
        :label="$t('auth.login.email')"
        :placeholder="$t('auth.login.email')"
        autocomplete="email"
        required
        :disabled="loading"
      >
        <template #icon><AuthIconEmail /></template>
      </UiInput>

      <UiInput
        id="password"
        v-model="password"
        type="password"
        :label="$t('auth.login.password')"
        :placeholder="$t('auth.login.password')"
        autocomplete="current-password"
        required
        :disabled="loading"
      >
        <template #icon><AuthIconLock /></template>
        <template #label-append>
          <NuxtLink to="/auth/forgot-password" class="auth-forgot-link">{{
            $t('auth.login.forgotPassword')
          }}</NuxtLink>
        </template>
      </UiInput>

      <!-- Remember me: raw, UiCheckbox is a toggle switch, wrong shape here -->
      <label class="auth-check-row">
        <input v-model="rememberMe" type="checkbox" class="auth-checkbox" />
        <span>{{ $t('auth.login.rememberMe') }}</span>
      </label>

      <UiButton
        type="submit"
        size="lg"
        full-width
        :loading="loading"
        :disabled="!email || !password"
        :aria-label="$t('a11y.buttons.signIn')"
      >
        {{ loading ? $t('common.loading') : $t('auth.login.button') }}
      </UiButton>

      <template v-if="isEnabled('new-users')">
        <div class="auth-divider">{{ $t('auth.login.orContinueWith') }}</div>

        <button
          type="button"
          class="btn-google"
          :disabled="loading"
          :aria-label="$t('a11y.buttons.signInWithGoogle')"
          @click="signInWithGoogle"
        >
          <AuthIconGoogleLogo />
          {{ $t('auth.login.googleButton') }}
        </button>
      </template>
    </form>

    <template v-if="isEnabled('new-users')" #footer-link>
      {{ $t('auth.login.noAccount') }}
      <NuxtLink to="/auth/register">{{ $t('auth.login.signUp') }}</NuxtLink>
    </template>
  </AuthShell>
</template>

<style scoped>
.auth-bg::before {
  content: '';
  position: absolute;
  width: 700px;
  height: 700px;
  top: -250px;
  left: -200px;
  background: radial-gradient(
    circle,
    rgba(59, 130, 246, 0.1) 0%,
    transparent 65%
  );
  pointer-events: none;
}
.auth-bg::after {
  content: '';
  position: absolute;
  width: 600px;
  height: 600px;
  bottom: -200px;
  right: -150px;
  background: radial-gradient(
    circle,
    rgba(139, 92, 246, 0.08) 0%,
    transparent 65%
  );
  pointer-events: none;
}

.auth-check-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--fs-base);
  color: var(--fg-muted);
  cursor: pointer;
  user-select: none;
}

.auth-checkbox {
  width: 15px;
  height: 15px;
  border-radius: 4px;
  cursor: pointer;
  accent-color: var(--primary);
}

.auth-forgot-link {
  font-size: var(--fs-sm);
  color: var(--primary);
  font-weight: 500;
  text-decoration: none;
}
.auth-forgot-link:hover {
  text-decoration: underline;
}
</style>
