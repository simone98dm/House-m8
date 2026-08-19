<script lang="ts" setup>
/**
 * BillDeleteBillConfirmModal — confirmation step before deleting the whole
 * bill (destructive, includes payment history/documents). Pure
 * presentation; the page owns the actual delete call and loading state.
 */
interface Props {
  show: boolean;
  deleting?: boolean;
  description?: string;
}

interface Events {
  confirm: [];
  cancel: [];
}

const { show, deleting = false, description } = defineProps<Props>();
const emit = defineEmits<Events>();
</script>

<template>
  <UiModal
    :show="show"
    :title="$t('bills.delete.title')"
    @close="emit('cancel')"
  >
    <div class="space-y-4">
      <!-- Shared state-card pattern (main.css) — was bg-error-50/border-error-200
           with zero dark: coverage, plus text-error-800 which isn't a defined
           shade (silently produced no color at all). -->
      <div class="state-card state-card--error items-center">
        <div class="state-card-icon-chip state-card-icon-chip--error">
          <Icon
            name="heroicons:exclamation-triangle"
            class="w-4 h-4"
            aria-hidden="true"
          />
        </div>
        <div>
          <p class="font-semibold">
            {{ $t('bills.delete.warning') }}
          </p>
          <p class="text-sm mt-0.5">
            {{ $t('bills.delete.description') }}
          </p>
        </div>
      </div>
      <p class="text-gray-600 dark:text-gray-400 text-sm">
        {{ $t('bills.delete.confirmMessage', { description }) }}
      </p>
      <div class="flex justify-end gap-3">
        <UiButton
          variant="secondary"
          :disabled="deleting"
          :aria-label="$t('a11y.buttons.cancel')"
          @click="emit('cancel')"
        >
          {{ $t('common.cancel') }}
        </UiButton>
        <UiButton
          variant="danger"
          :loading="deleting"
          :aria-label="$t('a11y.buttons.deleteBill')"
          @click="emit('confirm')"
        >
          {{ $t('common.delete') }}
        </UiButton>
      </div>
    </div>
  </UiModal>
</template>
