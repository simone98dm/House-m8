<script lang="ts" setup>
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  fullWidth?: boolean;
  outline?: boolean;
}

interface ButtonEvents {
  click: [];
}

const {
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon = undefined,
  fullWidth = false,
  outline = false,
} = defineProps<ButtonProps>();

defineEmits<ButtonEvents>();

// <a>/<NuxtLink> has no CSS `:disabled` pseudo-class and ignores the
// `disabled` HTML attribute entirely (spec limitation — only form controls
// support it), so the old `:disabled="disabled || loading"` binding plus
// Tailwind's `disabled:` variant were both silently inert: a "disabled"
// LinkButton stayed fully clickable, keyboard-focusable and normal-looking.
// Fixed by computing state explicitly and applying it via aria-disabled +
// plain conditional classes instead of relying on the pseudo-class.
const isDisabled = computed(() => disabled || loading);

const handleClick = (event: MouseEvent) => {
  if (isDisabled.value) {
    event.preventDefault();
    event.stopPropagation();
  }
};

const { buttonClasses: styleFor, iconSizeClasses: iconSizeFor } =
  useButtonStyles();

const buttonClasses = computed(() =>
  // Identical appearance to UiButton, from the same source. Only the disabled
  // treatment differs, because <a> ignores :disabled entirely.
  [
    styleFor({ variant, size, outline, fullWidth }),
    isDisabled.value ? 'opacity-60 cursor-not-allowed' : '',
  ]
    .filter(Boolean)
    .join(' '),
);

const formattedIcon = computed(() => {
  return `heroicons:${icon}`;
});

const iconSizeClasses = computed(() => iconSizeFor(size));
</script>

<template>
  <NuxtLink
    :class="buttonClasses"
    :aria-disabled="isDisabled"
    :tabindex="isDisabled ? -1 : undefined"
    @click="handleClick"
  >
    <Icon
      v-if="loading"
      name="heroicons:arrow-path"
      :class="[iconSizeClasses, 'animate-spin']"
      aria-hidden="true"
    />
    <Icon
      v-else-if="icon"
      :name="formattedIcon"
      :class="iconSizeClasses"
      aria-hidden="true"
    />
    <slot />
  </NuxtLink>
</template>
