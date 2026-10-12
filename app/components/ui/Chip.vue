<script setup lang="ts">
interface ChipProps {
  icon?: string;
  label: string;
  variant?:
    'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  selectable?: boolean;
  selected?: boolean;
  removable?: boolean;
}

interface ChipEvents {
  click: [];
  remove: [];
}

const {
  icon = undefined,
  label,
  variant = 'default',
  size = 'md',
  selectable = false,
  selected = false,
  removable = false,
} = defineProps<ChipProps>();

const emit = defineEmits<ChipEvents>();

const chipClasses = computed(() => {
  const baseClasses =
    'inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap transition-all';

  const interactiveClasses = selectable
    ? 'cursor-pointer hover:shadow-md active:scale-95'
    : '';

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1.5 text-sm',
    lg: 'px-3 py-2 text-base',
  };

  // Unselected fills use the --{state}-subtle/--{state}-fg CSS custom
  // properties (assets/css/_tokens.scss) via arbitrary-value classes rather than raw
  // Tailwind color-100/700 pairs — those vars already flip under `.dark`,
  // so no separate dark: classes are needed here (matches the Card.vue
  // `bg-surface` precedent). The previous hardcoded pairs had no
  // dark: coverage at all for secondary/success/warning/danger.
  const variantClasses = {
    default: selected
      ? 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100 border-2 border-gray-400 dark:border-gray-500'
      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-2 border-transparent',
    primary: selected
      ? 'bg-primary-600 text-white border-2 border-primary-800'
      : 'bg-brand-subtle text-brand-hover border-2 border-transparent',
    secondary: selected
      ? 'bg-secondary-600 text-white border-2 border-secondary-800'
      : 'bg-[var(--secondary-subtle)] text-[color:var(--secondary-hover)] border-2 border-transparent',
    success: selected
      ? 'bg-success-600 text-white border-2 border-success-700'
      : 'bg-ok-subtle text-ok-fg border-2 border-transparent',
    warning: selected
      ? 'bg-warning-600 text-white border-2 border-warning-700'
      : 'bg-warn-subtle text-warn-fg border-2 border-transparent',
    danger: selected
      ? 'bg-error-600 text-white border-2 border-error-700'
      : 'bg-danger-subtle text-danger-fg border-2 border-transparent',
  };

  return [
    baseClasses,
    interactiveClasses,
    sizeClasses[size],
    variantClasses[variant],
  ].join(' ');
});

const iconSize = computed(() => {
  const sizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };
  return sizes[size];
});

const handleClick = () => {
  if (selectable) {
    emit('click');
  }
};
</script>

<template>
  <span
    :class="chipClasses"
    :role="selectable ? 'button' : undefined"
    :tabindex="selectable ? 0 : undefined"
    :aria-pressed="selectable ? selected : undefined"
    @click="handleClick"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <Icon v-if="icon" :name="icon" :class="iconSize" aria-hidden="true" />
    <span>{{ label }}</span>
    <!-- Raw: unpadded inline icon (ml-1, no bg) nested inside the chip's own
         clickable span — UiButton's padding/background would break the
         chip's compact pill shape. -->
    <button
      v-if="removable"
      type="button"
      :aria-label="`Remove ${label}`"
      class="hover:opacity-70 transition-opacity ml-1"
      @click.stop="emit('remove')"
    >
      <Icon name="heroicons:x-mark" class="w-3 h-3" aria-hidden="true" />
    </button>
  </span>
</template>
