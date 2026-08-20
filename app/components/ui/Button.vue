<script lang="ts" setup>
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  success?: boolean;
  icon?: string;
  fullWidth?: boolean;
  outline?: boolean;
  /**
   * When set, renders a NuxtLink instead of a button. Several call sites already
   * passed `to` expecting this; without it the value fell through as an inert
   * HTML attribute and the control did nothing.
   */
  to?: string;
}

interface ButtonEvents {
  click: [];
}

const {
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  loading = false,
  success = false,
  icon = undefined,
  fullWidth = false,
  outline = false,
  to = undefined,
} = defineProps<ButtonProps>();

defineEmits<ButtonEvents>();

const nuxtLink = resolveComponent('NuxtLink');
const tag = computed(() => (to ? nuxtLink : 'button'));

const { buttonClasses: styleFor, iconSizeClasses: iconSizeFor } =
  useButtonStyles();

const buttonClasses = computed(() =>
  // `disabled:` variants are appended here, not in the shared source: <a> has
  // no :disabled pseudo-class, so UiLinkButton applies its own instead.
  [
    styleFor({ variant, size, outline, fullWidth }),
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' '),
);

const formattedIcon = computed(() => {
  return `heroicons:${icon}`;
});

const iconSizeClasses = computed(() => iconSizeFor(size));
</script>

<template>
  <component
    :is="tag"
    :to="to"
    :type="to ? undefined : type"
    :class="buttonClasses"
    :disabled="to ? undefined : disabled || loading"
    :aria-disabled="to && (disabled || loading) ? 'true' : undefined"
    @click="$emit('click')"
  >
    <Icon
      v-if="loading"
      name="heroicons:arrow-path"
      :class="[iconSizeClasses, 'animate-spin']"
      aria-hidden="true"
    />
    <Icon
      v-else-if="success"
      name="heroicons:check"
      :class="[iconSizeClasses, 'animate-scale-in']"
      aria-hidden="true"
    />
    <Icon
      v-else-if="icon"
      :name="formattedIcon"
      :class="iconSizeClasses"
      aria-hidden="true"
    />
    <slot v-if="!success" />
  </component>
</template>
