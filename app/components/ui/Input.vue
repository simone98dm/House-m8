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

const slots = useSlots();
const attrs = useAttrs();

/**
 * The hint owns `aria-describedby`, but call sites also point the field at
 * page-level markup (auth pages reference their error banner). Binding
 * `hintId` alone silently dropped that reference, because the explicit
 * binding below wins over the one spread from `v-bind="$attrs"`. Merge both.
 */
const describedBy = computed(() => {
  const external = attrs['aria-describedby'];
  return (
    [hintId.value, typeof external === 'string' ? external : undefined]
      .filter(Boolean)
      .join(' ') || undefined
  );
});

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
    'focus:outline-hidden',
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
        'text-error-600 dark:text-error-400',
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

  // Clears the absolutely-positioned leading icon. `pl-*` is emitted after
  // `px-*` in Tailwind's output, so it wins over the size class above.
  const iconClasses = slots.icon ? ['pl-10'] : [];

  return [
    ...baseClasses,
    ...sizeClasses[size],
    ...stateClasses,
    ...disabledClasses,
    ...iconClasses,
  ].join(' ');
});
</script>

<template>
  <div class="space-y-1.5">
    <!-- `label-append` puts an action on the label's own line (login's
         "forgot password?" link) without a second copy of the label
         styling at the call site. -->
    <div
      v-if="label || $slots['label-append']"
      class="flex items-baseline justify-between gap-2"
    >
      <label
        v-if="label"
        :for="finalId"
        class="block text-sm font-semibold text-gray-700 dark:text-gray-300"
      >
        {{ label }}
        <span
          v-if="required"
          class="text-error-600 dark:text-error-400 ml-0.5"
          aria-hidden="true"
          >*</span
        >
      </label>
      <slot name="label-append" />
    </div>

    <div class="relative">
      <span
        v-if="$slots.icon"
        class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 [&_svg]:size-4"
        aria-hidden="true"
      >
        <slot name="icon" />
      </span>

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
        :aria-describedby="describedBy"
        @input="
          modelValue = ($event.target as HTMLInputElement | HTMLTextAreaElement)
            .value
        "
        @blur="$emit('blur')"
        @focus="$emit('focus')"
      />
    </div>

    <!-- An error hint is a validation result the user must hear, not a static
         helper line — hence role="alert" only in the error state. -->
    <p
      v-if="hint"
      :id="hintId"
      :role="error ? 'alert' : undefined"
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
