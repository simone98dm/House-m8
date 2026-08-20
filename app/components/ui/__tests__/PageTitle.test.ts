import { describe, it, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import PageTitle from '~/components/ui/PageTitle.vue';

describe('UiPageTitle', () => {
  it('renders', async () => {
    const wrapper = await mountSuspended(PageTitle, {
      props: { title: 'Dashboard' },
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('shows title', async () => {
    const wrapper = await mountSuspended(PageTitle, {
      props: { title: 'Dashboard' },
    });
    expect(wrapper.text()).toContain('Dashboard');
  });

  it('shows subtitle when provided', async () => {
    const wrapper = await mountSuspended(PageTitle, {
      props: { title: 'Dashboard', subtitle: 'Overview of your house' },
    });
    expect(wrapper.text()).toContain('Overview of your house');
  });

  it('hides subtitle when not provided', async () => {
    const wrapper = await mountSuspended(PageTitle, {
      props: { title: 'Dashboard' },
    });
    expect(wrapper.find('p').exists()).toBe(false);
  });

  it('renders action slot content', async () => {
    const wrapper = await mountSuspended(PageTitle, {
      props: { title: 'Dashboard' },
      slots: { action: '<button class="action-slot">Add</button>' },
    });
    expect(wrapper.find('.action-slot').exists()).toBe(true);
  });
});
