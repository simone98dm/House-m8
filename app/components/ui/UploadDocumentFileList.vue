<script lang="ts" setup>
const { t } = useI18n();

interface UploadDocumentFileListProps {
  files: File[];
  disabled?: boolean;
}

const { files, disabled = false } = defineProps<UploadDocumentFileListProps>();

interface Emits {
  remove: [index: number];
  upload: [];
}

defineEmits<Emits>();

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

const getFileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf':
      return 'heroicons:document-text';
    case 'doc':
    case 'docx':
      return 'heroicons:document';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return 'heroicons:photo';
    default:
      return 'heroicons:document';
  }
};
</script>

<template>
  <div class="space-y-2">
    <h4 class="text-sm font-medium text-gray-900 dark:text-gray-100">
      {{ t('common.selectedFiles') }} ({{ files.length }})
    </h4>

    <div class="space-y-2">
      <div
        v-for="(file, index) in files"
        :key="`${file.name}-${file.size}-${file.lastModified}`"
        class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
      >
        <div
          class="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0"
        >
          <Icon
            :name="getFileIcon(file.name)"
            class="w-5 h-5 text-primary-600"
            aria-hidden="true"
          />
        </div>

        <div class="flex-1 min-w-0">
          <h5
            class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate"
          >
            {{ file.name }}
          </h5>
          <p class="text-xs text-gray-600 dark:text-gray-400">
            {{ formatFileSize(file.size) }}
          </p>
        </div>

        <!-- Raw: bespoke tiny icon-only row action (p-2), same hover-reveal
             list-row pattern kept raw in bill/DocumentsList.vue. -->
        <button
          :aria-label="$t('common.remove')"
          class="p-2 text-gray-600 dark:text-gray-400 hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors duration-150"
          :disabled="disabled"
          @click.stop="$emit('remove', index)"
        >
          <Icon name="heroicons:x-mark" class="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>

    <div class="flex justify-end pt-2">
      <UiButton
        icon="arrow-up-tray"
        :disabled="disabled || files.length === 0"
        :aria-label="$t('a11y.buttons.uploadDocument')"
        @click="$emit('upload')"
      >
        {{
          files.length === 1 ? t('common.uploadFile') : t('common.uploadFiles')
        }}
      </UiButton>
    </div>
  </div>
</template>
