<script setup lang="ts">
interface SwitchProps {
  label?: string;
  ariaLabel?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const {
  label = undefined,
  ariaLabel = undefined,
  disabled = false,
  size = 'md',
} = defineProps<SwitchProps>();
const modelValue = defineModel<boolean>({ required: true });
const labelId = useId();

const toggle = () => {
  if (!disabled) {
    modelValue.value = !modelValue.value;
  }
};

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'w-8 h-4',
    md: 'w-11 h-6',
    lg: 'w-14 h-7',
  };
  return sizes[size];
});

const knobSizeClasses = computed(() => {
  const sizes = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };
  return sizes[size];
});

const translateClasses = computed(() => {
  const sizes = {
    sm: 'translate-x-4',
    md: 'translate-x-5',
    lg: 'translate-x-7',
  };
  return sizes[size];
});

const labelSizeClasses = computed(() => {
  const sizes = {
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base',
  };
  return sizes[size];
});
</script>

<template>
  <div class="flex items-center gap-3">
    <!-- Raw by design: this IS the toggle-switch primitive (role="switch",
         aria-checked); UiButton has no switch semantics to delegate to. -->
    <button
      type="button"
      role="switch"
      :aria-checked="modelValue"
      :aria-labelledby="label ? labelId : undefined"
      :aria-label="!label ? ariaLabel : undefined"
      :disabled="disabled"
      :class="[
        'relative inline-flex shrink-0 rounded-full transition-colors duration-150 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        sizeClasses,
        modelValue
          ? 'bg-primary-600 hover:bg-primary-700'
          : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500',
        disabled
          ? 'opacity-50 cursor-not-allowed hover:bg-gray-200'
          : 'cursor-pointer',
      ]"
      @click="toggle"
    >
      <span
        :class="[
          'pointer-events-none absolute top-1/2 -translate-y-1/2 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-[350ms] [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]',
          knobSizeClasses,
          modelValue ? translateClasses : 'translate-x-0.5',
        ]"
      />
    </button>
    <span
      v-if="label"
      :id="labelId"
      :class="[
        'font-medium select-none',
        labelSizeClasses,
        disabled
          ? 'text-gray-400 cursor-not-allowed dark:text-gray-600'
          : 'text-gray-700 cursor-pointer dark:text-gray-300',
      ]"
      @click="toggle"
    >
      {{ label }}
    </span>
  </div>
</template>
