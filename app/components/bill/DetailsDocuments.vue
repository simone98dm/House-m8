<script lang="ts" setup>
import type { BillDocument } from '~/types';

interface Props {
  documents: BillDocument[];
  canDelete: boolean;
}

const { documents, canDelete } = defineProps<Props>();

interface Emits {
  view: [document: BillDocument];
  download: [document: BillDocument];
  delete: [document: BillDocument];
  upload: [];
}

const emit = defineEmits<Emits>();

const { t: $t } = useI18n();
const { formatDate, getFileIcon } = useBillDetails();
</script>

<template>
  <UiCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold text-gray-900 dark:text-gray-100">
          {{ $t('bills.details.documents') }}
        </h2>
        <span class="text-xs font-medium text-gray-500 dark:text-gray-400">
          {{ $t('bills.details.documentCount', documents.length) }}
        </span>
      </div>
    </template>

    <BillDocumentsList
      :documents="documents"
      :can-delete="canDelete"
      :get-file-icon="getFileIcon"
      :format-date="formatDate"
      @view="emit('view', $event)"
      @download="emit('download', $event)"
      @delete="emit('delete', $event)"
      @upload="emit('upload')"
    />

    <!-- Upload drop zone (always shown below list). Raw: a dashed-border
         zone with a stacked icon/title/subtitle, not a UiButton variant —
         UiButton has no dashed-outline style and centers content
         horizontally, not in this vertical icon-above-text stack. -->
    <button
      type="button"
      class="mt-4 w-full border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-primary-400 hover:bg-primary-50/30 transition-all cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-primary-500"
      :aria-label="$t('a11y.buttons.uploadDocument')"
      @click="emit('upload')"
    >
      <div
        class="size-12 rounded-full bg-brand-subtle flex items-center justify-center text-brand-hover mb-3"
      >
        <Icon
          name="heroicons:arrow-up-tray"
          class="w-5 h-5"
          aria-hidden="true"
        />
      </div>
      <p class="text-sm font-bold text-gray-900 dark:text-gray-100">
        {{ $t('bills.details.uploadButton') }}
      </p>
      <!-- gray-400 measured ~3.26:1 on white / gray-500 ~3.53:1 on the dark
           surface (both fail AA; the dark step went the wrong direction).
           gray-500 clears ~5.07:1 in light, gray-400 clears ~5.48:1 in dark. -->
      <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
        {{ $t('bills.details.supportedFormats') }}
      </p>
    </button>
  </UiCard>
</template>
