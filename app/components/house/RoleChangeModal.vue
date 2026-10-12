<script lang="ts" setup>
import type { HouseMember } from '~/types';

/**
 * Confirms a member role change, shown as a git-style diff: the role being left
 * behind struck through, the incoming role beside it.
 *
 * The arrow is load-bearing, not decoration. Red/green alone would carry the
 * meaning in colour only, which fails WCAG 1.4.1 and is invisible to the most
 * common form of colour blindness. Strikethrough plus direction encode "from"
 * and "to" independently of hue, the same way git uses -/+ rather than colour.
 */
interface Props {
  show: boolean;
  member: HouseMember | null;
  newRole: 'admin' | 'member' | null;
  loading?: boolean;
}

interface Events {
  confirm: [];
  cancel: [];
}

const { show, member, newRole, loading = false } = defineProps<Props>();
const emit = defineEmits<Events>();

const { t } = useI18n();

const memberName = computed(() => {
  const u = member?.user;
  return `${u?.first_name ?? ''} ${u?.last_name ?? ''}`.trim();
});

const roleLabel = (role: string | null | undefined) => {
  if (role === 'owner') return t('houseProfile.roleOwner');
  if (role === 'admin') return t('houseProfile.roleAdmin');
  return t('houseProfile.roleMember');
};

const currentRoleLabel = computed(() => roleLabel(member?.role));
const nextRoleLabel = computed(() => roleLabel(newRole));

// Named so screen readers get the whole change in one utterance instead of
// three disconnected fragments.
const changeSummary = computed(() =>
  t('houseProfile.roleChange.summary', {
    name: memberName.value,
    from: currentRoleLabel.value,
    to: nextRoleLabel.value,
  }),
);
</script>

<template>
  <UiModal
    :show="show"
    :title="t('houseProfile.roleChange.title')"
    max-width="max-w-md"
    @close="emit('cancel')"
  >
    <div class="space-y-5">
      <div class="flex items-center gap-3">
        <UiUserAvatar size="md" :user="member?.user" />
        <p class="text-base font-bold text-gray-900 dark:text-gray-100">
          {{ memberName }}
        </p>
      </div>

      <!-- The diff. aria-hidden on the visual row because `changeSummary`
           below states the same change as one sentence; announcing both would
           read the roles twice. -->
      <div
        class="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-surface-raised px-4 py-3 dark:border-gray-700"
        aria-hidden="true"
      >
        <span
          class="text-sm font-semibold text-error-600 line-through decoration-2 dark:text-error-400"
        >
          {{ currentRoleLabel }}
        </span>

        <Icon
          name="heroicons:arrow-right"
          class="h-4 w-4 shrink-0 text-gray-500 dark:text-gray-400"
        />

        <span
          class="text-sm font-semibold text-success-700 dark:text-success-400"
        >
          {{ nextRoleLabel }}
        </span>
      </div>

      <p class="sr-only">{{ changeSummary }}</p>

      <p class="text-sm text-gray-600 dark:text-gray-400">
        {{ t(`houseProfile.roleChange.effect.${newRole ?? 'member'}`) }}
      </p>

      <!-- Actions live in the body, not UiModal's #footer slot: that slot is
           decorated with bg-gray-50 + border-t, which no other confirm modal
           in the project carries. Matches ConfirmModal and
           bill/DeleteBillConfirmModal. -->
      <div class="flex justify-end gap-3">
        <UiButton
          variant="secondary"
          :disabled="loading"
          :aria-label="t('common.cancel')"
          @click="emit('cancel')"
        >
          {{ t('common.cancel') }}
        </UiButton>
        <UiButton
          variant="primary"
          :loading="loading"
          :aria-label="changeSummary"
          @click="emit('confirm')"
        >
          {{ t('common.confirm') }}
        </UiButton>
      </div>
    </div>
  </UiModal>
</template>
