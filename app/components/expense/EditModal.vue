<script lang="ts" setup>
/**
 * ExpenseEditModal — Create / edit expense form in a modal sheet.
 * Reused for both create (no existing expense) and future edit flows.
 */

import type { HouseMember, User, CreateExpensePayload } from '~/types';

interface ExpenseModalProps {
  show: boolean;
  members?: HouseMember[];
  currentUser?: User | null;
}

interface ExpenseModalEvents {
  close: [];
  submit: [payload: CreateExpensePayload];
}

const {
  show,
  members = [],
  currentUser = null,
} = defineProps<ExpenseModalProps>();

const emit = defineEmits<ExpenseModalEvents>();

const { t: $t } = useI18n();

const loading = ref(false);

const form = ref({
  description: '',
  total_amount: '',
  due_date: '',
  user_ids: [] as string[],
});

const toggleUserSelection = (member: HouseMember, checked: boolean) => {
  const userId = member.user?.id ?? '';
  if (checked) {
    if (!form.value.user_ids.includes(userId)) form.value.user_ids.push(userId);
  } else {
    form.value.user_ids = form.value.user_ids.filter((id) => id !== userId);
  }
};

const handleSubmit = async () => {
  if (loading.value) return;
  loading.value = true;
  try {
    const payload: CreateExpensePayload = {
      description: form.value.description,
      total_amount: Number.parseFloat(form.value.total_amount),
      due_date: form.value.due_date || undefined,
      user_ids: form.value.user_ids,
    };
    emit('submit', payload);
    form.value = {
      description: '',
      total_amount: '',
      due_date: '',
      user_ids: currentUser ? [currentUser.id] : [],
    };
  } finally {
    loading.value = false;
  }
};

// Pre-select current user when modal opens
onMounted(() => {
  if (currentUser) form.value.user_ids = [currentUser.id];
});

watch(
  () => currentUser,
  (newUser) => {
    if (newUser && form.value.user_ids.length === 0)
      form.value.user_ids = [newUser.id];
  },
);
</script>

<template>
  <UiModal
    :show="show"
    :title="$t('expenses.form.title')"
    @close="$emit('close')"
  >
    <div class="space-y-4">
      <UiInput
        v-model="form.description"
        :label="$t('expenses.form.description')"
        :placeholder="$t('expenses.form.descriptionPlaceholder')"
        required
        :disabled="loading"
      />

      <UiInput
        v-model="form.total_amount"
        :label="$t('expenses.form.amount')"
        type="number"
        step="0.01"
        min="0.01"
        :placeholder="$t('expenses.form.amountPlaceholder')"
        required
        :disabled="loading"
      />

      <UiInput
        v-model="form.due_date"
        :label="$t('expenses.form.dueDate')"
        type="date"
        :disabled="loading"
      />

      <div>
        <span
          class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
        >
          {{ $t('expenses.form.splitBetween') }}
        </span>
        <div class="grid grid-cols-2 gap-2">
          <div
            v-for="member in members"
            :key="member.id"
            class="flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <UiSwitch
              :model-value="form.user_ids.includes(member.user?.id ?? '')"
              :disabled="loading"
              size="md"
              :aria-label="`${member.user?.first_name} ${member.user?.last_name}`"
              @update:model-value="toggleUserSelection(member, $event)"
            />
            <div class="flex-1 min-w-0">
              <span
                class="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate block"
              >
                {{ member.user?.first_name }} {{ member.user?.last_name }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="flex gap-3 pt-1">
        <UiButton
          variant="secondary"
          full-width
          :disabled="loading"
          icon="no-symbol"
          :aria-label="$t('a11y.buttons.cancel')"
          @click="$emit('close')"
        >
          {{ $t('common.cancel') }}
        </UiButton>
        <UiButton
          :loading="loading"
          icon="check"
          full-width
          :disabled="
            !form.description ||
            !form.total_amount ||
            form.user_ids.length === 0
          "
          @click="handleSubmit"
        >
          {{ $t('expenses.form.createExpense') }}
        </UiButton>
      </div>
    </div>
  </UiModal>
</template>
