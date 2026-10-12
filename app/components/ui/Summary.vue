<script setup lang="ts">
/**
 * Headline of a data page: one figure or sentence, an optional action, and
 * a quiet row of supporting facts. Replaces stat-tile grids and coloured
 * banners (DESIGN.md §5).
 */
export interface SummaryFact {
  label: string;
  value: string;
}

interface SummaryProps {
  label?: string;
  detail?: string;
  facts?: SummaryFact[];
}

const { label = '', detail = '', facts = [] } = defineProps<SummaryProps>();
</script>

<template>
  <section
    class="rounded-card border border-line bg-surface p-5 sm:p-6"
    :aria-label="label || undefined"
  >
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div class="min-w-0">
        <p v-if="label" class="text-sm font-medium text-fg-muted">
          {{ label }}
        </p>
        <p class="mt-1 text-2xl text-numeric text-fg sm:text-3xl">
          <slot />
        </p>
        <p v-if="detail" class="mt-1 text-sm text-fg-muted">{{ detail }}</p>
      </div>
      <div v-if="$slots.action" class="shrink-0">
        <slot name="action" />
      </div>
    </div>

    <dl
      v-if="facts.length"
      class="mt-5 flex flex-wrap gap-x-10 gap-y-3 border-t border-line pt-4"
    >
      <div v-for="fact in facts" :key="fact.label">
        <dt class="text-xs font-medium text-fg-muted">{{ fact.label }}</dt>
        <dd class="mt-0.5 text-sm text-numeric text-fg">{{ fact.value }}</dd>
      </div>
    </dl>
  </section>
</template>
