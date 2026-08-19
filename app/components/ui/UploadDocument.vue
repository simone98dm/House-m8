<script lang="ts" setup>
const { t } = useI18n();

interface UploadDocumentProps {
  multiple?: boolean;
  accept?: string;
  maxSize?: number; // in MB
  disabled?: boolean;
}

const {
  multiple = false,
  accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png',
  maxSize = 10,
  disabled = false,
} = defineProps<UploadDocumentProps>();

interface Emits {
  upload: [files: File[]];
}

const emit = defineEmits<Emits>();

const selectedFiles = ref<File[]>([]);
const error = ref<string | null>(null);

const acceptedTypes = computed(() => {
  return accept.split(',').map((type) => type.trim());
});

const validateFile = (file: File): boolean => {
  // Check file size
  const maxSizeBytes = maxSize * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    error.value = t('common.fileTooLarge', { fileName: file.name, maxSize });
    return false;
  }

  // Check file type
  const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!acceptedTypes.value.includes(fileExt)) {
    error.value = t('common.unsupportedFileType', { fileType: fileExt });
    return false;
  }

  return true;
};

const addFiles = (files: File[]) => {
  error.value = null;

  const validFiles: File[] = [];

  for (const file of files) {
    if (validateFile(file)) {
      validFiles.push(file);
    }
  }

  if (validFiles.length > 0) {
    if (multiple) {
      selectedFiles.value = [...selectedFiles.value, ...validFiles];
    } else {
      selectedFiles.value = validFiles.slice(0, 1);
    }
  }
};

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1);
  error.value = null;
};

const handleUpload = () => {
  if (selectedFiles.value.length === 0 || disabled) return;
  emit('upload', selectedFiles.value);
  selectedFiles.value = [];
  error.value = null;
};
</script>

<template>
  <div class="space-y-4">
    <UiUploadDocumentDropzone
      :multiple="multiple"
      :accept="accept"
      :max-size="maxSize"
      :disabled="disabled"
      @files-selected="addFiles"
    />

    <!-- Error message: shared semantic-state card (main.css) — was a hand-rolled
         bg-error-50/border-error-200 pair with no dark: coverage, plus a
         hover:text-error-800 class that silently did nothing (error-800 isn't
         a defined shade). -->
    <div v-if="error" class="state-card state-card--error" role="alert">
      <div class="state-card-icon-chip state-card-icon-chip--error">
        <Icon
          name="heroicons:exclamation-circle"
          class="w-4 h-4"
          aria-hidden="true"
        />
      </div>
      <p class="text-sm flex-1">{{ error }}</p>
      <!-- Raw: bespoke unpadded icon-only dismiss, matching the toast/alert
           close-button pattern kept raw elsewhere. -->
      <button
        type="button"
        :aria-label="$t('common.close')"
        class="hover:opacity-70 transition-opacity"
        @click="error = null"
      >
        <Icon name="heroicons:x-mark" class="w-4 h-4" aria-hidden="true" />
      </button>
    </div>

    <UiUploadDocumentFileList
      v-if="selectedFiles.length > 0"
      :files="selectedFiles"
      :disabled="disabled"
      @remove="removeFile"
      @upload="handleUpload"
    />
  </div>
</template>
