<script setup lang="ts">
interface Props {
  show: boolean;
  requiredPlan: 'pro' | 'house_plus';
}
interface Events {
  close: [];
}
const { requiredPlan } = defineProps<Props>();
const emit = defineEmits<Events>();

const subscriptionStore = useSubscriptionStore();
const isLoading = ref(false);

async function upgrade(
  priceKey:
    'pro_annual' | 'pro_monthly' | 'house_plus_annual' | 'house_plus_monthly',
) {
  isLoading.value = true;
  const url = await subscriptionStore.createCheckoutSession(priceKey);
  if (url) window.location.href = url;
  isLoading.value = false;
}
</script>

<template>
  <UiModal
    :show="show"
    :title="$t('subscription.upgradeTitle')"
    @close="emit('close')"
  >
    <div class="p-6 text-center">
      <p class="mb-6 text-sm text-gray-500 dark:text-gray-400">
        {{ $t('subscription.upgradeDescription') }}
      </p>

      <div
        class="mb-3 rounded-2xl border-2 border-tertiary-600 bg-tertiary-50 p-4 dark:bg-gray-800"
      >
        <div class="flex items-center justify-between">
          <div class="text-left">
            <p class="font-bold text-tertiary-700 dark:text-tertiary-300">
              {{ requiredPlan === 'pro' ? 'Pro' : 'House+' }} —
              {{ $t('subscription.annual') }}
            </p>
            <p class="text-2xl font-black text-gray-900 dark:text-gray-100">
              €{{ requiredPlan === 'pro' ? '3.33' : '6.67'
              }}<span
                class="text-sm font-normal text-gray-500 dark:text-gray-400"
                >/{{ $t('common.month') }}</span
              >
            </p>
            <p class="text-xs text-tertiary-600">
              {{
                $t('subscription.billedAs', {
                  amount: requiredPlan === 'pro' ? '39.99' : '79.99',
                })
              }}
            </p>
          </div>
          <UiButton
            :loading="isLoading"
            @click="
              upgrade(
                requiredPlan === 'pro' ? 'pro_annual' : 'house_plus_annual',
              )
            "
          >
            {{ $t('subscription.startAnnual') }}
          </UiButton>
        </div>
      </div>

      <!-- Raw: a plain underlined text link, not a padded button — same
           quiet-secondary-action pattern kept raw elsewhere in the app. -->
      <button
        type="button"
        class="text-xs text-gray-400 underline dark:text-gray-500"
        :disabled="isLoading"
        @click="
          upgrade(requiredPlan === 'pro' ? 'pro_monthly' : 'house_plus_monthly')
        "
      >
        {{
          $t('subscription.orMonthly', {
            amount: requiredPlan === 'pro' ? '4.99' : '9.99',
          })
        }}
      </button>
    </div>
  </UiModal>
</template>
