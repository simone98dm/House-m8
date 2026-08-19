<script lang="ts" setup>
/**
 * ReportForm - Form for creating a new report.
 * Features: textarea with live character counter, image upload area with thumbnail preview.
 */

interface ReportFormProps {
  houseName?: string;
  isLoading?: boolean;
}

const { houseName = '', isLoading = false } = defineProps<ReportFormProps>();

interface ReportFormEvents {
  submit: [data: { description: string; images: File[] }];
  cancel: [];
}

const emit = defineEmits<ReportFormEvents>();

const { t } = useI18n();

const description = ref('');
const uploadedFiles = ref<File[]>([]);
// Stable per-file key (index breaks when removeFile splices mid-queue) and a
// cache of object URLs created once per file and revoked on removal/unmount —
// see expense/MonthlyReportCard.vue / gdpr/DataExport.vue for the same
// create-then-revoke pattern.
const fileKey = (file: File) =>
  `${file.name}-${file.size}-${file.lastModified}`;
const objectUrls = ref<Record<string, string>>({});

const MAX_CHARS = 1000;
const MIN_CHARS = 10;
const MAX_IMAGES = 10;

const descriptionError = computed(() => {
  if (description.value.length > 0 && description.value.length < MIN_CHARS) {
    return t('reports.validation.descriptionTooShort');
  }
  return '';
});

const charCountClasses = computed(() => {
  const len = description.value.length;
  if (len >= MAX_CHARS) return 'text-error-600';
  if (len >= MAX_CHARS * 0.9) return 'text-warning-600';
  return 'text-gray-400';
});

const isValid = computed(() => description.value.trim().length >= MIN_CHARS);

const handleFilesUploaded = (files: File[]) => {
  const merged = [...uploadedFiles.value, ...files].slice(0, MAX_IMAGES);
  for (const file of merged) {
    const key = fileKey(file);
    if (!objectUrls.value[key]) {
      objectUrls.value[key] = URL.createObjectURL(file);
    }
  }
  uploadedFiles.value = merged;
};

const removeFile = (file: File) => {
  const key = fileKey(file);
  const url = objectUrls.value[key];
  if (url) {
    URL.revokeObjectURL(url);
    // Rebuild without the key rather than `delete` — the repo lints against
    // dynamic delete, and CLAUDE.md prefers immutable updates over mutation.
    objectUrls.value = Object.fromEntries(
      Object.entries(objectUrls.value).filter(([k]) => k !== key),
    );
  }
  uploadedFiles.value = uploadedFiles.value.filter((f) => f !== file);
};

const clearObjectUrls = () => {
  Object.values(objectUrls.value).forEach((url) => URL.revokeObjectURL(url));
  objectUrls.value = {};
};

const handleSubmit = () => {
  if (!isValid.value) return;
  emit('submit', {
    description: description.value.trim(),
    images: uploadedFiles.value,
  });
};

const resetForm = () => {
  description.value = '';
  clearObjectUrls();
  uploadedFiles.value = [];
};

onUnmounted(clearObjectUrls);

defineExpose({ resetForm });
</script>

<template>
  <form class="space-y-5" @submit.prevent="handleSubmit">
    <!-- House context banner: shared state-card pattern (main.css) — was
         bg-primary-50/border-primary-100 with zero dark: coverage. -->
    <div v-if="houseName" class="state-card state-card--primary items-center">
      <div class="state-card-icon-chip state-card-icon-chip--primary size-7">
        <Icon name="heroicons:home" class="w-4 h-4" aria-hidden="true" />
      </div>
      <span class="text-sm font-semibold">
        {{ houseName }}
      </span>
    </div>

    <div class="space-y-1">
      <label
        for="report-description"
        class="block text-sm font-semibold text-gray-700 dark:text-gray-300"
      >
        {{ t('reports.form.description') }}
        <span class="text-error-500 ml-0.5" aria-hidden="true">*</span>
      </label>

      <div class="relative">
        <textarea
          id="report-description"
          v-model="description"
          rows="5"
          :maxlength="MAX_CHARS"
          :placeholder="t('reports.form.descriptionPlaceholder')"
          :disabled="isLoading"
          class="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all resize-none disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder:text-gray-500"
          :class="{
            'border-error-400 focus:ring-error-500/20': descriptionError,
          }"
          :aria-describedby="
            descriptionError ? 'description-error' : 'description-hint'
          "
          :aria-invalid="!!descriptionError"
        />
      </div>

      <div class="flex justify-between items-center min-h-[1.25rem]">
        <p
          v-if="descriptionError"
          id="description-error"
          class="text-xs text-error-600"
          role="alert"
        >
          {{ descriptionError }}
        </p>
        <span v-else id="description-hint" class="sr-only">
          {{ t('reports.form.descriptionPlaceholder') }}
        </span>

        <span :class="['text-xs ml-auto tabular-nums', charCountClasses]">
          {{ description.length }}/{{ MAX_CHARS }}
        </span>
      </div>
    </div>

    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <p class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          {{ t('reports.form.attachImages') }}
          <span class="ml-1 text-xs font-normal text-gray-400"
            >({{ t('reports.form.optional') }})</span
          >
        </p>
        <span
          v-if="uploadedFiles.length > 0"
          class="text-xs text-gray-400 tabular-nums"
        >
          {{ uploadedFiles.length }}/{{ MAX_IMAGES }}
        </span>
      </div>

      <UiUploadDocument
        :multiple="true"
        accept=".jpg,.jpeg,.png,.gif,.webp"
        :max-size="10"
        :disabled="isLoading || uploadedFiles.length >= MAX_IMAGES"
        @upload="handleFilesUploaded"
      />

      <div
        v-if="uploadedFiles.length > 0"
        class="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2"
      >
        <div
          v-for="file in uploadedFiles"
          :key="fileKey(file)"
          class="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 group"
        >
          <img
            :src="objectUrls[fileKey(file)]"
            :alt="file.name"
            class="w-full h-full object-cover"
          />
          <!-- Raw: a size-5 (20px) badge pinned to the thumbnail's corner —
               far below UiButton's smallest size. -->
          <button
            type="button"
            class="absolute top-1 right-1 size-5 rounded-full bg-error-500 hover:bg-error-600 text-white flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
            :disabled="isLoading"
            :aria-label="$t('a11y.buttons.removeImage')"
            @click.stop="removeFile(file)"
          >
            <Icon name="heroicons:x-mark" class="w-3 h-3" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>

    <div
      class="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700"
    >
      <UiButton
        type="button"
        variant="secondary"
        :disabled="isLoading"
        :aria-label="$t('a11y.buttons.cancel')"
        @click="emit('cancel')"
      >
        {{ t('common.cancel') }}
      </UiButton>
      <UiButton
        type="submit"
        variant="primary"
        :disabled="!isValid || isLoading"
        :loading="isLoading"
        :aria-label="$t('a11y.buttons.submitReport')"
      >
        {{ t('reports.form.submit') }}
      </UiButton>
    </div>
  </form>
</template>
