<script lang="ts" setup>
import type { User, UiNotification } from '~/types';

interface AppHeaderProps {
  allowBack?: boolean;
  user?: User | null;
  notifications?: UiNotification[];
  unreadCount?: number;
}

interface AppHeaderEmits {
  'clear-notifications': [];
}

const {
  allowBack = false,
  notifications = [],
  unreadCount = 0,
} = defineProps<AppHeaderProps>();

const emit = defineEmits<AppHeaderEmits>();

const router = useRouter();

const goBack = () => {
  router.go(-1);
};
</script>

<template>
  <header class="page-header">
    <div class="page-header-left">
      <UiButton
        v-if="allowBack"
        variant="ghost"
        size="sm"
        icon="chevron-left"
        style="margin-right: 4px"
        :aria-label="$t('common.back')"
        @click="goBack"
      />
      <slot />
    </div>

    <div class="page-header-right">
      <slot name="actions" />

      <ClientOnly>
        <UiNotificationDropdown
          :notifications="notifications"
          :unread-count="unreadCount"
          @clear-history="emit('clear-notifications')"
        />
        <template #fallback>
          <!-- Reserve the bell button's footprint to avoid hydration shift -->
          <div class="size-9" aria-hidden="true" />
        </template>
      </ClientOnly>
    </div>
  </header>
</template>
