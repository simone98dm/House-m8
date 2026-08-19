<script lang="ts" setup>
// Shared envelope icon: login/register email inputs and register's
// "email sent" success state render the identical path. The input-icon
// context sizes this via the global `.input-with-icon .input-icon svg` rule
// in main.css; the success-icon context sizes it via a `size` prop.
interface Props {
  size?: number;
}

const { size = 16 } = defineProps<Props>();
</script>

<template>
  <svg
    :width="size"
    :height="size"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    stroke-width="2"
    aria-hidden="true"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
</template>
