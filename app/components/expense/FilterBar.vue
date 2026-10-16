<script lang="ts" setup>
type FilterValue = 'all' | 'pending' | 'settled';

interface ExpenseFilterBarProps {
  currentFilter: FilterValue;
  searchQuery?: string;
}

const { currentFilter, searchQuery = '' } =
  defineProps<ExpenseFilterBarProps>();

interface ExpenseFilterBarEvents {
  'filter-change': [filter: FilterValue];
  'search-change': [query: string];
}

const emit = defineEmits<ExpenseFilterBarEvents>();

const { t: $t } = useI18n();

const filters: FilterValue[] = ['all', 'pending', 'settled'];

// Roving tabindex: only the selected tab is in the Tab order, so DOM focus
// must follow the arrow-key selection (ARIA APG Tabs pattern) or it gets
// stranded on the now-inactive (tabindex="-1") button.
const handleTabKeydown = (event: KeyboardEvent) => {
  const idx = filters.indexOf(currentFilter);
  let nextIdx: number;
  if (event.key === 'ArrowRight') {
    nextIdx = (idx + 1) % filters.length;
  } else if (event.key === 'ArrowLeft') {
    nextIdx = (idx - 1 + filters.length) % filters.length;
  } else {
    return;
  }
  event.preventDefault();
  emit('filter-change', filters[nextIdx]!);
  const tablist = event.currentTarget as HTMLElement;
  nextTick(() =>
    tablist
      .querySelectorAll<HTMLButtonElement>('[role="tab"]')
      [nextIdx]?.focus(),
  );
};
</script>

<template>
  <div class="mb-6">
    <div
      class="flex border-b border-gray-200 dark:border-gray-700 mb-4 md:hidden"
      role="tablist"
      :aria-label="$t('expenses.filterTitle')"
      @keydown="handleTabKeydown"
    >
      <!-- Raw: role="tab" with roving tabindex (ARIA APG Tabs pattern) —
           UiButton has no tab-widget semantics or selected-underline style. -->
      <button
        v-for="filter in filters"
        :key="filter"
        type="button"
        role="tab"
        :aria-selected="currentFilter === filter"
        :tabindex="currentFilter === filter ? 0 : -1"
        :class="[
          'flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors',
          currentFilter === filter
            ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300',
        ]"
        @click="emit('filter-change', filter)"
      >
        {{ $t('expenses.filter.' + filter) }}
      </button>
    </div>

    <div class="hidden md:flex items-center justify-between gap-4">
      <div
        class="flex gap-1 bg-surface rounded-xl p-1 shadow-sm border border-gray-100 dark:border-gray-700"
        role="tablist"
        :aria-label="$t('expenses.filterTitle')"
        @keydown="handleTabKeydown"
      >
        <!-- Raw: same ARIA tab-widget reason as the mobile tab strip above. -->
        <button
          v-for="filter in filters"
          :key="filter"
          type="button"
          role="tab"
          :aria-selected="currentFilter === filter"
          :tabindex="currentFilter === filter ? 0 : -1"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap',
            currentFilter === filter
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
          ]"
          @click="emit('filter-change', filter)"
        >
          {{ $t('expenses.filter.' + filter) }}
        </button>
      </div>

      <div class="relative w-72">
        <Icon
          name="heroicons:magnifying-glass"
          class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"
          aria-hidden="true"
        />
        <!-- Raw input: UiInput has no leading-icon slot, and its fixed
             px-3 padding would sit the placeholder text under this icon. -->
        <input
          :value="searchQuery"
          type="search"
          :placeholder="$t('expenses.searchPlaceholder')"
          class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-surface text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-hidden transition-all shadow-sm"
          :aria-label="$t('expenses.searchPlaceholder')"
          @input="
            emit('search-change', ($event.target as HTMLInputElement).value)
          "
        />
      </div>
    </div>

    <div class="relative md:hidden">
      <Icon
        name="heroicons:magnifying-glass"
        class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"
        aria-hidden="true"
      />
      <!-- Raw input: same leading-icon constraint as the desktop search above. -->
      <input
        :value="searchQuery"
        type="search"
        :placeholder="$t('expenses.searchPlaceholder')"
        class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-surface text-base text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-hidden transition-all shadow-sm"
        :aria-label="$t('expenses.searchPlaceholder')"
        @input="
          emit('search-change', ($event.target as HTMLInputElement).value)
        "
      />
    </div>
  </div>
</template>
