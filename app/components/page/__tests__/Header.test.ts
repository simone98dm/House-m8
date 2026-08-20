import { describe, it, expect, beforeEach } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import PageHeader from '~/components/page/Header.vue';

let mockIsAuthenticated = false;
let mockCurrentUserId: string | undefined = undefined;
let mockFlags: Record<string, boolean> = {};

mockNuxtImport('useUserStore', () => () => ({
  isAuthenticated: mockIsAuthenticated,
  currentUser: mockCurrentUserId ? { id: mockCurrentUserId } : null,
}));

mockNuxtImport('useFeatureFlags', () => () => ({
  isEnabled: (flag: string) => mockFlags[flag] ?? false,
}));

describe('page/Header', () => {
  beforeEach(() => {
    mockIsAuthenticated = false;
    mockCurrentUserId = undefined;
    mockFlags = {};
  });

  it('renders the House M8 brand name', async () => {
    const wrapper = await mountSuspended(PageHeader);
    expect(wrapper.text()).toContain('House M8');
  });

  it('shows Features and How it Works links always', async () => {
    const wrapper = await mountSuspended(PageHeader);
    expect(wrapper.text()).toContain('Features');
    expect(wrapper.text()).toContain('How it Works');
  });

  it('hides Pricing link when stripe feature is disabled', async () => {
    mockFlags['stripe-integration'] = false;
    const wrapper = await mountSuspended(PageHeader);
    expect(wrapper.text()).not.toContain('Pricing');
  });

  it('shows Pricing link when stripe feature is enabled', async () => {
    mockFlags['stripe-integration'] = true;
    const wrapper = await mountSuspended(PageHeader);
    expect(wrapper.text()).toContain('Pricing');
  });

  it('shows Go to Dashboard link when authenticated', async () => {
    mockIsAuthenticated = true;
    mockCurrentUserId = 'u-1';
    const wrapper = await mountSuspended(PageHeader);
    expect(wrapper.text()).toContain('Go to Dashboard');
  });

  it('shows Log In link when not authenticated', async () => {
    mockIsAuthenticated = false;
    const wrapper = await mountSuspended(PageHeader);
    expect(wrapper.text()).toContain('Log In');
  });

  it('shows Sign Up Free button when new-users feature is enabled (unauthenticated)', async () => {
    mockIsAuthenticated = false;
    mockFlags['new-users'] = true;
    const wrapper = await mountSuspended(PageHeader);
    expect(wrapper.text()).toContain('Sign Up Free');
  });

  it('hides Sign Up Free when new-users feature is disabled', async () => {
    mockIsAuthenticated = false;
    mockFlags['new-users'] = false;
    const wrapper = await mountSuspended(PageHeader);
    expect(wrapper.text()).not.toContain('Sign Up Free');
  });

  it('links to /user/:id when currentUserId is defined', async () => {
    mockIsAuthenticated = true;
    mockCurrentUserId = 'user-123';
    const wrapper = await mountSuspended(PageHeader);
    expect(wrapper.html()).toContain('/user/user-123');
  });

  it('links to /dashboard when currentUserId is undefined', async () => {
    mockIsAuthenticated = true;
    mockCurrentUserId = undefined;
    const wrapper = await mountSuspended(PageHeader);
    expect(wrapper.html()).toContain('/dashboard');
  });
});
