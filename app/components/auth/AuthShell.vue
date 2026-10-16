<script lang="ts" setup>
// Size justification (Phase 7, "no component over ~250 lines without one"):
// ~265 lines, and that is the point — this shell exists to hold the auth chrome
// ONCE instead of three times. Phase 2 collapsed 658 lines of duplicated scoped
// CSS across login/register/confirm down to 142 by moving it here. Splitting the
// shell would re-fragment the very thing it was built to consolidate. The bulk is
// a single cohesive stylesheet for one visual surface, not multiple
// responsibilities. Left whole deliberately.
interface Props {
  cardMaxWidth?: number;
  cardPaddingBottom?: number;
}

const { cardMaxWidth = 420, cardPaddingBottom = 32 } = defineProps<Props>();

const cardStyle = computed(() => ({
  '--auth-card-max-width': `${cardMaxWidth}px`,
  '--auth-card-pb': `${cardPaddingBottom}px`,
}));

const slots = useSlots();
const hasFooterLink = computed(() => !!slots['footer-link']);
</script>

<template>
  <div class="auth-bg">
    <main class="auth-main" role="main">
      <div class="auth-card" :style="cardStyle">
        <NuxtLink to="/" class="auth-logo" :aria-label="$t('app.name')">
          <div class="auth-logo-mark">M8</div>
          <span class="auth-logo-text">House M8</span>
        </NuxtLink>

        <slot />

        <p v-if="hasFooterLink" class="auth-altlink">
          <slot name="footer-link" />
        </p>
      </div>
    </main>

    <!-- AppFooter is a sibling of <main>, not a descendant (same rule as
         layouts/default.vue). A <footer> nested inside <main> loses its
         implicit contentinfo landmark role per the HTML-ARIA mapping, which
         would make it unreachable via screen-reader landmark navigation
         everywhere except these three auth pages. -->
    <LegalLinks class="relative z-[1] py-2" />
    <AppFooter class="app-footer-themed auth-footer" />
  </div>
</template>

<style scoped>
.auth-bg {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  position: relative;
  overflow: hidden;
  background: var(--bg);
}

.auth-footer {
  width: 100%;
  position: relative;
  z-index: 1;
  /* Deliberately standardised across all three auth pages (was previously an
     accidental cascade leak from the "Don't have an account?" paragraph rule
     onto login/register only — see docs/audit/PHASE-2-BASELINE.md). Applying
     it here consistently is an intentional visible change on /auth/confirm. */
  text-align: center;
  margin-top: 22px;
  font-size: var(--fs-base);
  color: var(--fg-muted);
}
.auth-footer :deep(a) {
  color: var(--primary);
  font-weight: 500;
}

.auth-altlink {
  text-align: center;
  margin-top: 22px;
  font-size: var(--fs-base);
  color: var(--fg-muted);
}
.auth-altlink :deep(a) {
  color: var(--primary);
  font-weight: 500;
}

.auth-main {
  width: 100%;
  display: flex;
  justify-content: center;
  /* Direct flex child of .auth-bg: these auto block margins absorb the free
     space along .auth-bg's column main axis, so the card stays optically
     centred while AppFooter (a sibling below, see template) lands on the
     bottom edge instead of below the fold. `justify-content: center` alone
     cannot do both at once, and the margin trick only works one level up
     from .auth-bg — hence living on .auth-main rather than .auth-card. */
  margin: auto 0;
  position: relative;
  z-index: 1;
}

.auth-card {
  width: 100%;
  max-width: var(--auth-card-max-width, 420px);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  padding: 36px 32px var(--auth-card-pb, 32px);
  box-shadow: var(--shadow-lg);
}

.auth-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 28px;
  text-decoration: none;
}
.auth-logo:hover {
  text-decoration: none;
}

.auth-logo-mark {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--blue-500), var(--purple-500));
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: var(--fs-base);
  color: #fff;
  letter-spacing: -0.5px;
  shrink: 0;
}

.auth-logo-text {
  font-size: var(--fs-2xl);
  font-weight: 700;
  color: var(--fg);
  letter-spacing: -0.4px;
}

/* The following rules style markup that pages provide through the default
   slot (headings, alerts, forms), not markup this component renders itself,
   so :deep() is required to reach across the slot boundary. */
:deep(.auth-heading) {
  font-size: var(--fs-5xl);
  font-weight: 700;
  letter-spacing: -0.6px;
  color: var(--fg);
  margin-bottom: 5px;
  line-height: 1.2;
}

:deep(.auth-sub) {
  font-size: var(--fs-md);
  color: var(--fg-muted);
  margin-bottom: 24px;
  line-height: 1.5;
}

:deep(.auth-form) {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

:deep(.auth-divider) {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--fg-subtle);
  font-size: var(--fs-sm);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
:deep(.auth-divider::before),
:deep(.auth-divider::after) {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border);
}

/* The only raw control left in the auth pages: a branded OAuth button that is
   deliberately off UiButton's scale (flat surface, no gradient, no pill). */
:deep(.btn-google) {
  width: 100%;
  padding: 10px 16px;
  background: var(--surface-raised);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-control);
  font-size: var(--fs-md);
  font-weight: 500;
  color: var(--fg);
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition:
    background var(--transition),
    border-color var(--transition);
}
:deep(.btn-google:hover) {
  background: var(--surface-hover);
}
:deep(.btn-google:disabled) {
  opacity: 0.5;
  cursor: not-allowed;
}
:deep(.auth-alert) {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-control);
  font-size: var(--fs-base);
  margin-bottom: 16px;
}
:deep(.auth-alert-success) {
  background: var(--success-subtle);
  color: var(--success-fg);
  border: 1px solid color-mix(in srgb, var(--success) 20%, transparent);
}
:deep(.auth-alert-error) {
  background: var(--danger-subtle);
  color: var(--danger-fg);
  border: 1px solid color-mix(in srgb, var(--danger) 20%, transparent);
}

@media (max-width: 480px) {
  .auth-card {
    padding: 28px 20px 24px;
  }
}
</style>

<style>
/* Plain (unscoped) on purpose: `.auth-spinner` is rendered inside each page's
   slotted content, and Vue's scoped-CSS keyframe renaming is file-local, so a
   scoped @keyframes here would not reliably resolve across the slot/component
   boundary. The class name is app-specific enough that global scope is safe
   (verified: no other component in app/ uses it). */
.auth-spinner {
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
  shrink: 0;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
