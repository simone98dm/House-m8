<script setup lang="ts">
interface Option {
  label: string;
  value: string | number;
}

interface SelectProps {
  id?: string;
  options: Option[];
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  required?: boolean;
  ariaLabel?: string;
}

const {
  id = undefined,
  options,
  label = undefined,
  placeholder = undefined,
  disabled = false,
  error = false,
  required = false,
  ariaLabel = undefined,
} = defineProps<SelectProps>();

const modelValue = defineModel<string | number | null>({ required: true });

const generatedId = useId();
const inputId = computed(() => id ?? generatedId);

/**
 * Deliberately mirrors `ui/Input.vue`'s `inputClasses`, class for class.
 *
 * The two had drifted: the select carried rounded-lg against the input's
 * rounded-xl, a solid gray-300 border against the input's 15% ghost border
 * (DESIGN.md), and a primary-500 focus ring offset by 1px against the input's
 * primary-600 at offset 0. Side by side in the same form — profile, house
 * edit, expense edit — the two controls read as belonging to different design
 * systems. Any change here belongs in both files.
 */
const selectClasses = computed(() => {
  const base = [
    'w-full',
    'rounded-xl',
    'border',
    'px-3',
    'py-2.5',
    'text-sm',
    'transition-all',
    'duration-150',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-0',
  ];

  const state = error
    ? [
        'border-error-600/30',
        'bg-error-600/[0.04]',
        'focus:border-error-600',
        'focus:ring-error-600/20',
        'text-error-600',
        'dark:bg-error-600/[0.08]',
        'dark:text-error-400',
      ]
    : [
        'border-gray-400/[0.15]',
        'bg-white',
        'focus:border-primary-600',
        'focus:ring-primary-600/15',
        'text-gray-900',
        'dark:border-gray-600',
        'dark:bg-gray-800',
        'dark:focus:border-primary-400',
        'dark:focus:ring-primary-400/20',
        'dark:text-gray-100',
      ];

  const interaction = disabled
    ? [
        'bg-surface-low',
        'text-gray-400',
        'cursor-not-allowed',
        'opacity-60',
        'dark:bg-gray-900',
        'dark:text-gray-600',
      ]
    : ['cursor-pointer'];

  return [...base, ...state, ...interaction].join(' ');
});
</script>

<template>
  <div class="space-y-1.5">
    <label
      v-if="label"
      :for="inputId"
      class="block text-sm font-semibold text-gray-700 dark:text-gray-300"
    >
      {{ label }}
      <span v-if="required" class="text-error-600 ml-0.5" aria-hidden="true"
        >*</span
      >
    </label>
    <select
      :id="inputId"
      v-model="modelValue"
      :disabled="disabled"
      :aria-label="!label ? ariaLabel : undefined"
      :aria-invalid="error"
      :aria-required="required"
      :class="selectClasses"
    >
      <option v-if="placeholder" disabled value="">
        {{ placeholder }}
      </option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
  </div>
</template>
