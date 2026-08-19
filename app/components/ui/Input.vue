<script lang="ts" setup>
interface InputProps {
  id?: string;
  type?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  size?: 'sm' | 'md' | 'lg';
  rows?: number;
  hint?: string;
  ariaLabel?: string;
}

interface InputEvents {
  blur: [];
  focus: [];
}

const {
  id = undefined,
  type = 'text',
  placeholder = undefined,
  disabled = false,
  required = false,
  error = false,
  size = 'md',
  label = undefined,
  rows = 3,
  hint = undefined,
  ariaLabel = undefined,
} = defineProps<InputProps>();

const modelValue = defineModel<string | number>({ default: '' });

const generatedId = useId();
const generatedHintId = useId();
const finalId = computed(() => id ?? generatedId);
const hintId = computed(() => (hint ? generatedHintId : undefined));

defineEmits<InputEvents>();

// Without this, undeclared native attributes (min, max, step, pattern, ...)
// fall through to the root <div> below instead of the <input>/<textarea>,
// silently disabling them. See bill/EditModal.vue, bill/Modal.vue,
// house/Modal.vue for call sites that rely on `:min`/`:max` reaching the
// input.
defineOptions({ inheritAttrs: false });

const isTextarea = computed(() => type === 'textarea');

const inputClasses = computed(() => {
  const baseClasses = [
    'w-full',
    'rounded-xl',
    'border',
    'transition-all',
    'duration-150',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-0',
    // gray-400 placeholder measured ~3.3:1 on white (fails the 4.5:1 AA
    // floor placeholders are held to, same as body text). gray-500 passes.
    'placeholder:text-gray-500',
  ];

  const sizeClasses = {
    sm: ['px-3', 'py-2', 'text-sm'],
    md: ['px-3', 'py-2.5', 'text-sm'],
    lg: ['px-4', 'py-3', 'text-base'],
  };

  // Ghost border (outline-variant @ 15%) → primary on focus
  // Error: error text color + semi-transparent error bg tint
  const stateClasses = error
    ? [
        'border-error-600/30',
        'bg-error-600/[0.04]',
        'focus:border-error-600',
        'focus:ring-error-600/20',
        'text-error-600',
        'dark:bg-error-600/[0.08]',
        'dark:text-error-400',
        // gray-500 (dark bg) measured ~2.75:1; gray-300 clears AA (~6.5:1).
        'dark:placeholder:text-gray-300',
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
        // gray-500 (dark bg) measured ~2.75:1; gray-300 clears AA (~6.5:1).
        'dark:placeholder:text-gray-300',
      ];

  const disabledClasses = disabled
    ? [
        'bg-surface-low',
        'text-gray-400',
        'cursor-not-allowed',
        'opacity-60',
        'dark:bg-gray-900',
        'dark:text-gray-600',
      ]
    : [];

  return [
    ...baseClasses,
    ...sizeClasses[size],
    ...stateClasses,
    ...disabledClasses,
  ].join(' ');
});
</script>

<template>
  <div class="space-y-1.5">
    <label
      v-if="label"
      :for="finalId"
      class="block text-sm font-semibold text-gray-700 dark:text-gray-300"
    >
      {{ label }}
      <span v-if="required" class="text-error-600 ml-0.5" aria-hidden="true"
        >*</span
      >
    </label>

    <component
      :is="isTextarea ? 'textarea' : 'input'"
      v-bind="$attrs"
      :id="finalId"
      :type="isTextarea ? undefined : type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :rows="isTextarea ? rows : undefined"
      :class="inputClasses"
      :aria-label="ariaLabel || undefined"
      :aria-invalid="error"
      :aria-required="required"
      :aria-describedby="hintId"
      @input="
        modelValue = ($event.target as HTMLInputElement | HTMLTextAreaElement)
          .value
      "
      @blur="$emit('blur')"
      @focus="$emit('focus')"
    />

    <p
      v-if="hint"
      :id="hintId"
      class="text-xs"
      :class="
        error
          ? 'text-error-600 dark:text-error-400'
          : 'text-gray-500 dark:text-gray-400'
      "
    >
      {{ hint }}
    </p>
  </div>
</template>
