import { describe, it, expect } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import PrivacyPage from '~/pages/privacy.vue';

// NOTE: `locale` here is a plain `{ value: 'en' }` object, not a real Vue
// ref (this matches the mock convention used across the rest of this
// codebase). The page's `v-if="locale === 'it'"` compares the raw object
// to the string 'it', which is always false, so only the English branch is
// reachable under this mock regardless of `.value`.
mockNuxtImport('useI18n', () => () => ({
  t: (key: string) => key,
  locale: { value: 'en' },
}));

const G = {
  mocks: { $t: (k: string) => k },
  stubs: { Icon: true, NuxtLink: true },
};

describe('Privacy Page', () => {
  it('renders', async () => {
    const wrapper = await mountSuspended(PrivacyPage, { global: G });
    expect(wrapper.exists()).toBe(true);
  });

  it('renders the Privacy Policy heading and key section headings', async () => {
    const wrapper = await mountSuspended(PrivacyPage, { global: G });
    const text = wrapper.text();
    expect(text).toContain('Privacy Policy');
    expect(text).toContain('Data controller');
    expect(text).toContain('Recipients and processors');
    expect(text).toContain('Your rights');
    expect(text).toContain('Simone Dal Mas');
  });

  it('renders the privacy contact mailto link', async () => {
    const wrapper = await mountSuspended(PrivacyPage, { global: G });
    const mailLink = wrapper.find('a[href="mailto:simone.dalmas@outlook.it"]');
    expect(mailLink.exists()).toBe(true);
  });

  it('links to the cookie policy instead of duplicating a cookie table', async () => {
    const wrapper = await mountSuspended(PrivacyPage, { global: G });
    expect(wrapper.html()).toContain('/cookies');
    expect(wrapper.text()).not.toContain('house_m8_access_token');
  });

  it('has no placeholders for VAT, address, PEC or DPO', async () => {
    const wrapper = await mountSuspended(PrivacyPage, { global: G });
    const text = wrapper.text();
    expect(text).not.toMatch(/\b(VAT|PEC|DPO)\b|\[address\]|\[Company/i);
  });

  it('has no unresolved placeholders or incomplete notice', async () => {
    const wrapper = await mountSuspended(PrivacyPage, { global: G });
    expect(wrapper.text()).not.toContain('[[DA COMPLETARE');
    expect(wrapper.find('[role="note"]').exists()).toBe(false);
  });
});
