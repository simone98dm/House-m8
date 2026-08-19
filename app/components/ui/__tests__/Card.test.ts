import { describe, it, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import UiCard from '~/components/ui/Card.vue';

describe('UiCard', () => {
  it('renders slot content', async () => {
    const wrapper = await mountSuspended(UiCard, {
      slots: { default: '<p>Body content</p>' },
    });
    expect(wrapper.text()).toContain('Body content');
  });

  it('renders default variant with shadow', async () => {
    const wrapper = await mountSuspended(UiCard);
    expect(wrapper.find('div').attributes('class')).toContain('shadow-md');
  });

  it('renders elevated variant', async () => {
    const wrapper = await mountSuspended(UiCard, {
      props: { variant: 'elevated' },
    });
    expect(wrapper.find('div').attributes('class')).toContain('shadow-lg');
  });

  it('renders outlined variant', async () => {
    const wrapper = await mountSuspended(UiCard, {
      props: { variant: 'outlined' },
    });
    expect(wrapper.find('div').attributes('class')).toContain(
      'bg-[var(--surface)]',
    );
  });

  it('applies no-padding class', async () => {
    const wrapper = await mountSuspended(UiCard, {
      props: { padding: 'none' },
    });
    expect(wrapper.find('div').attributes('class')).toContain('p-0');
  });

  it('applies sm padding', async () => {
    const wrapper = await mountSuspended(UiCard, {
      props: { padding: 'sm' },
    });
    expect(wrapper.find('div').attributes('class')).toContain('p-3');
  });

  it('applies lg padding', async () => {
    const wrapper = await mountSuspended(UiCard, {
      props: { padding: 'lg' },
    });
    expect(wrapper.find('div').attributes('class')).toContain('p-6');
  });

  it('applies w-full when fullWidth is true', async () => {
    const wrapper = await mountSuspended(UiCard, {
      props: { fullWidth: true },
    });
    expect(wrapper.find('div').attributes('class')).toContain('w-full');
  });

  it('renders header slot', async () => {
    const wrapper = await mountSuspended(UiCard, {
      slots: { header: '<h2>Header</h2>' },
    });
    expect(wrapper.text()).toContain('Header');
  });

  it('renders footer slot', async () => {
    const wrapper = await mountSuspended(UiCard, {
      slots: { footer: '<span>Footer</span>' },
    });
    expect(wrapper.text()).toContain('Footer');
  });
});
