<script lang="ts" setup>
const { t: $t } = useI18n();

useSeoMeta({
  title: $t('seo.titles.houseDetails'),
});

const billsStore = useBillsStore();
const userStore = useUserStore();

const {
  house,
  loading,
  error,
  showEditModal,
  showInvitationModal,
  invitationUrl,
  invitationLoading,
  inviteLoading,
  roleLoading,
  memberActionError,
  isOwner,
  isCurrentUserOwner,
  canViewHouse,
  activeMembers,
  ownerMember,
  enableInvitation,
  loadHouseDetails,
  handleEditHouse,
  handleGenerateInvitation,
  copyInvitationUrl,
  navigateToBills,
  navigateToUser,
  handleRoleUpdate,
  handleRemoveMember,
  handleInviteMember,
} = useHouseDetailsPage();
</script>

<template>
  <AppPageHeader>
    <!-- Chrome, not the document heading. Teleported into the sticky top bar; the page's single <h1> lives below. Was an <h1>: two per page is a WCAG 1.3.1 defect. -->
    <p class="text-xl font-bold text-gray-900 dark:text-gray-100">
      {{ $t('navigation.house') }}
    </p>
  </AppPageHeader>

  <div v-if="loading" class="space-y-3">
    <UiSkeleton v-for="n in 5" :key="n" class="h-8 w-1/3" />
  </div>

  <UiCard v-else-if="error" class="text-center">
    <div
      class="inline-flex items-center justify-center size-12 rounded-full bg-[var(--danger-subtle)] mb-3"
    >
      <Icon
        name="heroicons:exclamation-triangle"
        class="w-6 h-6 text-[var(--danger-fg)]"
        aria-hidden="true"
      />
    </div>
    <p class="text-gray-600 dark:text-gray-400 mb-4">{{ error }}</p>
    <UiButton
      icon="arrow-path"
      :aria-label="$t('a11y.buttons.reload')"
      @click="loadHouseDetails"
    >
      {{ $t('common.retry') }}
    </UiButton>
  </UiCard>

  <UiCard v-else-if="house && !canViewHouse" class="text-center">
    <div
      class="inline-flex items-center justify-center size-12 rounded-full bg-[var(--danger-subtle)] mb-3"
    >
      <Icon
        name="heroicons:lock-closed"
        class="w-6 h-6 text-[var(--danger-fg)]"
        aria-hidden="true"
      />
    </div>
    <p class="text-gray-600 dark:text-gray-400 mb-4">
      {{ $t('houseProfile.accessDenied') }}
    </p>
    <UiButton
      :aria-label="$t('a11y.buttons.goToDashboard')"
      @click="navigateTo('/dashboard')"
    >
      {{ $t('common.goHome') }}
    </UiButton>
  </UiCard>

  <UiContainer v-else-if="house && canViewHouse" class="space-y-6">
    <div class="flex items-center justify-between">
      <h1
        class="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight"
      >
        {{ house.name || $t('houseProfile.title') }}
      </h1>
    </div>

    <div class="lg:grid lg:grid-cols-3 flex flex-col gap-2">
      <HouseInformationCard
        :house="house"
        :is-owner="!!isOwner"
        class="col-span-2"
        @edit-click="showEditModal = true"
      />

      <HouseOwnerCard
        v-if="ownerMember"
        :owner-member="ownerMember"
        @user-click="navigateToUser"
      />
    </div>

    <HouseMembersCard
      :members="activeMembers"
      :enable-invitation="!!enableInvitation"
      :invitation-loading="invitationLoading"
      :invite-loading="inviteLoading"
      :role-loading="roleLoading"
      :action-error="memberActionError"
      :is-current-user-owner="isCurrentUserOwner"
      :current-user-id="userStore.currentUser?.id"
      @user-click="navigateToUser"
      @generate-invitation="handleGenerateInvitation"
      @invite-member="handleInviteMember"
      @remove-member="handleRemoveMember"
      @update-role="handleRoleUpdate"
    />

    <!-- House complete badge. Was <HouseHouseCompleteBadge>, which does not
         exist: Nuxt drops the duplicated folder prefix when a filename already
         starts with it, so components/house/HouseCompleteBadge.vue registers as
         HouseCompleteBadge. The badge silently never rendered. -->
    <HouseCompleteBadge
      :invited-count="house?.members?.length ?? 0"
      :active-count="activeMembers.length"
    />

    <HouseBillsPreview :bills="billsStore.bills" @view-all="navigateToBills" />
  </UiContainer>

  <HouseInvitationModal
    :show="showInvitationModal"
    :invitation-url="invitationUrl"
    @close="showInvitationModal = false"
    @copy-url="copyInvitationUrl"
  />

  <!-- Edit Modal - Lazy loaded. No `v-if` alongside `:show` — see the note in
       pages/expenses/index.vue: an outer v-if skips both animations. -->
  <LazyHouseEditModal
    :show="showEditModal"
    :house="house"
    @close="showEditModal = false"
    @submit="handleEditHouse"
  />
</template>
