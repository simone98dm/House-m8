<script lang="ts" setup>
import type { CreateBulletinNotePayload } from '~/types';

interface BulletinModalProps {
  show: boolean;
}

interface BulletinModalEvents {
  close: [];
  submit: [payload: CreateBulletinNotePayload];
}

const { show } = defineProps<BulletinModalProps>();
const emit = defineEmits<BulletinModalEvents>();

const { t } = useI18n();

const message = ref('');
const dismissDate = ref('');

/** Minimum selectable date is today. */
const minDate = computed(() => {
  return new Date().toISOString().split('T')[0];
});

const handleSubmit = () => {
  if (!message.value.trim()) return;

  const payload: CreateBulletinNotePayload = {
    message: message.value.trim(),
  };
  if (dismissDate.value) {
    payload.dismiss_date = dismissDate.value;
  }

  emit('submit', payload);

  // Reset form
  message.value = '';
  dismissDate.value = '';
};

const handleClose = () => emit('close');

// Close on Escape key — listener removed automatically via onUnmounted
onMounted(() => {
  const onEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && show) handleClose();
  };
  globalThis.addEventListener('keydown', onEscape);
  onUnmounted(() => globalThis.removeEventListener('keydown', onEscape));
});
</script>

<template>
  <UiModal :show="show" :title="t('bulletin.modal.title')" @close="handleClose">
    <div class="mb-5">
      <label
        for="bulletin-message"
        class="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
      >
        {{ t('bulletin.modal.message') }}
      </label>
      <textarea
        id="bulletin-message"
        v-model="message"
        rows="4"
        required
        class="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm transition-all focus:border-primary-600 focus:outline-hidden focus:ring-2 focus:ring-primary-600/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        :placeholder="t('bulletin.modal.messagePlaceholder')"
      />
    </div>

    <div class="mb-6">
      <label
        for="bulletin-dismiss-date"
        class="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
      >
        {{ t('bulletin.modal.dismissDateOptional') }}
      </label>
      <!-- Raw input, not UiInput: UiInput's root is a single wrapping <div>,
           so an undeclared attr like `min` falls through onto that div, not
           the native input inside — it would silently stop enforcing the min date.
           Pre-existing gap in UiInput itself (also affects bill/EditModal.vue,
           bill/Modal.vue, house/Modal.vue, house/EditModal.vue); flagged, not
           fixed here since fixing UiInput is outside this sweep's scope. -->
      <input
        id="bulletin-dismiss-date"
        v-model="dismissDate"
        type="date"
        :min="minDate"
        class="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm transition-all focus:border-primary-600 focus:outline-hidden focus:ring-2 focus:ring-primary-600/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
      />
      <p class="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
        {{ t('bulletin.modal.dismissDateHelp') }}
      </p>
    </div>

    <div class="flex gap-3">
      <UiButton
        type="button"
        variant="secondary"
        icon="no-symbol"
        class="flex-1"
        :aria-label="t('a11y.buttons.cancel')"
        @click="handleClose"
      >
        {{ t('bulletin.modal.cancel') }}
      </UiButton>
      <UiButton
        type="submit"
        variant="primary"
        icon="check"
        class="flex-1"
        :aria-label="t('a11y.buttons.postNote')"
        @click="handleSubmit"
      >
        {{ t('bulletin.modal.post') }}
      </UiButton>
    </div>
  </UiModal>
</template>
