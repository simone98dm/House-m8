<script lang="ts" setup>
interface AppPageHeaderProps {
  allowBack?: boolean;
}

const { allowBack = false } = defineProps<AppPageHeaderProps>();

const userStore = useUserStore();
const notificationStore = useNotificationStore();
</script>

<template>
  <ClientOnly>
    <Teleport to="#header-content">
      <AppHeader
        :allow-back="allowBack"
        :user="userStore.currentUser"
        :notifications="notificationStore.notificationHistory"
        :unread-count="notificationStore.unreadCount"
        @clear-notifications="notificationStore.clearHistory()"
      >
        <slot />
        <template v-if="$slots.actions" #actions>
          <slot name="actions" />
        </template>
      </AppHeader>
    </Teleport>
  </ClientOnly>
</template>
