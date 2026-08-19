<script lang="ts" setup>
/**
 * BillDeleteDocumentConfirmModal — confirmation step before deleting a
 * document from the bill. Pure presentation, no fetch/store access; the
 * page owns which document is targeted and what "confirm" actually does
 * (currently the deliberate upload/delete stub — see [id].vue).
 */
interface Props {
  show: boolean;
}

interface Events {
  confirm: [];
  cancel: [];
}

defineProps<Props>();
const emit = defineEmits<Events>();
</script>

<template>
  <UiModal
    :show="show"
    :title="$t('bills.delete.title')"
    @close="emit('cancel')"
  >
    <div class="space-y-4">
      <p class="text-gray-600 dark:text-gray-400">
        {{ $t('bills.details.deleteDocumentConfirm') }}
      </p>
      <div class="flex justify-end gap-3">
        <UiButton
          variant="secondary"
          :aria-label="$t('a11y.buttons.cancel')"
          @click="emit('cancel')"
        >
          {{ $t('common.cancel') }}
        </UiButton>
        <UiButton
          variant="danger"
          :aria-label="$t('a11y.buttons.deleteDocument')"
          @click="emit('confirm')"
        >
          {{ $t('common.delete') }}
        </UiButton>
      </div>
    </div>
  </UiModal>
</template>
