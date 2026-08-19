<script lang="ts" setup>
/**
 * HouseInvitationModal — Displays and copies the house invitation URL.
 * Design token: invitation link area uses bg-gray-50 rounded-xl with copy button.
 */

interface HouseInvitationModalProps {
  show: boolean;
  invitationUrl: string;
}

interface HouseInvitationModalEvents {
  close: [];
  'copy-url': [];
}

const { show, invitationUrl } = defineProps<HouseInvitationModalProps>();
const emit = defineEmits<HouseInvitationModalEvents>();

const { t: $t } = useI18n();
</script>

<template>
  <UiModal
    :show="show"
    :title="$t('houseProfile.invitationUrl')"
    @close="emit('close')"
  >
    <div class="space-y-5">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        {{ $t('houseProfile.invitationDescription') }}
      </p>

      <!-- Invitation link row — design-system: bg-gray-50 rounded-lg flex items-center justify-between -->
      <div
        class="bg-gray-50 rounded-xl border border-gray-200 p-3 flex items-center gap-3 dark:bg-gray-900 dark:border-gray-700"
      >
        <div class="flex-1 min-w-0">
          <p
            class="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1"
          >
            {{ $t('houseProfile.invitationUrl') }}
          </p>
          <p
            class="text-sm font-medium text-gray-700 dark:text-gray-200 truncate"
          >
            {{ invitationUrl || $t('houseProfile.generatingUrl') }}
          </p>
        </div>
        <UiButton
          variant="secondary"
          size="sm"
          icon="clipboard-document"
          :aria-label="$t('a11y.buttons.copyInvitation')"
          @click="emit('copy-url')"
        >
          {{ $t('common.copy') }}
        </UiButton>
      </div>

      <UiButton
        variant="secondary"
        class="w-full"
        :aria-label="$t('a11y.close')"
        @click="emit('close')"
      >
        {{ $t('common.close') }}
      </UiButton>
    </div>
  </UiModal>
</template>
