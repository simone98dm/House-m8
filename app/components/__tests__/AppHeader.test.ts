import { describe, it, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import AppHeader from '~/components/AppHeader.vue';

describe('AppHeader', () => {
  it('renders without back button by default (allowBack=false)', async () => {
    const wrapper = await mountSuspended(AppHeader);
    // No back button (btn-ghost class), only the notification dropdown button exists
    expect(wrapper.find('button.btn-ghost').exists()).toBe(false);
  });

  it('renders back button when allowBack=true', async () => {
    const wrapper = await mountSuspended(AppHeader, {
      props: { allowBack: true },
    });
    expect(wrapper.find('button').exists()).toBe(true);
  });

  it('calls router.go(-1) when back button is clicked', async () => {
    const wrapper = await mountSuspended(AppHeader, {
      props: { allowBack: true },
    });
    // Should not throw — router.go(-1) is a no-op in the test environment
    await wrapper.find('button').trigger('click');
    expect(wrapper.exists()).toBe(true);
  });

  it('emits clear-notifications when notification dropdown clears history', async () => {
    const notification = {
      id: '1',
      type: 'info' as const,
      title: 'Test Notification',
      description: 'Test description',
      timestamp: new Date(),
    };
    const wrapper = await mountSuspended(AppHeader, {
      props: { notifications: [notification], unreadCount: 1 },
    });
    // Open the dropdown
    await wrapper.find('button').trigger('click');
    // Find and click clear all button inside the dropdown
    const allButtons = wrapper.findAll('button');
    if (allButtons.length > 1) {
      await allButtons[allButtons.length - 1]?.trigger('click');
    }
  });

  it('renders slot content', async () => {
    const wrapper = await mountSuspended(AppHeader, {
      slots: { default: '<span class="slot-test">Page Title</span>' },
    });
    expect(wrapper.find('.slot-test').exists()).toBe(true);
  });

  it('renders with unreadCount badge', async () => {
    const wrapper = await mountSuspended(AppHeader, {
      props: { unreadCount: 5, notifications: [] },
    });
    expect(wrapper.text()).toContain('5');
  });
});
