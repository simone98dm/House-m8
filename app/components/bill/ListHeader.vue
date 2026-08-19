<script lang="ts" setup>
interface BillListHeaderProps {
  title: string;
  buttonText: string;
  showButton?: boolean;
}

const {
  title,
  buttonText,
  showButton = true,
} = defineProps<BillListHeaderProps>();

interface BillListHeaderEvents {
  'add-click': [];
}

const emit = defineEmits<BillListHeaderEvents>();
</script>

<template>
  <div class="flex items-center justify-between">
    <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100">
      {{ title }}
    </h3>
    <!-- Primary + lg to match the equivalent "add" CTA on /expenses. Unlike that
         page this header button is the only add affordance at every breakpoint
         (there is no mobile FAB here), so it must stay usable on narrow screens —
         hence shrink-0 against the adjacent h3. -->
    <UiButton
      v-if="showButton"
      variant="primary"
      size="lg"
      class="shrink-0"
      :aria-label="$t('a11y.buttons.addBill')"
      @click="emit('add-click')"
    >
      <Icon name="heroicons:plus" class="w-5 h-5 mr-1" aria-hidden="true" />
      {{ buttonText }}
    </UiButton>
  </div>
</template>
