<script setup lang="ts">
import type { BillDocument } from '~/types';

interface BillDocumentsListProps {
  documents: BillDocument[];
  canDelete: boolean;
  getFileIcon: (filename: string) => string;
  formatDate: (date: string) => string;
}

defineProps<BillDocumentsListProps>();

interface BillDocumentListEvents {
  download: [doc: BillDocument];
  view: [doc: BillDocument];
  delete: [doc: BillDocument];
  upload: [];
}

const emit = defineEmits<BillDocumentListEvents>();

const { t: $t } = useI18n();
</script>

<template>
  <div>
    <div v-if="documents && documents.length > 0" class="space-y-2">
      <div
        v-for="document in documents"
        :key="document.id"
        class="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-primary-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer group"
      >
        <div
          class="size-10 rounded bg-info-50 flex items-center justify-center text-info-600 shrink-0"
        >
          <Icon
            :name="getFileIcon(document.filename)"
            class="w-5 h-5"
            aria-hidden="true"
          />
        </div>

        <div class="flex-1 min-w-0">
          <p
            class="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate"
          >
            {{ document.filename }}
          </p>
          <p class="text-xs text-gray-400 dark:text-gray-500">
            {{ $t('bills.details.uploadedBy') }}
            {{ formatDate(document.uploaded_at) }}
          </p>
        </div>

        <!-- Actions. Raw: bespoke tiny icon-only row actions (p-2, no
             border/bg) revealed on row hover — UiButton's padding/variant
             backgrounds don't fit this compact hover-reveal pattern. -->
        <!-- Hover-reveal is desktop-only and must keep the focus-within
             fallback. Previously `opacity-0 group-hover:opacity-100`: on a
             touch device there is no hover, so download/delete were
             permanently invisible, and keyboard focus landed on an invisible
             control (WCAG 2.4.7). -->
        <div
          class="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity"
        >
          <button
            type="button"
            class="p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
            :aria-label="`${$t('a11y.buttons.uploadDocument')} ${document.filename}`"
            @click="emit('download', document)"
          >
            <Icon
              name="heroicons:arrow-down-tray"
              class="w-4 h-4"
              aria-hidden="true"
            />
          </button>
          <button
            type="button"
            class="p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
            :aria-label="`${$t('a11y.buttons.viewDocument')} ${document.filename}`"
            @click="emit('view', document)"
          >
            <Icon name="heroicons:eye" class="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            v-if="canDelete"
            type="button"
            class="p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:text-error-600 hover:bg-error-50 transition-colors"
            :aria-label="`${$t('a11y.buttons.deleteDocument')} ${document.filename}`"
            @click="emit('delete', document)"
          >
            <Icon name="heroicons:trash" class="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-8">
      <div
        class="size-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-3"
      >
        <Icon
          name="heroicons:document"
          class="w-5 h-5 text-gray-400 dark:text-gray-500"
          aria-hidden="true"
        />
      </div>
      <h3 class="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1">
        {{ $t('bills.details.noDocuments') }}
      </h3>
      <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">
        {{ $t('bills.details.uploadInstructions') }}
      </p>
      <UiButton
        size="sm"
        icon="document-plus"
        :aria-label="$t('a11y.buttons.uploadDocument')"
        @click="emit('upload')"
      >
        {{ $t('bills.details.uploadDocument') }}
      </UiButton>
    </div>
  </div>
</template>
