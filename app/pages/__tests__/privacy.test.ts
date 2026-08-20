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
    expect(text).toContain('Data Controller');
    expect(text).toContain('Sub-processors');
    expect(text).toContain('Your rights');
  });

  it('renders the privacy contact mailto link', async () => {
    const wrapper = await mountSuspended(PrivacyPage, { global: G });
    const mailLink = wrapper.find('a[href="mailto:privacy@housem8.app"]');
    expect(mailLink.exists()).toBe(true);
  });

  it('renders the cookie table with named cookies', async () => {
    const wrapper = await mountSuspended(PrivacyPage, { global: G });
    const text = wrapper.text();
    expect(text).toContain('house_m8_access_token');
    expect(text).toContain('house_m8_refresh_token');
  });

  it('characterizes unfilled template placeholders shipped in the content', async () => {
    // These look like copy that was never filled in before going live. The
    // owner decided to keep them visible (see the incomplete-document notice
    // below) rather than invent legal values that don't exist yet.
    const wrapper = await mountSuspended(PrivacyPage, { global: G });
    const text = wrapper.text();
    expect(text).toContain('[GO-LIVE DATE]');
    expect(text).toContain('[Company name / full name]');
    expect(text).toContain('[Hosting provider]');
  });

  it('renders a visible notice that the document is incomplete', async () => {
    const wrapper = await mountSuspended(PrivacyPage, { global: G });
    const note = wrapper.find('[role="note"]');
    expect(note.exists()).toBe(true);
    expect(note.text()).toContain('legal.incompleteNotice.title');
    expect(note.text()).toContain('legal.incompleteNotice.privacyBody');
  });
});
