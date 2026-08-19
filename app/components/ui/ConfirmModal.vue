<script lang="ts" setup>
/**
 * UiConfirmModal - Simple confirmation modal
 * Props: show, title, message, confirmText, cancelText
 * Emits: confirm, cancel, close
 */
const { t } = useI18n();

interface UiConfirmModalProps {
  show: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  confirmVariant?: 'primary' | 'danger';
}

const {
  show,
  title,
  message = undefined,
  confirmText,
  cancelText,
  loading = false,
  confirmVariant = 'primary',
} = defineProps<UiConfirmModalProps>();

const emit = defineEmits(['confirm', 'cancel', 'close']);

// Computed properties for i18n fallbacks
const displayTitle = computed(() => title || t('common.areYouSure'));
const displayConfirmText = computed(() => confirmText || t('common.confirm'));
const displayCancelText = computed(() => cancelText || t('common.cancel'));
</script>
<template>
  <UiModal
    :show="show"
    :title="displayTitle"
    max-width="max-w-sm"
    @close="emit('close')"
  >
    <p v-if="message" class="text-gray-600 dark:text-gray-400 mb-6">
      {{ message }}
    </p>
    <div class="flex gap-4">
      <UiButton
        variant="secondary"
        class="flex-1"
        :disabled="loading"
        :aria-label="$t('a11y.buttons.cancel')"
        @click="emit('cancel')"
      >
        {{ displayCancelText }}
      </UiButton>
      <UiButton
        :variant="confirmVariant"
        class="flex-1"
        :loading="loading"
        :aria-label="$t('a11y.buttons.confirm')"
        @click="emit('confirm')"
      >
        {{ displayConfirmText }}
      </UiButton>
    </div>
  </UiModal>
</template>
