import { describe, it, expect } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import TermsPage from '~/pages/terms.vue';

// NOTE: same locale-mock caveat as privacy.test.ts — `locale` is a plain
// object here, not a real ref, so `v-if="locale === 'it'"` never matches
// and only the English branch renders under test.
mockNuxtImport('useI18n', () => () => ({
  t: (key: string) => key,
  locale: { value: 'en' },
}));

const G = {
  mocks: { $t: (k: string) => k },
  stubs: { Icon: true, NuxtLink: true },
};

describe('Terms Page', () => {
  it('renders', async () => {
    const wrapper = await mountSuspended(TermsPage, { global: G });
    expect(wrapper.exists()).toBe(true);
  });

  it('renders the Terms of Service heading and key section headings', async () => {
    const wrapper = await mountSuspended(TermsPage, { global: G });
    const text = wrapper.text();
    expect(text).toContain('Terms of Service');
    expect(text).toContain('Acceptance');
    expect(text).toContain('Limitation of liability');
    expect(text).toContain('Governing law');
  });

  it('renders the service description text', async () => {
    const wrapper = await mountSuspended(TermsPage, { global: G });
    expect(wrapper.text()).toContain(
      'House M8 is a platform for managing shared expenses between roommates',
    );
  });

  it('characterizes unfilled template placeholders shipped in the content', async () => {
    // Legal boilerplate still contains bracketed placeholders that read as
    // unfinished copy rather than finalized terms. The owner decided to keep
    // them visible (see the incomplete-document notice below) rather than
    // invent legal values that don't exist yet.
    const wrapper = await mountSuspended(TermsPage, { global: G });
    const text = wrapper.text();
    expect(text).toContain('[GO-LIVE DATE]');
    expect(text).toContain('[CITY]');
  });

  it('renders a visible notice that the document is incomplete', async () => {
    const wrapper = await mountSuspended(TermsPage, { global: G });
    const note = wrapper.find('[role="note"]');
    expect(note.exists()).toBe(true);
    expect(note.text()).toContain('legal.incompleteNotice.title');
    expect(note.text()).toContain('legal.incompleteNotice.termsBody');
  });
});
