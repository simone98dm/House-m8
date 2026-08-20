<script lang="ts" setup>
const { t } = useI18n();

interface UploadDocumentDropzoneProps {
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
} = defineProps<UploadDocumentDropzoneProps>();

interface Emits {
  filesSelected: [files: File[]];
}

const emit = defineEmits<Emits>();

const fileInput = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);

const acceptedTypes = computed(() => {
  return accept.split(',').map((type) => type.trim());
});

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target?.files || disabled) return;

  emit('filesSelected', Array.from(target.files));

  // Reset input
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const openFilePicker = () => {
  if (disabled) return;
  fileInput.value?.click();
};

// The zone is a plain <div> (needs drag/drop handlers a native <label> or
// <button> can't own cleanly), so it's mouse/touch-only without an explicit
// keyboard path: the file input it opens is `hidden` (display:none), which
// drops it from the tab order entirely, unlike PictureUpload's transparent-
// overlay input trick. role="button" + tabindex + this handler restore
// WCAG 2.1.1 Keyboard operability.
const handleZoneKeydown = (event: KeyboardEvent) => {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  openFilePicker();
};

// Drag and drop handlers
const handleDragEnter = (event: DragEvent) => {
  event.preventDefault();
  if (disabled) return;
  isDragging.value = true;
};

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault();
  // Only set to false if leaving the entire drop zone
  const target = event.target as HTMLElement;
  if (target.classList.contains('upload-zone')) {
    isDragging.value = false;
  }
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
};

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  if (disabled) return;

  isDragging.value = false;

  const files = event.dataTransfer?.files;
  if (files) {
    emit('filesSelected', Array.from(files));
  }
};
</script>

<template>
  <div
    class="upload-zone relative rounded-xl bg-white dark:bg-gray-800 overflow-hidden transition-all duration-300"
    :class="{
      'opacity-50 cursor-not-allowed': disabled,
      'cursor-pointer hover:border-primary-400': !disabled,
    }"
    role="button"
    :tabindex="disabled ? -1 : 0"
    :aria-disabled="disabled"
    :aria-label="t('common.uploadDocuments')"
    @dragenter="handleDragEnter"
    @dragleave="handleDragLeave"
    @dragover="handleDragOver"
    @drop="handleDrop"
    @click="openFilePicker"
    @keydown="handleZoneKeydown"
  >
    <div
      class="absolute inset-0 pointer-events-none"
      :class="{
        'animate-pulse': isDragging,
      }"
    >
      <div
        class="absolute inset-0 rounded-xl"
        :class="{
          'bg-striped-border-dragging': isDragging,
          'bg-striped-border': !isDragging,
        }"
      />
      <div class="absolute inset-[3px] bg-white dark:bg-gray-800 rounded-lg" />
    </div>

    <div class="relative p-8 text-center">
      <div
        class="mx-auto w-16 h-16 mb-4 rounded-full flex items-center justify-center transition-colors"
        :class="{
          'bg-primary-100': isDragging,
          'bg-gray-100 dark:bg-gray-700': !isDragging && !disabled,
          'bg-gray-50 dark:bg-gray-700': disabled,
        }"
      >
        <Icon
          name="heroicons:cloud-arrow-up"
          class="w-8 h-8 transition-colors"
          :class="{
            'text-primary-600': isDragging,
            'text-gray-600 dark:text-gray-300': !isDragging && !disabled,
            'text-gray-500 dark:text-gray-400': disabled,
          }"
          aria-hidden="true"
        />
      </div>

      <h3
        class="text-lg font-semibold mb-2 transition-colors"
        :class="{
          'text-primary-900': isDragging,
          'text-gray-900 dark:text-gray-100': !isDragging && !disabled,
          'text-gray-500 dark:text-gray-400': disabled,
        }"
      >
        {{
          isDragging ? t('common.dropFilesHere') : t('common.uploadDocuments')
        }}
      </h3>

      <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {{
          multiple
            ? t('common.dragDropFilesOrClick')
            : t('common.dragDropFileOrClick')
        }}
      </p>

      <p class="text-xs text-gray-500 dark:text-gray-400">
        {{ t('common.supportedFormats') }}
        {{ acceptedTypes.join(', ').toUpperCase().replace(/\./g, '') }}
        <span class="mx-1">•</span>
        {{ t('common.maxSize') }} {{ maxSize }}MB
      </p>

      <!-- Hidden file input. Raw by design: type="file" has no UiInput
           equivalent; this one stays display:none behind the custom
           drag/drop zone above (see handleZoneKeydown for its own
           keyboard-operability fix). -->
      <input
        ref="fileInput"
        type="file"
        :accept="accept"
        :multiple="multiple"
        :disabled="disabled"
        class="hidden"
        @change="handleFileSelect"
      />
    </div>
  </div>
</template>

<style scoped>
/* Striped border */
.bg-striped-border {
  background: repeating-linear-gradient(
    45deg,
    #e5e7eb 0px,
    #e5e7eb 10px,
    transparent 10px,
    transparent 20px
  );
}

.bg-striped-border-dragging {
  background: repeating-linear-gradient(
    45deg,
    #2563eb 0px,
    #2563eb 10px,
    transparent 10px,
    transparent 20px
  );
}
</style>
