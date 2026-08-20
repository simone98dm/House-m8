<script lang="ts" setup>
/**
 * ReportCard - Report entry with image, status badge and View Details CTA.
 * Desktop (@md+): horizontal layout with w-48 side image.
 * Mobile: stacked card with full-width aspect-[16/9] cover image.
 */

import type { Report, ReportPriority } from '~/types';
import { getReportStatus } from '~/types';

interface Props {
  report: Report;
  isOwner?: boolean;
}

const { report, isOwner = false } = defineProps<Props>();

interface Events {
  view: [report: Report];
  'mark-solved': [reportId: string];
}

const emit = defineEmits<Events>();

const { t } = useI18n();
const { formatShort } = useDate();

const status = computed(() => getReportStatus(report));

const leadImage = computed(() => report.images?.[0] ?? null);

const statusClass = computed(() => {
  if (status.value === 'solved')
    return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
  if (status.value === 'read')
    return 'bg-info-100 text-info-700 dark:bg-primary-900/20 dark:text-primary-400';
  return 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400';
});

const statusDotClass = computed(() => {
  if (status.value === 'solved') return 'bg-gray-500';
  if (status.value === 'read') return 'bg-info-500';
  return 'bg-warning-500 animate-pulse';
});

const statusLabel = computed(() => {
  if (status.value === 'solved') return t('reports.filters.resolved');
  if (status.value === 'read') return t('reports.filters.inProgress');
  return t('reports.filters.pending');
});

const reporterName = computed(() => {
  if (report.user) return `${report.user.first_name} ${report.user.last_name}`;
  return t('reports.unknownUser');
});

const formatDate = (date: string | null | undefined) => formatShort(date);

const priorityBg = (priority: ReportPriority | null | undefined) => {
  if (priority === 'high') return 'bg-error-500';
  if (priority === 'low') return 'bg-success-500';
  return 'bg-gray-500';
};

const priorityClass = (priority: ReportPriority | null | undefined) => {
  if (priority === 'high')
    return 'bg-error-100 text-error-600 dark:bg-error-900/30 dark:text-error-400';
  if (priority === 'low')
    return 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400';
  return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
};

const priorityLabel = (priority: ReportPriority | null | undefined) => {
  if (priority === 'high') return t('reports.priority.high');
  if (priority === 'low') return t('reports.priority.low');
  return t('reports.priority.medium');
};

const handleMarkSolved = () => emit('mark-solved', report.id);
</script>

<template>
  <UiCard
    as="article"
    variant="plain"
    radius="xl"
    padding="none"
    class="border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-md @container"
  >
    <div class="flex flex-col @md:flex-row">
      <div
        class="relative w-full @md:w-48 aspect-[16/9] @md:aspect-auto @md:h-auto shrink-0 bg-gray-200 dark:bg-gray-700 overflow-hidden"
      >
        <img
          v-if="leadImage"
          :src="leadImage.url"
          :alt="t('reports.card.reportAlt')"
          class="w-full h-full object-cover"
        />
        <div v-else class="w-full h-full flex items-center justify-center">
          <Icon
            name="heroicons:document-text"
            class="w-10 h-10 text-gray-500 dark:text-gray-400"
            aria-hidden="true"
          />
        </div>
        <div v-if="report.priority" class="absolute top-3 left-3 @md:hidden">
          <span
            class="text-white fs-2xs font-bold px-2 py-1 rounded uppercase tracking-wider"
            :class="priorityBg(report.priority)"
          >
            {{ priorityLabel(report.priority) }}
          </span>
        </div>
      </div>

      <div class="p-5 flex-1 flex flex-col justify-between gap-4">
        <div>
          <div class="flex items-start justify-between gap-4 mb-2">
            <div class="flex items-center gap-2">
              <span
                class="text-gray-500 dark:text-gray-400 text-xs font-medium"
              >
                #{{ report.id.slice(0, 8) }}
              </span>
              <span
                v-if="report.priority"
                class="hidden @md:inline-flex px-2 py-0.5 rounded fs-2xs font-bold uppercase tracking-wider"
                :class="priorityClass(report.priority)"
              >
                {{ priorityLabel(report.priority) }}
              </span>
            </div>
            <span
              class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold"
              :class="statusClass"
            >
              <span
                class="size-1.5 rounded-full"
                :class="statusDotClass"
                aria-hidden="true"
              />
              {{ statusLabel }}
            </span>
          </div>

          <p class="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
            {{ report.description }}
          </p>
        </div>

        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-2 min-w-0">
            <UiUserAvatar :user="report.user" size="sm" class="shrink-0" />
            <span
              class="text-xs font-medium text-gray-600 dark:text-gray-400 truncate"
            >
              {{ reporterName }}
            </span>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <p
              class="text-xs text-gray-500 dark:text-gray-400 hidden @md:block"
            >
              {{ formatDate(report.created_at) }}
            </p>
            <UiButton
              variant="ghost"
              size="sm"
              :aria-label="$t('a11y.buttons.expandReport')"
              @click="emit('view', report)"
            >
              {{ t('common.viewDetails') }}
            </UiButton>
          </div>
        </div>

        <div
          v-if="isOwner && !report.solved_at"
          class="flex justify-end pt-2 border-t border-gray-200 dark:border-gray-700"
        >
          <UiButton
            variant="primary"
            size="sm"
            :aria-label="$t('a11y.buttons.markSolved')"
            @click="handleMarkSolved"
          >
            <Icon
              name="heroicons:check"
              class="w-4 h-4 mr-1"
              aria-hidden="true"
            />
            {{ t('reports.markAsSolved') }}
          </UiButton>
        </div>
      </div>
    </div>
  </UiCard>
</template>
