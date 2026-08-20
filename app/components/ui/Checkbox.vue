<script setup lang="ts">
interface CheckboxProps {
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const {
  label = undefined,
  disabled = false,
  size = 'md',
} = defineProps<CheckboxProps>();

const modelValue = defineModel<boolean>({ required: true });

const inputId = useId();

const toggle = () => {
  if (!disabled) {
    modelValue.value = !modelValue.value;
  }
};

const sizeClasses = {
  sm: 'w-8 h-4',
  md: 'w-10 h-5',
  lg: 'w-12 h-6',
};

const knobSizeClasses = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

const translateClasses = {
  sm: 'translate-x-4',
  md: 'translate-x-5',
  lg: 'translate-x-6',
};
</script>

<template>
  <div class="flex items-center gap-3">
    <!-- Hidden native checkbox for proper semantics and keyboard support.
         Raw by design: this IS the primitive other components should adopt,
         it can't wrap itself. -->
    <input
      :id="inputId"
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      class="sr-only peer"
      @change="toggle"
    />
    <!-- Visual toggle track — acts as label for the hidden input -->
    <label
      :for="inputId"
      :class="[
        'relative inline-flex items-center rounded-full transition-colors duration-150 ease-in-out',
        'peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500 peer-focus-visible:ring-offset-2',
        sizeClasses[size],
        modelValue ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
      ]"
    >
      <span
        :class="[
          'inline-block transform rounded-full bg-white shadow transition-transform duration-200 ease-in-out',
          knobSizeClasses[size],
          modelValue ? translateClasses[size] : 'translate-x-0.5',
        ]"
      />
    </label>
    <label
      v-if="label"
      :for="inputId"
      :class="[
        'text-sm font-medium select-none',
        disabled
          ? 'text-gray-400 cursor-not-allowed dark:text-gray-600'
          : 'text-gray-700 cursor-pointer dark:text-gray-300',
      ]"
    >
      {{ label }}
    </label>
  </div>
</template>
