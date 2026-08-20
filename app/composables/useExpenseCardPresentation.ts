/**
 * useExpenseCardPresentation
 *
 * Derives the presentational state shared by every expense-card layout
 * (share/paid status, formatted dates, category icon + colour) from a
 * single expense. Extracted so `ExpenseCardMobile` and `ExpenseCardRow`
 * — the mobile-card and desktop-row renderings of the same expense — don't
 * each carry their own copy of this logic.
 *
 * Accepts getters (not raw values) so callers can pass reactive-props
 * destructured bindings straight through without losing reactivity.
 */
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import type { Expense } from '~/types';

export function useExpenseCardPresentation(
  expense: MaybeRefOrGetter<Expense>,
  currentUserId: MaybeRefOrGetter<string | undefined>,
) {
  const { formatShort } = useDate();

  const userShare = computed(() =>
    toValue(expense).shares?.find(
      (share) => share.user_id === toValue(currentUserId),
    ),
  );

  const isCreator = computed(
    () => toValue(expense).created_by === toValue(currentUserId),
  );

  const isPaid = computed(() => userShare.value?.is_paid ?? false);

  const formattedDate = computed(() =>
    formatShort(toValue(expense).created_at),
  );

  const formattedDateShort = computed(() =>
    formatShort(toValue(expense).created_at, { year: false }),
  );

  const expenseIconName = computed((): string => {
    const desc = toValue(expense).description.toLowerCase();
    if (
      desc.includes('grocer') ||
      desc.includes('food') ||
      desc.includes('supermarket')
    )
      return 'heroicons:shopping-cart';
    if (
      desc.includes('restaurant') ||
      desc.includes('dinner') ||
      desc.includes('lunch') ||
      desc.includes('pizza')
    )
      return 'heroicons:cake';
    if (
      desc.includes('gas') ||
      desc.includes('fuel') ||
      desc.includes('petrol')
    )
      return 'heroicons:fire';
    if (
      desc.includes('transport') ||
      desc.includes('bus') ||
      desc.includes('train') ||
      desc.includes('taxi')
    )
      return 'heroicons:truck';
    if (
      desc.includes('entertain') ||
      desc.includes('movie') ||
      desc.includes('cinema')
    )
      return 'heroicons:film';
    if (desc.includes('shopping') || desc.includes('clothes'))
      return 'heroicons:shopping-bag';
    if (
      desc.includes('electric') ||
      desc.includes('utility') ||
      desc.includes('internet') ||
      desc.includes('wifi')
    )
      return 'heroicons:bolt';
    if (
      desc.includes('water') ||
      desc.includes('cleaning') ||
      desc.includes('household')
    )
      return 'heroicons:sparkles';
    if (
      desc.includes('medical') ||
      desc.includes('doctor') ||
      desc.includes('pharmacy')
    )
      return 'heroicons:heart';
    if (desc.includes('settlement') || desc.includes('payment'))
      return 'heroicons:arrow-path';
    return 'heroicons:banknotes';
  });

  // dark: added throughout — every bucket here previously kept its light-mode
  // pastel chip color in dark mode (no dark: coverage at all), same gap found
  // across the rest of the ui/ sweep. 'info' shares primary's dark shades since
  // the info Tailwind scale has no 400/900 step to draw a dark pairing from.
  const iconColourClasses = computed((): string => {
    const icon = expenseIconName.value;
    const map: Record<string, string> = {
      'heroicons:shopping-cart':
        'bg-warning-100 dark:bg-warning-900/30 text-warning-600 dark:text-warning-400',
      'heroicons:cake':
        'bg-secondary-100 dark:bg-secondary-900/30 text-secondary-600 dark:text-secondary-400',
      'heroicons:bolt':
        'bg-info-100 dark:bg-primary-900/20 text-info-600 dark:text-primary-400',
      'heroicons:sparkles':
        'bg-success-100 dark:bg-success-900/30 text-success-600 dark:text-success-400',
      'heroicons:heart':
        'bg-error-100 dark:bg-error-900/30 text-error-600 dark:text-error-400',
      'heroicons:shopping-bag':
        'bg-warning-100 dark:bg-warning-900/30 text-warning-600 dark:text-warning-400',
      'heroicons:fire':
        'bg-error-100 dark:bg-error-900/30 text-error-600 dark:text-error-400',
      'heroicons:truck':
        'bg-info-100 dark:bg-primary-900/20 text-info-600 dark:text-primary-400',
      'heroicons:film':
        'bg-secondary-100 dark:bg-secondary-900/30 text-secondary-600 dark:text-secondary-400',
      'heroicons:arrow-path':
        'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
    };
    return (
      map[icon] ??
      'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
    );
  });

  return {
    userShare,
    isCreator,
    isPaid,
    formattedDate,
    formattedDateShort,
    expenseIconName,
    iconColourClasses,
  };
}
