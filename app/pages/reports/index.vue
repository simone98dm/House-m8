<script lang="ts" setup>
/**
 * Reports Page — Orchestration only.
 * - Regular users: view their own reports
 * - House owners: view all tenant reports + mark solved
 */

import type { Report, ReportStatus } from '~/types';

const { t } = useI18n();

useSeoMeta({ title: t('seo.titles.reports') });

const housesStore = useHousesStore();
const reportsStore = useReportsStore();
const notificationStore = useNotificationStore();

const currentHouse = computed(() => housesStore.currentHouse);
const isOwner = computed(() => housesStore.isOwner);
const reports = computed(() => reportsStore.reports);
const isLoading = computed(() => reportsStore.isLoading);

const showCreateModal = ref(false);
const isSubmitting = ref(false);
const currentFilter = ref<ReportStatus | undefined>(undefined);

const filterCounts = computed(() => {
  const all = reports.value;
  return {
    all: all.length,
    not_read: all.filter((r) => !r.read_at).length,
    read: all.filter((r) => r.read_at && !r.solved_at).length,
    solved: all.filter((r) => !!r.solved_at).length,
  };
});

const displayedReports = computed(() => {
  if (!currentFilter.value) return reports.value;
  return reports.value.filter((report) => {
    if (currentFilter.value === 'solved') return !!report.solved_at;
    if (currentFilter.value === 'read')
      return !!report.read_at && !report.solved_at;
    if (currentFilter.value === 'not_read') return !report.read_at;
    return true;
  });
});

onMounted(() => reportsStore.loadReports());

const handleViewReport = async (report: Report) => {
  if (!isOwner.value) return;
  try {
    await reportsStore.markReportAsRead(report.id);
  } catch {
    notificationStore.error('errors.generic', 'errors.generic');
  }
};

const handleMarkSolved = (reportId: string) =>
  reportsStore.markReportAsSolved(reportId);

const handleCreateReport = async (data: {
  house_id: string;
  description: string;
  images: File[];
}) => {
  isSubmitting.value = true;
  const success = await reportsStore.createReport(data);
  if (success) showCreateModal.value = false;
  isSubmitting.value = false;
};

const canCreateReport = computed(() => currentHouse.value && !isOwner.value);
</script>

<template>
  <AppPageHeader>
    <!-- Chrome, not the document heading. Teleported into the sticky top bar; the page's single <h1> lives below. Was an <h1>: two per page is a WCAG 1.3.1 defect. -->
    <p class="text-xl font-bold text-gray-900 dark:text-gray-100">
      {{ $t('navigation.reports') }}
    </p>
  </AppPageHeader>

  <div class="space-y-6">
    <UiPageTitle
      :title="t('reports.title')"
      :subtitle="
        isOwner ? t('reports.ownerDescription') : t('reports.subtitle')
      "
    >
      <!-- ClientOnly is load-bearing: `canCreateReport` reads store state that
           does not exist during SSR, so the server rendered a placeholder and
           the client rendered a <button> — a hydration mismatch. The v-if stays
           inside. Do not hoist it back onto the <template>. -->
      <template #action>
        <ClientOnly>
          <UiButton
            v-if="canCreateReport"
            variant="danger"
            icon="plus"
            :aria-label="$t('a11y.buttons.createReport')"
            @click="showCreateModal = true"
          >
            {{ t('reports.newReport') }}
          </UiButton>
        </ClientOnly>
      </template>
    </UiPageTitle>

    <ReportFilterBar
      v-model="currentFilter"
      :counts="filterCounts"
      class="mb-6"
    />

    <div
      v-if="isLoading"
      class="space-y-4"
      aria-busy="true"
      :aria-label="$t('common.loading')"
    >
      <UiSkeleton class="h-24 rounded-xl" />
      <UiSkeleton class="h-24 rounded-xl" />
      <UiSkeleton class="h-24 rounded-xl" />
    </div>

    <UiEmptyState
      v-else-if="reports.length === 0"
      icon="heroicons:document-text"
      :title="t('reports.empty.title')"
      :description="
        isOwner
          ? t('reports.empty.ownerDescription')
          : t('reports.empty.userDescription')
      "
    >
      <!-- ClientOnly load-bearing — same SSR store-state reason as above. -->
      <template #action>
        <ClientOnly>
          <UiButton
            v-if="canCreateReport"
            variant="danger"
            @click="showCreateModal = true"
          >
            {{ t('reports.createFirstReport') }}
          </UiButton>
        </ClientOnly>
      </template>
    </UiEmptyState>

    <UiEmptyState
      v-else-if="displayedReports.length === 0"
      icon="heroicons:funnel"
      :title="t('reports.noFilterResults')"
      :description="t('reports.tryDifferentFilter')"
    />

    <div v-else class="space-y-4">
      <ReportCard
        v-for="report in displayedReports"
        :key="report.id"
        :report="report"
        :is-owner="isOwner"
        @view="handleViewReport"
        @mark-solved="handleMarkSolved"
      />
    </div>
  </div>

  <LazyReportCreateModal
    :show="showCreateModal"
    :house="currentHouse"
    :is-loading="isSubmitting"
    @close="showCreateModal = false"
    @submit="handleCreateReport"
  />
</template>
