import type { MaybeRefOrGetter } from 'vue';

export interface AppNavItem {
  path: string;
  icon: string;
  label: string;
  needHouse: boolean;
  needAuth: boolean;
}

/**
 * Shared nav-item filtering/route-matching logic for the desktop sidebar and
 * mobile bottom nav (AppNavigationSidebar.vue / AppNavigationBottomNav.vue).
 * Each caller gets its own independent computed state — nothing reactive is
 * shared across the two navigation surfaces, only the logic that builds it.
 */
export function useAppNavItems(
  hasHouse: MaybeRefOrGetter<boolean>,
  currentHouseId: MaybeRefOrGetter<string>,
) {
  const route = useRoute();
  const { t } = useI18n();
  const userStore = useUserStore();

  const mainNavItems: AppNavItem[] = [
    {
      path: '/dashboard',
      icon: 'heroicons:rectangle-group',
      label: t('navigation.home'),
      needHouse: false,
      needAuth: true,
    },
    {
      path: '/expenses',
      icon: 'heroicons:credit-card',
      label: t('navigation.expenses'),
      needHouse: true,
      needAuth: true,
    },
    {
      path: '/bills',
      icon: 'heroicons:document-text',
      label: t('navigation.bills'),
      needHouse: true,
      needAuth: true,
    },
    {
      path: '/balance',
      icon: 'heroicons:wallet',
      label: t('navigation.balance'),
      needHouse: true,
      needAuth: true,
    },
  ];

  const secondaryNavItems: AppNavItem[] = [
    {
      path: '/reports',
      icon: 'heroicons:chart-bar',
      label: t('navigation.reports') || 'Reports',
      needHouse: true,
      needAuth: true,
    },
    {
      path: '/house/:id',
      icon: 'heroicons:home',
      label: t('navigation.house'),
      needHouse: true,
      needAuth: true,
    },
  ];

  const filterItems = (items: AppNavItem[]) =>
    items.filter((item) => {
      if (item.needAuth && !userStore.isAuthenticated) return false;
      if (item.needHouse && !toValue(hasHouse)) return false;
      return true;
    });

  const filteredMain = computed(() => filterItems(mainNavItems));
  const filteredSecondary = computed(() => filterItems(secondaryNavItems));
  const allNavItems = computed(() => [
    ...filteredMain.value,
    ...filteredSecondary.value,
  ]);

  const isActive = (path: string) => {
    const normalized = path.replace('/:id', '');
    if (normalized === '/dashboard') return route.path === '/dashboard';
    return route.path.startsWith(normalized);
  };

  const resolvedPath = (path: string) =>
    path.replace(':id', toValue(currentHouseId) || '');

  return {
    filteredMain,
    filteredSecondary,
    allNavItems,
    isActive,
    resolvedPath,
  };
}
