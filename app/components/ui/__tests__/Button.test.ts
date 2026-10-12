import { describe, it, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import UiButton from '~/components/ui/Button.vue';

describe('UiButton', () => {
  it('renders default slot content', async () => {
    const wrapper = await mountSuspended(UiButton, {
      slots: { default: 'Save' },
    });
    expect(wrapper.text()).toContain('Save');
  });

  it('renders primary variant by default', async () => {
    const wrapper = await mountSuspended(UiButton);
    expect(wrapper.find('button').attributes('class')).toContain(
      'bg-linear-to-br',
    );
  });

  it('renders secondary variant', async () => {
    const wrapper = await mountSuspended(UiButton, {
      props: { variant: 'secondary' },
    });
    expect(wrapper.find('button').attributes('class')).toContain(
      'bg-surface-high',
    );
  });

  it('renders danger variant', async () => {
    const wrapper = await mountSuspended(UiButton, {
      props: { variant: 'danger' },
    });
    expect(wrapper.find('button').attributes('class')).toContain(
      'bg-error-600',
    );
  });

  it('renders ghost variant', async () => {
    const wrapper = await mountSuspended(UiButton, {
      props: { variant: 'ghost' },
    });
    expect(wrapper.find('button').attributes('class')).toContain(
      'bg-transparent',
    );
  });

  it('renders outline primary', async () => {
    const wrapper = await mountSuspended(UiButton, {
      props: { variant: 'primary', outline: true },
    });
    expect(wrapper.find('button').attributes('class')).toContain(
      'border-primary-600',
    );
  });

  it('renders sm size', async () => {
    const wrapper = await mountSuspended(UiButton, { props: { size: 'sm' } });
    expect(wrapper.find('button').attributes('class')).toContain('text-sm');
  });

  it('renders lg size', async () => {
    const wrapper = await mountSuspended(UiButton, { props: { size: 'lg' } });
    expect(wrapper.find('button').attributes('class')).toContain('text-base');
  });

  it('applies w-full when fullWidth is true', async () => {
    const wrapper = await mountSuspended(UiButton, {
      props: { fullWidth: true },
    });
    expect(wrapper.find('button').attributes('class')).toContain('w-full');
  });

  it('is disabled when disabled prop is set', async () => {
    const wrapper = await mountSuspended(UiButton, {
      props: { disabled: true },
    });
    expect(wrapper.find('button').attributes('disabled')).toBeDefined();
  });

  it('is disabled when loading is true', async () => {
    const wrapper = await mountSuspended(UiButton, {
      props: { loading: true },
    });
    expect(wrapper.find('button').attributes('disabled')).toBeDefined();
  });

  it('emits click event', async () => {
    const wrapper = await mountSuspended(UiButton);
    await wrapper.find('button').trigger('click');
    expect(wrapper.emitted('click')).toBeTruthy();
  });

  it('sets type attribute', async () => {
    const wrapper = await mountSuspended(UiButton, {
      props: { type: 'submit' },
    });
    expect(wrapper.find('button').attributes('type')).toBe('submit');
  });

  describe('to prop', () => {
    it('renders a plain button when no `to` is given', async () => {
      const wrapper = await mountSuspended(UiButton);
      expect(wrapper.find('button').exists()).toBe(true);
      expect(wrapper.find('a').exists()).toBe(false);
    });

    it('renders a link to the target when `to` is given', async () => {
      const wrapper = await mountSuspended(UiButton, {
        props: { to: '/pricing' },
      });
      const link = wrapper.find('a');
      expect(link.exists()).toBe(true);
      expect(link.attributes('href')).toBe('/pricing');
      // A link must not carry button-only attributes.
      expect(wrapper.find('button').exists()).toBe(false);
      expect(link.attributes('type')).toBeUndefined();
    });

    it('marks a disabled link with aria-disabled, since <a> ignores disabled', async () => {
      const wrapper = await mountSuspended(UiButton, {
        props: { to: '/pricing', disabled: true },
      });
      const link = wrapper.find('a');
      expect(link.attributes('disabled')).toBeUndefined();
      expect(link.attributes('aria-disabled')).toBe('true');
    });
  });
});
