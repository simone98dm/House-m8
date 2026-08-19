<script lang="ts" setup>
import type { UiNotification } from '~/types';

interface NotificationContainerProps {
  notifications?: UiNotification[];
}

interface NotificationContainerEmits {
  dismiss: [id: string];
}

const { notifications = [] } = defineProps<NotificationContainerProps>();
const emit = defineEmits<NotificationContainerEmits>();

const handleDismiss = (id: string) => {
  emit('dismiss', id);
};

const handleAction = (_id: string) => {
  // Action is handled by the notification itself
  // We might want to dismiss after action in some cases
};
</script>

<template>
  <Teleport to="body">
    <div
      v-if="notifications.length > 0"
      class="fixed inset-0 z-50 pointer-events-none"
    >
      <div class="hidden md:block">
        <div class="fixed top-4 right-4 space-y-2 pointer-events-auto">
          <TransitionGroup name="notification" tag="div" class="space-y-2">
            <UiNotification
              v-for="notification in notifications"
              :key="notification.id"
              :notification="notification"
              :i18n="notification.i18n"
              @dismiss="handleDismiss(notification.id)"
              @action="handleAction(notification.id)"
            />
          </TransitionGroup>
        </div>
      </div>

      <div class="block md:hidden">
        <div
          class="fixed top-0 left-0 right-0 p-4 space-y-2 pointer-events-auto"
        >
          <TransitionGroup
            name="notification-mobile"
            tag="div"
            class="space-y-2"
          >
            <div
              v-for="notification in notifications"
              :key="notification.id"
              class="w-full"
            >
              <UiNotification
                :notification="notification"
                @dismiss="handleDismiss(notification.id)"
                @action="handleAction(notification.id)"
              />
            </div>
          </TransitionGroup>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* Desktop notification transitions */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-move {
  transition: transform 0.3s ease;
}

/* Mobile notification transitions */
.notification-mobile-enter-active,
.notification-mobile-leave-active {
  transition: all 0.3s ease;
}

.notification-mobile-enter-from {
  opacity: 0;
  transform: translateY(-100%);
}

.notification-mobile-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}

.notification-mobile-move {
  transition: transform 0.3s ease;
}
</style>
