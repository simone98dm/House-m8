<script lang="ts" setup>
import type { UiNotification } from '~/types';

interface NotificationProps {
  notification: UiNotification;
  i18n?: boolean;
}

interface NotificationEvents {
  dismiss: [];
  action: [];
}

const { notification, i18n = false } = defineProps<NotificationProps>();

const emit = defineEmits<NotificationEvents>();

const { t } = useI18n();

// Notification type → state-card variant. 'info' has no dedicated DESIGN.md
// token, so it reuses 'primary' (both are the Electric Blue family).
const stateVariant = computed(() =>
  notification.type === 'info' ? 'primary' : notification.type,
);

// Notification icons
const iconNames = {
  success: 'heroicons:check-circle',
  error: 'heroicons:x-circle',
  warning: 'heroicons:exclamation-triangle',
  info: 'heroicons:information-circle',
};

const handleDismiss = () => {
  emit('dismiss');
};

const handleAction = () => {
  if (notification.action) {
    notification.action.action();
    emit('action');
  }
};

// Format timestamp
const formattedTime = computed(() => {
  const now = new Date();
  const diff = now.getTime() - notification.timestamp.getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return t('notifications.justNow');
  if (minutes < 60) return t('notifications.minutesAgo', { count: minutes });

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t('notifications.hoursAgo', { count: hours });

  const days = Math.floor(hours / 24);
  return t('notifications.daysAgo', { count: days });
});
</script>

<template>
  <div
    :class="`state-card--${stateVariant}`"
    class="state-card shadow-sm mb-3 max-w-sm w-full"
    role="alert"
    aria-live="assertive"
    aria-atomic="true"
  >
    <div
      :class="`state-card-icon-chip--${stateVariant}`"
      class="state-card-icon-chip"
    >
      <Icon
        :name="iconNames[notification.type]"
        class="w-4 h-4"
        aria-hidden="true"
      />
    </div>

    <div class="flex items-start flex-1 min-w-0">
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between">
          <p
            class="text-sm font-medium text-gray-900 dark:text-gray-100 break-words"
          >
            {{ i18n ? $t(notification.title) : notification.title }}
          </p>
          <span class="text-xs text-gray-500 dark:text-gray-400 ml-2 shrink-0">
            {{ formattedTime }}
          </span>
        </div>

        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400 break-words">
          {{ i18n ? $t(notification.description) : notification.description }}
        </p>

        <div v-if="notification.action" class="mt-3">
          <UiButton
            variant="ghost"
            size="sm"
            :aria-label="
              i18n ? $t(notification.action.label) : notification.action.label
            "
            @click="handleAction"
          >
            {{
              i18n ? $t(notification.action.label) : notification.action.label
            }}
          </UiButton>
        </div>
      </div>

      <!-- Close button. Raw: bespoke tiny icon-only dismiss (p-1), same
           reason the action button above it uses UiButton but this doesn't. -->
      <div class="ml-3 shrink-0">
        <button
          type="button"
          class="inline-flex text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-hidden focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded-md p-1 transition-colors duration-150"
          :aria-label="t('common.close')"
          @click="handleDismiss"
        >
          <Icon name="heroicons:x-mark" class="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  </div>
</template>
