<script lang="ts" setup>
interface Props {
  icon?: string;
  label: string;
  value?: string;
  variant?: 'blue' | 'purple' | 'green' | 'orange';
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
}

const {
  icon,
  label,
  value,
  variant = 'blue',
  trend,
  trendDirection = 'neutral',
} = defineProps<Props>();
</script>

<template>
  <div class="stat-card">
    <div v-if="icon" class="stat-icon" :class="variant" aria-hidden="true">
      <Icon :name="icon" class="w-5 h-5" aria-hidden="true" />
    </div>
    <div class="stat-label">{{ label }}</div>
    <div class="stat-value">
      <slot name="value">{{ value }}</slot>
    </div>
    <div
      v-if="trend"
      class="stat-trend"
      :class="trendDirection !== 'neutral' ? trendDirection : ''"
    >
      <svg
        v-if="trendDirection === 'up'"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2.5"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
      <svg
        v-else-if="trendDirection === 'down'"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2.5"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M19 14l-7 7m0 0l-7-7m7 7V3"
        />
      </svg>
      {{ trend }}
    </div>
    <slot />
  </div>
</template>
