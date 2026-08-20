<script lang="ts" setup>
// Size justification (Phase 7, "no component over ~250 lines without one"):
// ~261 lines for a single cohesive responsibility — the registration screen —
// not several. Its three template branches (registrations-closed,
// email-sent success, the form) are mutually exclusive states of ONE signup
// flow sharing the same `loading`/`error` refs and the same AuthShell host;
// they are never rendered, or reused, independently of this page. The
// closed/success branches have no internal state worth a component seam
// (one static message, one button); splitting them off would only trade a
// few lines of template for prop/emit plumbing carrying that shared state
// back and forth. The form's own fields (email, GDPR consent) are unique to
// registration — login.vue's fields are entirely different — so there is no
// duplication with a sibling auth page to extract either; Phase 2 already
// hoisted the genuinely shared chrome into AuthShell. The file crossed 250
// when the OAuth consent gate (GdprConsentCheckbox + the disabled/
// aria-describedby wiring on the Google button) landed — a compliance fix,
// not drift. Left whole deliberately.
definePageMeta({
  layout: false,
});

const { t } = useI18n();

useSeoMeta({
  title: t('seo.titles.register'),
  robots: 'noindex, nofollow',
});

const route = useRoute();
const userStore = useUserStore();
const auth = useAuth();
// The Google button below stays raw: AuthShell owns the .btn-google variant
// and it is not on UiButton's scale (see login.vue).
const { isEnabled } = useFeatureFlags();

const email = ref('');
const termsAccepted = ref(false);
const loading = ref(false);
const error = ref('');
const registrationSuccess = ref(false);

const redirectPath = computed(() => {
  const redirect = route.query.redirect;
  if (typeof redirect === 'string' && !redirect.startsWith('/auth/')) {
    return redirect;
  }
  return '/dashboard';
});

const isValidForm = computed(() => email.value && termsAccepted.value);

const signUp = async () => {
  if (loading.value || !isValidForm.value) return;
  loading.value = true;
  error.value = '';
  try {
    const result = await userStore.register(email.value, true);
    if (result.success) {
      registrationSuccess.value = true;
    } else {
      error.value = result.message || t('auth.errors.genericError');
    }
  } catch (err: unknown) {
    error.value =
      err && typeof err === 'object' && 'message' in err
        ? (err as { message: string }).message
        : t('auth.errors.genericError');
  } finally {
    loading.value = false;
  }
};

const signUpWithGoogle = async () => {
  if (loading.value || !termsAccepted.value) return;
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
  } catch {
    error.value = t('common.error');
    loading.value = false;
  }
};

onMounted(() => {
  if (userStore.currentUser) navigateTo('/dashboard');
});
</script>

<template>
  <AuthShell :card-max-width="440">
    <template v-if="!isEnabled('new-users')">
      <h1 class="auth-heading">{{ t('auth.register.closed.title') }}</h1>
      <p class="auth-sub">{{ t('auth.register.closed.message') }}</p>
      <div class="auth-form">
        <UiButton
          size="lg"
          full-width
          :aria-label="$t('a11y.buttons.goToLogin')"
          @click="navigateTo('/auth/login')"
        >
          {{ t('auth.register.closed.button') }}
        </UiButton>
      </div>
    </template>

    <template v-else-if="registrationSuccess">
      <div class="auth-success-state">
        <div class="auth-success-icon" aria-hidden="true">
          <AuthIconEmail :size="28" />
        </div>
        <h1 class="auth-heading" style="text-align: center">
          {{ t('auth.register.emailSent.title') }}
        </h1>
        <p class="auth-sub" style="text-align: center">
          {{ t('auth.register.emailSent.message') }}
        </p>
        <UiButton
          size="lg"
          full-width
          :aria-label="$t('a11y.buttons.goToLogin')"
          @click="navigateTo('/auth/login')"
        >
          {{ t('auth.register.emailSent.button') }}
        </UiButton>
      </div>
    </template>

    <template v-else>
      <h1 class="auth-heading">{{ t('auth.signUp.title') }}</h1>
      <p class="auth-sub">{{ t('auth.signUp.subtitle') }}</p>

      <div
        v-if="error"
        id="register-error"
        class="auth-alert auth-alert-error"
        role="alert"
        aria-live="assertive"
      >
        <AuthIconAlert />
        {{ error }}
      </div>

      <form class="auth-form" novalidate @submit.prevent="signUp">
        <UiInput
          id="email"
          v-model="email"
          type="email"
          :label="$t('auth.signUp.email')"
          :placeholder="$t('auth.signUp.emailPlaceholder')"
          autocomplete="email"
          required
          :disabled="loading"
          :aria-describedby="error ? 'register-error' : undefined"
        >
          <template #icon><AuthIconEmail /></template>
        </UiInput>

        <GdprConsentCheckbox v-model="termsAccepted" />

        <UiButton
          type="submit"
          size="lg"
          full-width
          :loading="loading"
          :disabled="!isValidForm"
          :aria-label="$t('a11y.buttons.signUp')"
        >
          {{ loading ? $t('common.loading') : t('auth.signUp.button') }}
        </UiButton>

        <template v-if="isEnabled('new-users')">
          <div class="auth-divider">
            {{ $t('auth.signUp.orContinueWith') }}
          </div>

          <button
            type="button"
            class="btn-google"
            :disabled="loading || !termsAccepted"
            :aria-disabled="loading || !termsAccepted"
            :aria-describedby="
              !termsAccepted ? 'google-consent-hint' : undefined
            "
            :aria-label="$t('a11y.buttons.signUpWithGoogle')"
            @click="signUpWithGoogle"
          >
            <AuthIconGoogleLogo />
            {{ $t('auth.signUp.googleButton') }}
          </button>
          <p
            v-if="!termsAccepted"
            id="google-consent-hint"
            class="auth-sub"
            style="font-size: 0.8125rem; margin-top: -8px"
          >
            {{ t('gdpr.consentRequired') }}
          </p>
        </template>
      </form>
    </template>

    <template
      v-if="isEnabled('new-users') && !registrationSuccess"
      #footer-link
    >
      {{ t('auth.signUp.hasAccount') }}
      <NuxtLink to="/auth/login">{{ t('auth.signUp.signIn') }}</NuxtLink>
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
  right: -200px;
  background: radial-gradient(
    circle,
    rgba(139, 92, 246, 0.1) 0%,
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
  left: -150px;
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
