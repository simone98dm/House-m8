export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return;

  const dashboardPath = '/dashboard';
  const loginPath = '/auth/login';
  const userStore = useUserStore();
  const nuxtApp = useNuxtApp();
  if (to.path.startsWith('/api/')) return;

  const isAuthPage = to.path.startsWith('/auth/');
  const publicPaths = ['/', '/privacy', '/terms', '/pricing'];
  const isPublicPage = publicPaths.includes(to.path);

  const consumeStoredRedirect = (currentPath?: string) => {
    const storedRedirect = sessionStorage.getItem('auth_redirect');

    if (!storedRedirect || storedRedirect === currentPath) {
      return null;
    }

    sessionStorage.removeItem('auth_redirect');
    return storedRedirect;
  };

  const restoreSessionIfNeeded = async () => {
    if (nuxtApp._sessionRestoreAttempted) {
      return null;
    }

    nuxtApp._sessionRestoreAttempted = true;

    try {
      await userStore.fetchCurrentUser(to.query.oauth_completed === 'true');
    } catch {
      return null;
    }

    if (!userStore.isAuthenticated) {
      return null;
    }

    return consumeStoredRedirect(to.fullPath);
  };

  const restoredRedirect = await restoreSessionIfNeeded();

  if (restoredRedirect) {
    return navigateTo(restoredRedirect, { replace: true });
  }

  if (userStore.isAuthenticated) {
    if (!isAuthPage) {
      return;
    }

    const storedRedirect = consumeStoredRedirect();
    return navigateTo(storedRedirect ?? dashboardPath, { replace: true });
  }

  if (isAuthPage || isPublicPage) {
    return;
  }

  return navigateTo({
    path: loginPath,
    query: { redirect: to.fullPath },
  });
});
