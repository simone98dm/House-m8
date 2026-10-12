<script setup lang="ts">
import type { User } from '~/types';

interface UserAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  user?: User | null;
  /** Provide a descriptive label for informative avatars. Omit for decorative usage and add aria-hidden="true" on the component element instead. */
  ariaLabel?: string;
}

const {
  size = 'md',
  user = null,
  ariaLabel = undefined,
} = defineProps<UserAvatarProps>();

const userInitials = computed(() => {
  if (!user) {
    return '?';
  }
  const firstName = user.first_name || '';
  const lastName = user.last_name || '';
  return (firstName[0] || '').toUpperCase() + (lastName[0] || '').toUpperCase();
});

const userAvatarSize = computed(() => {
  const sizes = {
    sm: 'w-8 h-8 text-xs font-semibold',
    md: 'w-10 h-10 text-sm font-semibold',
    lg: 'w-12 h-12 text-base font-semibold',
  };

  return sizes[size] || sizes.md;
});
</script>

<template>
  <div
    :class="[
      userAvatarSize,
      'bg-linear-to-br from-primary-400 to-secondary-600 rounded-full flex items-center justify-center text-white select-none',
    ]"
    :role="ariaLabel ? 'img' : undefined"
    :aria-label="ariaLabel"
  >
    {{ userInitials }}
  </div>
</template>
