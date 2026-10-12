<script lang="ts" setup>
interface CardProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'plain';
  padding?: 'none' | 'sm' | 'normal' | 'lg';
  fullWidth?: boolean;
  /** Corner radius. Default '2xl' preserves every existing consumer's look. */
  radius?: 'xl' | '2xl';
  /**
   * Root element tag. Lets list-row cards keep a semantic root (e.g. `article`)
   * instead of being forced onto a generic `div`.
   */
  as?: string;
}

const {
  variant = 'default',
  padding = 'normal',
  fullWidth = false,
  radius = '2xl',
  as = 'div',
} = defineProps<CardProps>();

const cardClasses = computed(() => {
  // No borders per "No-Line Rule" — use tonal surface shifts for separation.
  // Ghost border fallback for outlined variant (outline-variant @ 15% opacity).
  const baseClasses = 'transition-all duration-200';

  const radiusClasses = {
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
  };

  const variantClasses = {
    default: 'bg-surface shadow-md hover:shadow-lg',
    elevated: 'bg-surface shadow-lg hover:shadow-xl hover:-translate-y-0.5',
    outlined:
      'bg-surface border border-gray-400/[0.15] dark:border-gray-700 hover:border-primary-600/20 dark:hover:border-primary-400/30',
    // Bare surface tone only — no border/shadow of its own. For callers that
    // need to supply their own chrome (border color, shadow steps) via a
    // passthrough `class`, since mixing a baked-in Tailwind utility with an
    // overriding one on the same element has no reliable winner.
    plain: 'bg-surface',
  };

  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3',
    normal: 'p-4 sm:p-5',
    lg: 'p-6',
  };

  return [
    baseClasses,
    radiusClasses[radius],
    variantClasses[variant],
    paddingClasses[padding],
    fullWidth ? 'w-full' : '',
  ].join(' ');
});
</script>

<template>
  <component :is="as" :class="cardClasses">
    <div v-if="$slots.header" class="mb-4 pb-4">
      <slot name="header" />
    </div>

    <div class="space-y-4">
      <slot />
    </div>

    <div v-if="$slots.footer" class="mt-4 pt-4">
      <slot name="footer" />
    </div>
  </component>
</template>
