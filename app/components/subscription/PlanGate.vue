<script setup lang="ts">
interface Props {
  requiredPlan: 'pro' | 'house_plus';
}
const { requiredPlan } = defineProps<Props>();

const subscriptionStore = useSubscriptionStore();
const showPaywall = ref(false);

const hasAccess = computed(() => {
  if (requiredPlan === 'pro') return subscriptionStore.isPro;
  return subscriptionStore.isHousePlus;
});
</script>

<template>
  <div>
    <slot v-if="hasAccess" />
    <div v-else @click="showPaywall = true">
      <slot name="locked">
        <div class="relative cursor-pointer select-none">
          <div class="pointer-events-none opacity-40">
            <slot />
          </div>
          <div
            class="absolute inset-0 flex items-center justify-center rounded-lg bg-white/70 backdrop-blur-xs dark:bg-gray-900/70"
          >
            <div class="flex flex-col items-center gap-2 text-center">
              <span class="text-2xl" aria-hidden="true">🔒</span>
              <span
                class="text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                {{
                  $t('subscription.requiresPlan', {
                    plan: requiredPlan === 'pro' ? 'Pro' : 'House+',
                  })
                }}
              </span>
              <!-- Raw: uses the brand "tertiary" color, which isn't one of
                   UiButton's variants (primary/secondary/ghost/danger), and
                   this pill is smaller than UiButton's sm size. Also has no
                   click handler of its own — it relies on the wrapping div's
                   click to open the paywall, by design. -->
              <button
                type="button"
                class="mt-1 rounded-full bg-tertiary-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-tertiary-700 transition-colors"
              >
                {{ $t('subscription.upgrade') }}
              </button>
            </div>
          </div>
        </div>
      </slot>
    </div>
    <!-- No `v-if` alongside `:show` — see the note in pages/expenses/index.vue:
         an outer v-if skips both the enter and leave animations. -->
    <SubscriptionPaywallModal
      :show="showPaywall"
      :required-plan="requiredPlan"
      @close="showPaywall = false"
    />
  </div>
</template>
