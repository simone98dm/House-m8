<script setup lang="ts">
const CURRENT_CONSENT_VERSION = '1.0';

interface ConsentVersionModalProps {
  userConsentVersion: string | null;
}

interface ConsentVersionModalEmits {
  accepted: [];
}

const { userConsentVersion } = defineProps<ConsentVersionModalProps>();
const emit = defineEmits<ConsentVersionModalEmits>();

const { t } = useI18n();
const api = useApi();

const show = computed(
  () => !userConsentVersion || userConsentVersion < CURRENT_CONSENT_VERSION,
);

const loading = ref(false);

async function accept() {
  loading.value = true;
  try {
    await api.fetch('/api/users/me', {
      method: 'PUT',
      body: {
        consent_version: CURRENT_CONSENT_VERSION,
        terms_accepted_at: new Date().toISOString(),
      },
    });
    emit('accepted');
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-modal-title"
    >
      <div
        class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800"
      >
        <h2
          id="consent-modal-title"
          class="text-lg font-semibold text-gray-900 dark:text-gray-100"
        >
          {{ t('gdpr.consentVersionTitle') }}
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {{
            t('gdpr.consentVersionDescription', {
              version: CURRENT_CONSENT_VERSION,
            })
          }}
        </p>
        <div class="mt-4 flex justify-end gap-3">
          <NuxtLink
            to="/privacy"
            target="_blank"
            class="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            {{ t('gdpr.privacyLink') }}
          </NuxtLink>
          <UiButton
            type="button"
            variant="primary"
            :disabled="loading"
            :loading="loading"
            :aria-busy="loading"
            @click="accept"
          >
            {{ t('gdpr.consentVersionAccept') }}
          </UiButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>
