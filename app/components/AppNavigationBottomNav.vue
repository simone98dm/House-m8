<script lang="ts" setup>
interface AppNavigationBottomNavProps {
  hasHouse?: boolean;
  currentHouseId?: string;
}

const { hasHouse = false, currentHouseId = '' } =
  defineProps<AppNavigationBottomNavProps>();

const userStore = useUserStore();

const { allNavItems, isActive, resolvedPath } = useAppNavItems(
  () => hasHouse,
  () => currentHouseId,
);
</script>

<template>
  <nav class="bottom-nav" :aria-label="$t('navigation.main')">
    <NuxtLink
      v-for="item in allNavItems.slice(0, 4)"
      :key="item.path"
      :to="resolvedPath(item.path)"
      class="bottom-nav-item"
      :class="{ active: isActive(item.path) }"
      :aria-current="isActive(item.path) ? 'page' : undefined"
    >
      <Icon :name="item.icon" class="w-[22px] h-[22px]" aria-hidden="true" />
      <span>{{ item.label }}</span>
    </NuxtLink>

    <!-- Profile is a fixed 5th slot rather than part of allNavItems: the list
         above is capped at 4, so any profile entry added there would be pushed
         out as soon as the user has a house. On mobile the sidebar (and its
         avatar link) is display:none, which left /user/[id] unreachable. -->
    <NuxtLink
      v-if="userStore.isAuthenticated && userStore.currentUser"
      :to="`/user/${userStore.currentUser.id}`"
      class="bottom-nav-item"
      :class="{ active: isActive('/user') }"
      :aria-current="isActive('/user') ? 'page' : undefined"
    >
      <Icon
        name="heroicons:user-circle"
        class="w-[22px] h-[22px]"
        aria-hidden="true"
      />
      <span>{{ $t('navigation.profile') }}</span>
    </NuxtLink>
  </nav>
</template>

<style scoped>
/* ── Bottom Nav (mobile) ── */
.bottom-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--bottom-nav-h);
  background: var(--surface);
  border-top: 1px solid var(--border);
  z-index: 100;
  align-items: center;
  justify-content: space-around;
  padding: 0 8px;
}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  /* Equal-width slots with horizontal padding that can collapse: with the
     profile entry there are now 5 items, and a fixed 12px inline padding
     overflowed the bar at 320px. */
  flex: 1 1 0;
  min-width: 0;
  padding: 8px 4px;
  border-radius: var(--radius-control);
  color: var(--fg-subtle);
  text-decoration: none;
  font-size: var(--fs-2xs);
  font-weight: 500;
  transition: color var(--transition);
  cursor: pointer;
}

/* Labels truncate instead of wrapping, so a long translation (e.g. "Profilo",
   "Bilancio") can never push the bar taller than --bottom-nav-h. */
.bottom-nav-item span {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.bottom-nav-item.active {
  color: var(--primary);
}
.bottom-nav-item:hover {
  text-decoration: none;
}

@media (max-width: 768px) {
  .bottom-nav {
    display: flex;
  }
}
</style>
