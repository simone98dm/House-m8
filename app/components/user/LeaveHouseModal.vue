<script lang="ts" setup>
interface LeaveHouseModalProps {
  houseId: string;
  houseName: string;
  isOwner: boolean;
}

interface LeaveHouseModalEvents {
  close: [];
  left: [];
}

const props = defineProps<LeaveHouseModalProps>();
const emit = defineEmits<LeaveHouseModalEvents>();

const { t } = useI18n();
const houses = useHouses();

const netBalance = ref<number>(0);
const loadingBalance = ref(true);
const leaving = ref(false);
const error = ref('');
const balanceFetchError = ref(false);

onMounted(async () => {
  const result = await houses.getUserBalanceInHouse(props.houseId);
  if (result.data !== null && result.data !== undefined) {
    netBalance.value = result.data.net_balance;
  } else {
    balanceFetchError.value = true;
  }
  loadingBalance.value = false;
});

const hasBalance = computed(() => netBalance.value < -0.01);
const canLeave = computed(
  () => !props.isOwner && !hasBalance.value && !balanceFetchError.value,
);

const handleLeave = async () => {
  if (!canLeave.value) return;
  leaving.value = true;
  error.value = '';
  const result = await houses.leaveHouse(props.houseId);
  leaving.value = false;
  if (result.error) {
    error.value = result.error;
    return;
  }
  emit('left');
};
</script>

<template>
  <UiModal :show="true" :title="t('house.leave.title')" @close="emit('close')">
    <div v-if="loadingBalance" class="flex items-center justify-center py-6">
      <Icon
        name="heroicons:arrow-path"
        class="w-6 h-6 animate-spin text-gray-400"
        aria-hidden="true"
      />
    </div>

    <template v-else>
      <!-- Owner warning: shared state-card pattern (components/_state-card.scss) — was
           bg-warning-50/border-warning-200 with zero dark: coverage. -->
      <div
        v-if="isOwner"
        class="state-card state-card--warning mb-4"
        role="alert"
      >
        <div class="state-card-icon-chip state-card-icon-chip--warning">
          <Icon
            name="heroicons:exclamation-triangle"
            class="w-4 h-4"
            aria-hidden="true"
          />
        </div>
        <p class="text-sm">
          {{ t('house.leave.ownerWarning') }}
        </p>
      </div>

      <div
        v-else-if="hasBalance"
        class="state-card state-card--error mb-4"
        role="alert"
      >
        <div class="state-card-icon-chip state-card-icon-chip--error">
          <Icon
            name="heroicons:exclamation-circle"
            class="w-4 h-4"
            aria-hidden="true"
          />
        </div>
        <p class="text-sm">
          {{
            t('house.leave.pendingBalance', {
              amount: Math.abs(netBalance).toFixed(2),
            })
          }}
        </p>
      </div>

      <!-- Balance fetch error (text-error-800 wasn't a defined shade —
           silently produced no color at all, inheriting whatever the
           surrounding text color happened to be). -->
      <div
        v-else-if="balanceFetchError"
        class="state-card state-card--error"
        role="alert"
      >
        <div class="state-card-icon-chip state-card-icon-chip--error">
          <Icon
            name="heroicons:exclamation-circle"
            class="h-4 w-4"
            aria-hidden="true"
          />
        </div>
        <p class="text-sm">{{ t('errors.generic') }}</p>
      </div>

      <div v-else class="mb-4">
        <p class="text-gray-700 text-sm dark:text-gray-200">
          {{ t('house.leave.message') }}
        </p>
        <p class="text-gray-500 text-sm mt-1 dark:text-gray-400">
          {{ t('house.leave.warning') }}
        </p>
      </div>

      <p
        v-if="error"
        class="text-sm text-error-600 dark:text-error-400 mt-2"
        role="alert"
      >
        {{ error }}
      </p>
    </template>

    <template #footer>
      <UiButton
        variant="secondary"
        :aria-label="$t('a11y.buttons.cancel')"
        @click="emit('close')"
      >
        {{ t('common.cancel') }}
      </UiButton>

      <UiButton
        v-if="isOwner"
        variant="secondary"
        disabled
        :aria-label="$t('a11y.buttons.leaveHouse')"
      >
        {{ t('house.leave.transferFirst') }}
      </UiButton>

      <UiButton
        v-else-if="hasBalance"
        variant="secondary"
        disabled
        :aria-label="$t('a11y.buttons.leaveHouse')"
      >
        {{ t('house.leave.settleFirst') }}
      </UiButton>

      <UiButton
        v-else
        variant="danger"
        :loading="leaving"
        :disabled="!canLeave || loadingBalance"
        :aria-label="$t('a11y.buttons.leaveHouse')"
        @click="handleLeave"
      >
        {{ t('house.leave.leave') }}
      </UiButton>
    </template>
  </UiModal>
</template>
