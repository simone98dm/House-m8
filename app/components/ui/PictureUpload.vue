<script setup lang="ts">
const { t } = useI18n();

interface PictureUploadProps {
  label?: string;
  accept?: string;
  maxSize?: number; // in MB
  error?: string;
  disabled?: boolean;
}

const {
  label = '',
  accept = 'image/*',
  maxSize = 5,
  error = '',
  disabled = false,
} = defineProps<PictureUploadProps>();

const modelValue = defineModel<File | null>({ required: true });

const isDragOver = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
// Client-side validation feedback. `error` (prop) carries server/parent-side
// errors; `localError` covers invalid drops/selects caught here, which
// previously were dropped with the file and no message at all (WCAG 3.3.1
// Error Identification — an invalid file must not vanish silently).
const localError = ref('');
const displayError = computed(() => localError.value || error);

// Computed label with i18n fallback
const displayLabel = computed(() => label || t('common.clickToUpload'));

const previewUrl = computed(() => {
  if (modelValue.value) {
    return URL.createObjectURL(modelValue.value);
  }
  return null;
});

const fileName = computed(() => {
  return modelValue.value?.name || '';
});

const fileSize = computed(() => {
  if (modelValue.value) {
    const sizeInMB = modelValue.value.size / (1024 * 1024);
    return `${sizeInMB.toFixed(2)} MB`;
  }
  return '';
});

const isValidFile = (file: File): boolean => {
  // Check file type
  if (accept !== '*' && !file.type.match(accept)) {
    localError.value = t('common.unsupportedFileType', { fileType: file.type });
    return false;
  }

  // Check file size
  const sizeInMB = file.size / (1024 * 1024);
  if (sizeInMB > maxSize) {
    localError.value = t('common.fileTooLarge', {
      fileName: file.name,
      maxSize,
    });
    return false;
  }

  return true;
};

const handleFileSelect = (file: File | null) => {
  localError.value = '';
  if (file && isValidFile(file)) {
    modelValue.value = file;
  } else if (file) {
    // Invalid file - rejected, localError now holds the reason (see isValidFile)
    modelValue.value = null;
  } else {
    modelValue.value = null;
  }
};

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  isDragOver.value = false;

  const files = event.dataTransfer?.files;
  if (files && files.length > 0) {
    handleFileSelect(files[0] ?? null);
  }
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  if (!disabled) {
    isDragOver.value = true;
  }
};

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault();
  isDragOver.value = false;
};

const handleClick = () => {
  if (!disabled && fileInput.value) {
    fileInput.value.click();
  }
};

const handleFileInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  if (files && files.length > 0) {
    handleFileSelect(files[0] ?? null);
  }
};

const removeFile = () => {
  modelValue.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};
</script>

<template>
  <div>
    <div v-if="previewUrl" class="mb-4">
      <div class="relative inline-block">
        <img
          :src="previewUrl"
          alt="Preview"
          class="max-w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
        />
        <!-- Raw: bespoke w-6 h-6 badge pinned to the preview image's corner —
             same as the removeFile badge kept raw in report/Form.vue. -->
        <button
          type="button"
          :aria-label="$t('common.remove')"
          class="absolute -top-2 -right-2 bg-error-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-error-600 transition-colors duration-150"
          :disabled="disabled"
          @click="removeFile"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="mt-2 text-sm text-gray-600 dark:text-gray-400">
        <p class="font-medium">{{ fileName }}</p>
        <p class="text-xs">{{ fileSize }}</p>
      </div>
    </div>

    <div
      class="relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2"
      :class="[
        isDragOver
          ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20'
          : 'border-gray-300 dark:border-gray-600',
        disabled
          ? 'cursor-not-allowed opacity-50'
          : 'hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700',
      ]"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @click="handleClick"
    >
      <div class="flex flex-col items-center justify-center space-y-2">
        <div class="w-12 h-12 text-gray-400" aria-hidden="true">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            ></path>
          </svg>
        </div>
        <div class="text-gray-600 dark:text-gray-400">
          <p class="text-sm font-medium">{{ displayLabel }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {{
              accept === 'image/*'
                ? t('common.pngJpgGifUpTo')
                : t('common.filesUpTo')
            }}
            {{ maxSize }}MB
          </p>
        </div>
      </div>

      <!-- Hidden file input. Raw by design: type="file" has no text value to
           bind, no UiInput equivalent, and this one sits as a transparent
           full-area overlay so the whole drop zone stays clickable. -->
      <input
        ref="fileInput"
        type="file"
        :accept="accept"
        :disabled="disabled"
        :aria-label="displayLabel"
        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        @change="handleFileInput"
      />
    </div>

    <!-- Error message. error-500 alone was ~3.6:1 on dark surfaces (fails
         AA); error-600/error-400 pairing passes in both themes. role="alert"
         so client-side validation failures (localError) are announced —
         previously the file was rejected with no feedback at all. -->
    <p
      v-if="displayError"
      class="text-xs text-error-600 dark:text-error-400 mt-2"
      role="alert"
    >
      {{ displayError }}
    </p>
  </div>
</template>
