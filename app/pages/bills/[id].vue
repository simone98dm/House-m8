<script lang="ts" setup>
const { t: $t } = useI18n();
const { formatDate } = useBillDetails();

useSeoMeta({
  title: $t('seo.titles.billDetails'),
});

const {
  bill,
  loading,
  error,
  showUploadModal,
  showEditModal,
  uploading,
  showDeleteConfirm,
  showDeleteBillConfirm,
  deletingBill,
  showAdvanceConfirm,
  advancingBill,
  nextAdvancedDueDate,
  isCreator,
  canDeleteDocument,
  handleDocumentUpload,
  viewDocument,
  downloadDocument,
  confirmDeleteDocument,
  deleteDocument,
  deleteBill,
  handleAdvanceBill,
  handleBillUpdated,
  goToBills,
} = useBillDetailsPage();
</script>

<template>
  <AppPageHeader :allow-back="true">
    <h1 class="text-xl font-bold text-gray-900 dark:text-gray-100">
      {{ bill?.description || $t('navigation.bills') }}
    </h1>
  </AppPageHeader>

  <div v-if="loading" class="space-y-4">
    <UiSkeleton class="h-10 w-48 rounded-xl" />
    <UiSkeleton class="h-48 w-full rounded-xl" />
    <UiSkeleton class="h-32 w-full rounded-xl" />
  </div>

  <div v-else-if="!bill" class="text-center py-16 animate-fade-in">
    <div
      class="size-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4"
    >
      <Icon
        name="heroicons:document"
        class="w-6 h-6 text-gray-400"
        aria-hidden="true"
      />
    </div>
    <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
      {{ $t('bills.details.notFound') }}
    </h2>
    <p class="text-gray-500 dark:text-gray-400 mb-6">
      {{ $t('bills.notFoundDesc') }}
    </p>
    <UiButton
      icon="arrow-left"
      :aria-label="$t('a11y.buttons.back')"
      @click="goToBills"
    >
      {{ $t('bills.details.backToBills') }}
    </UiButton>
  </div>

  <template v-else>
    <div class="mt-4 mb-6 flex items-center justify-between">
      <nav
        class="hidden sm:flex items-center gap-1.5 text-sm text-gray-500"
        :aria-label="$t('bills.details.title')"
      >
        <!-- Resting colour was relying on inheriting text-gray-500 from the
             parent <nav>, but a global `a { color: var(--primary) }` rule in
             _base.scss's @layer base wins over inheritance, so it rendered
             primary-500 blue at ~3.36:1 (fails AA) instead of gray. Fixed by
             declaring the colour directly on the link: a Tailwind utility
             class lives in @layer utilities, which Tailwind always orders
             after @layer base, so it wins the cascade without !important.
             gray-500 clears ~4.63:1 in light, gray-400 clears ~5.88:1 in
             dark; primary-700/primary-400 hover clear AA too. -->
        <NuxtLink
          to="/bills"
          class="text-gray-500 dark:text-gray-400 hover:text-primary-700 dark:hover:text-primary-400 transition-colors"
        >
          {{ $t('navigation.bills') }}
        </NuxtLink>
        <Icon
          name="heroicons:chevron-right"
          class="w-3.5 h-3.5"
          aria-hidden="true"
        />
        <span
          class="text-gray-900 dark:text-gray-100 font-medium truncate max-w-[200px]"
        >
          {{ bill.description }}
        </span>
      </nav>

      <div v-if="isCreator" class="flex items-center gap-2 ml-auto">
        <UiButton
          variant="secondary"
          size="sm"
          icon="forward"
          :aria-label="
            $t('bills.details.advanceDueDateLabel', {
              description: bill.description,
            })
          "
          @click="showAdvanceConfirm = true"
        >
          {{ $t('bills.details.advanceDueDate') }}
        </UiButton>
        <UiButton
          variant="secondary"
          size="sm"
          icon="pencil"
          :aria-label="$t('a11y.buttons.editBill')"
          @click="showEditModal = true"
        >
          {{ $t('common.edit') }}
        </UiButton>
        <UiButton
          variant="danger"
          size="sm"
          icon="trash"
          :loading="deletingBill"
          :aria-label="$t('a11y.buttons.deleteBill')"
          @click="showDeleteBillConfirm = true"
        >
          {{ $t('common.delete') }}
        </UiButton>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
      <div class="lg:col-span-2 space-y-6">
        <BillBasicInfo :bill="bill" />
        <BillContractInfo :bill="bill" />
      </div>

      <div class="space-y-6">
        <BillDetailsDocuments
          :documents="bill.documents || []"
          :can-delete="canDeleteDocument"
          @view="viewDocument"
          @download="downloadDocument"
          @delete="confirmDeleteDocument"
          @upload="showUploadModal = true"
        />
      </div>
    </div>
  </template>

  <BillErrorToast :message="error" @close="error = null" />

  <UiModal
    :show="showUploadModal"
    :title="$t('bills.details.uploadDocument')"
    @close="showUploadModal = false"
  >
    <UiUploadDocument
      multiple
      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
      :max-size="10"
      :disabled="uploading"
      @upload="handleDocumentUpload"
    />
  </UiModal>

  <BillDeleteDocumentConfirmModal
    :show="showDeleteConfirm"
    @confirm="deleteDocument"
    @cancel="showDeleteConfirm = false"
  />

  <BillDeleteBillConfirmModal
    :show="showDeleteBillConfirm"
    :deleting="deletingBill"
    :description="bill?.description"
    @confirm="deleteBill"
    @cancel="showDeleteBillConfirm = false"
  />

  <UiConfirmModal
    :show="showAdvanceConfirm"
    :title="$t('bills.details.advanceConfirmTitle')"
    :message="
      bill && nextAdvancedDueDate
        ? $t('bills.details.advanceConfirmMessage', {
            from: formatDate(bill.next_due_date),
            to: formatDate(nextAdvancedDueDate),
          })
        : undefined
    "
    :confirm-text="$t('bills.details.advanceConfirmButton')"
    :cancel-text="$t('common.cancel')"
    :loading="advancingBill"
    @confirm="handleAdvanceBill"
    @cancel="showAdvanceConfirm = false"
    @close="showAdvanceConfirm = false"
  />

  <!-- Edit Bill Modal. No `v-if` alongside `:show` — see the note in
       pages/expenses/index.vue: an outer v-if skips both animations. -->
  <LazyBillEditModal
    :show="showEditModal"
    :bill="bill"
    @close="showEditModal = false"
    @submit="handleBillUpdated"
  />
</template>
