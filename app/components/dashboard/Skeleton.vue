<script lang="ts" setup>
/**
 * The dashboard's loading placeholder, used in two places: as `<ClientOnly>`'s
 * server-rendered fallback, and as the client-side branch while the stores are
 * still filling.
 *
 * It mirrors the real tree — greeting, stat-grid, then dash-grid with both
 * columns — and reuses those same layout classes, so nothing shifts when the
 * data arrives. An earlier version drew four stat cards plus one flat block in
 * an ad-hoc flex column, and the two-column grid only appeared after load.
 */
const { t } = useI18n();
</script>

<template>
  <div aria-busy="true" :aria-label="t('common.loading')">
    <div class="greeting">
      <UiSkeleton :width="260" :height="34" rounded="rounded-[var(--radius)]" />
    </div>
    <div class="stat-grid">
      <UiSkeleton
        v-for="n in 4"
        :key="n"
        :height="110"
        rounded="rounded-[var(--radius-lg)]"
      />
    </div>
    <div class="dash-grid">
      <div class="dash-left">
        <UiSkeleton :height="280" rounded="rounded-[var(--radius-lg)]" />
        <UiSkeleton :height="180" rounded="rounded-[var(--radius-lg)]" />
      </div>
      <div class="dash-right">
        <UiSkeleton :height="280" rounded="rounded-[var(--radius-lg)]" />
        <UiSkeleton :height="180" rounded="rounded-[var(--radius-lg)]" />
      </div>
    </div>
  </div>
</template>
