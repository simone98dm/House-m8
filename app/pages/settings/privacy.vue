<script setup lang="ts">
useSeoMeta({ title: 'Privacy & Data - House M8' });

const { t } = useI18n();
const { formatShort } = useDate();
const api = useApi();
const route = useRoute();

const { data: meData, refresh } = await useFetch('/api/users/me');
const user = computed(
  () => (meData.value as { data?: Record<string, unknown> } | null)?.data,
);

const deletedAt = computed(
  () => (user.value?.deleted_at as string | null) ?? null,
);
const termsAcceptedAt = computed(
  () => user.value?.terms_accepted_at as string | null,
);
const consentVersion = computed(
  () => user.value?.consent_version as string | null,
);

const cancelToken = route.query.cancel_token as string | undefined;
const cancelMessage = ref('');

onMounted(async () => {
  if (cancelToken) {
    try {
      await api.fetch('/api/gdpr/cancel-delete', {
        method: 'POST',
        body: { token: cancelToken },
      });
      cancelMessage.value = t('gdpr.cancelDeletion') + ' ✓';
      await refresh();
    } catch {
      cancelMessage.value = t('gdpr.cancelDeletionFailed');
    }
    await navigateTo('/settings/privacy', { replace: true });
  }
});

function formatDate(iso: string | null | undefined) {
  return formatShort(iso);
}
</script>

<template>
  <div class="mx-auto max-w-2xl space-y-8 px-4 py-8">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {{ t('gdpr.settingsTitle') }}
      </h1>
      <p class="mt-1 text-gray-500 dark:text-gray-300">
        {{ t('gdpr.settingsSubtitle') }}
      </p>
    </div>

    <div
      v-if="cancelMessage"
      role="alert"
      class="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
    >
      {{ cancelMessage }}
    </div>

    <section aria-labelledby="export-section-heading">
      <h2 id="export-section-heading" class="sr-only">
        {{ t('gdpr.exportSection') }}
      </h2>
      <GdprDataExport />
    </section>

    <section
      aria-labelledby="docs-section-heading"
      class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5"
    >
      <h2
        id="docs-section-heading"
        class="font-semibold text-gray-900 dark:text-gray-100"
      >
        {{ t('gdpr.docsTitle') }}
      </h2>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-300">
        {{ t('gdpr.docsDescription') }}
      </p>
      <div class="mt-4 flex flex-wrap gap-3">
        <NuxtLink
          to="/privacy"
          target="_blank"
          class="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {{ t('gdpr.privacyLink') }}
        </NuxtLink>
        <NuxtLink
          to="/terms"
          target="_blank"
          class="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {{ t('gdpr.termsLink') }}
        </NuxtLink>
      </div>
    </section>

    <section
      aria-labelledby="consents-section-heading"
      class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
    >
      <h2
        id="consents-section-heading"
        class="border-b border-gray-100 dark:border-gray-700 px-5 py-4 font-semibold text-gray-900 dark:text-gray-100"
      >
        {{ t('gdpr.consentSection') }}
      </h2>
      <div class="divide-y divide-gray-100 dark:divide-gray-700">
        <div class="flex items-center justify-between px-5 py-4">
          <div>
            <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
              Privacy Policy &amp; Terms
            </p>
            <p
              v-if="termsAcceptedAt"
              class="text-xs text-gray-500 dark:text-gray-300"
            >
              {{
                t('gdpr.consentAcceptedOn', {
                  date: formatDate(termsAcceptedAt),
                  version: consentVersion ?? '—',
                })
              }}
            </p>
            <p v-else class="text-xs text-gray-500 dark:text-gray-300">
              {{ t('gdpr.consentNotAcceptedYet') }}
            </p>
          </div>
          <span
            v-if="termsAcceptedAt"
            class="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700"
          >
            {{ t('gdpr.consentAccepted') }}
          </span>
          <span
            v-else
            class="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300"
          >
            {{ t('gdpr.consentPending') }}
          </span>
        </div>
      </div>
    </section>

    <section aria-labelledby="danger-section-heading">
      <h2
        id="danger-section-heading"
        class="mb-3 font-semibold text-red-600 dark:text-red-400"
      >
        {{ t('gdpr.dangerZone') }}
      </h2>
      <GdprAccountDeletion
        :deleted-at="deletedAt"
        @cancelled="refresh"
        @deleted="navigateTo('/')"
      />
    </section>
  </div>
</template>
