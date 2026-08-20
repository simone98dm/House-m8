<script setup lang="ts">
interface UiModalProps {
  show: boolean;
  title?: string;
  maxWidth?: string;
}

interface ModalEvents {
  close: [];
}

const { show, title = '', maxWidth = 'max-w-lg' } = defineProps<UiModalProps>();

const emit = defineEmits<ModalEvents>();
const modalId = useId();
const dialogRef = ref<HTMLDialogElement | null>(null);
let previousFocus: Element | null = null;

const getFocusable = (): HTMLElement[] => {
  if (!dialogRef.value) return [];
  return Array.from(
    dialogRef.value.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ),
  ).filter(
    (el) => !(el as HTMLButtonElement).disabled && el.offsetParent !== null,
  );
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    emit('close');
    return;
  }
  if (e.key === 'Tab') {
    const focusable = getFocusable();
    if (focusable.length === 0) {
      e.preventDefault();
      return;
    }
    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else if (document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
};

watch(
  () => show,
  (val) => {
    if (!import.meta.client) return;
    if (val) {
      previousFocus = document.activeElement;
      nextTick(() => {
        const focusable = getFocusable();
        if (focusable.length) focusable[0]!.focus();
      });
    } else if (previousFocus instanceof HTMLElement) {
      previousFocus.focus();
    }
  },
);
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        ref="dialogRef"
        role="dialog"
        class="modal-backdrop fixed top-0 right-0 left-0 inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm"
        aria-modal="true"
        :aria-labelledby="title || $slots.header ? modalId : undefined"
        @click.self="emit('close')"
        @keydown="handleKeydown"
      >
        <div
          class="modal-content bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full overflow-hidden flex flex-col max-h-[90vh]"
          :class="maxWidth"
        >
          <div
            v-if="title || $slots.header"
            class="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700"
          >
            <slot name="header">
              <h2
                :id="modalId"
                class="text-xl font-bold text-gray-900 dark:text-gray-100"
              >
                {{ title }}
              </h2>
            </slot>
            <!-- Raw: bespoke tiny icon-only close (p-1) sized to sit flush
                 against the modal header; UiButton's smallest padding is
                 visibly larger and would unbalance the header row. -->
            <button
              type="button"
              class="flex text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
              :aria-label="$t('a11y.close')"
              @click="emit('close')"
            >
              <Icon
                name="heroicons:x-mark"
                class="w-6 h-6"
                aria-hidden="true"
              />
            </button>
          </div>

          <div class="p-6 overflow-y-auto">
            <slot />
          </div>

          <div
            v-if="$slots.footer"
            class="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3"
          >
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9) translateY(-20px);
}
</style>
