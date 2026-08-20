<script setup lang="ts">
interface AccountDeletionProps {
  deletedAt: string | null;
}

interface AccountDeletionEmits {
  cancelled: [];
  deleted: [];
}

const { deletedAt } = defineProps<AccountDeletionProps>();
const emit = defineEmits<AccountDeletionEmits>();

const { t } = useI18n();
const { formatLong } = useDate();
const api = useApi();

const loading = ref(false);
const error = ref('');

const scheduledFor = computed(() => {
  if (!deletedAt) return null;
  const d = new Date(deletedAt);
  d.setDate(d.getDate() + 30);
  return d;
});

const daysRemaining = computed(() => {
  if (!scheduledFor.value) return 0;
  return Math.max(
    0,
    Math.ceil((scheduledFor.value.getTime() - Date.now()) / 86400000),
  );
});

const formattedDate = computed(() =>
  formatLong(scheduledFor.value, { weekday: false }),
);

async function requestDeletion() {
  if (!confirm(t('gdpr.deleteDescription'))) return;
  loading.value = true;
  error.value = '';
  try {
    await api.fetch('/api/gdpr/delete-account', {
      method: 'POST',
      body: { confirm: true },
    });
    emit('deleted');
  } catch {
    error.value = t('common.error');
  } finally {
    loading.value = false;
  }
}

async function cancelDeletion() {
  loading.value = true;
  error.value = '';
  try {
    await api.fetch('/api/gdpr/cancel-delete', { method: 'POST', body: {} });
    emit('cancelled');
  } catch {
    error.value = t('common.error');
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div
    v-if="deletedAt"
    role="alert"
    class="rounded-xl border border-orange-200 bg-orange-50 p-5"
    :aria-label="t('gdpr.deletePendingTitle')"
  >
    <div class="flex items-start gap-3">
      <span aria-hidden="true" class="text-2xl">⏳</span>
      <div class="flex-1">
        <p class="font-semibold text-orange-900">
          {{ t('gdpr.deletePendingTitle') }}
        </p>
        <p class="mt-1 text-sm text-orange-800">
          {{
            t('gdpr.deletePendingDescription', {
              date: formattedDate,
              days: daysRemaining,
            })
          }}
        </p>
        <p
          v-if="error"
          class="mt-2 text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          {{ error }}
        </p>
        <UiButton
          type="button"
          variant="secondary"
          class="mt-3"
          :disabled="loading"
          :loading="loading"
          :aria-busy="loading"
          @click="cancelDeletion"
        >
          {{ t('gdpr.cancelDeletion') }}
        </UiButton>
      </div>
    </div>
  </div>

  <div
    v-else
    class="rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-900/50 dark:bg-error-600/[0.08]"
  >
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="font-semibold text-gray-900 dark:text-gray-100">
          {{ t('gdpr.deleteTitle') }}
        </p>
        <p
          id="delete-account-description"
          class="mt-1 text-sm text-gray-500 dark:text-gray-400"
        >
          {{ t('gdpr.deleteDescription') }}
        </p>
      </div>
      <UiButton
        type="button"
        variant="danger"
        :disabled="loading"
        :loading="loading"
        :aria-busy="loading"
        aria-describedby="delete-account-description"
        @click="requestDeletion"
      >
        {{ t('gdpr.deleteButton') }}
      </UiButton>
    </div>
    <p
      v-if="error"
      class="mt-2 text-sm text-red-600 dark:text-red-400"
      role="alert"
    >
      {{ error }}
    </p>
  </div>
</template>
