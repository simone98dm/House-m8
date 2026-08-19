<script setup lang="ts">
definePageMeta({ layout: 'legal' });
const { locale, t } = useI18n();
const config = useRuntimeConfig();

useSeoMeta({
  title: t('seo.titles.terms'),
  ogTitle: `${t('seo.titles.terms')} | House M8`,
  description: t('seo.descriptions.terms'),
  ogDescription: t('seo.descriptions.terms'),
  ogUrl: `${config.public.baseUrl}/terms`,
});
</script>

<template>
  <div class="prose prose-gray dark:prose-invert max-w-none">
    <template v-if="locale === 'it'">
      <h1>Termini di Servizio</h1>
      <aside
        role="note"
        aria-labelledby="terms-incomplete-heading-it"
        class="state-card state-card--warning not-prose mb-6"
      >
        <div
          class="state-card-icon-chip state-card-icon-chip--warning"
          aria-hidden="true"
        >
          <Icon name="heroicons:exclamation-triangle" class="w-4 h-4" />
        </div>
        <div>
          <p id="terms-incomplete-heading-it" class="font-semibold text-sm">
            {{ t('legal.incompleteNotice.title') }}
          </p>
          <p class="text-sm mt-1">
            {{ t('legal.incompleteNotice.termsBody') }}
          </p>
        </div>
      </aside>
      <p><strong>Versione:</strong> 1.0 — In vigore dal [DATA GO-LIVE]</p>
      <h2 id="section-1">1. Accettazione</h2>
      <p>
        Utilizzando House M8 accetti i presenti Termini. Se non sei d'accordo,
        non utilizzare il servizio.
      </p>
      <h2 id="section-2">2. Descrizione del servizio</h2>
      <p>
        House M8 è una piattaforma per la gestione di spese condivise tra
        coinquilini. Il servizio è fornito "così com'è".
      </p>
      <h2 id="section-3">3. Obblighi dell'utente</h2>
      <ul>
        <li>Fornire informazioni veritiere durante la registrazione.</li>
        <li>Non utilizzare il servizio per attività illegali.</li>
        <li>Non condividere le credenziali di accesso con terzi.</li>
      </ul>
      <h2 id="section-4">4. Limitazione di responsabilità</h2>
      <p>
        Il Titolare non è responsabile per perdite finanziarie derivanti
        dall'uso del servizio. I dati finanziari inseriti sono sotto la
        responsabilità degli utenti.
      </p>
      <h2 id="section-5">5. Modifiche ai Termini</h2>
      <p>
        I Termini possono essere aggiornati. Gli utenti saranno notificati e
        dovranno accettare la nuova versione per continuare ad accedere.
      </p>
      <h2 id="section-6">6. Foro competente</h2>
      <p>
        Per qualsiasi controversia è competente il Tribunale di [CITTÀ], Italia.
      </p>
    </template>

    <template v-else>
      <h1>Terms of Service</h1>
      <aside
        role="note"
        aria-labelledby="terms-incomplete-heading-en"
        class="state-card state-card--warning not-prose mb-6"
      >
        <div
          class="state-card-icon-chip state-card-icon-chip--warning"
          aria-hidden="true"
        >
          <Icon name="heroicons:exclamation-triangle" class="w-4 h-4" />
        </div>
        <div>
          <p id="terms-incomplete-heading-en" class="font-semibold text-sm">
            {{ t('legal.incompleteNotice.title') }}
          </p>
          <p class="text-sm mt-1">
            {{ t('legal.incompleteNotice.termsBody') }}
          </p>
        </div>
      </aside>
      <p><strong>Version:</strong> 1.0 — Effective from [GO-LIVE DATE]</p>
      <h2 id="section-1">1. Acceptance</h2>
      <p>
        By using House M8 you agree to these Terms. If you disagree, do not use
        the service.
      </p>
      <h2 id="section-2">2. Service description</h2>
      <p>
        House M8 is a platform for managing shared expenses between roommates.
        The service is provided "as is".
      </p>
      <h2 id="section-3">3. User obligations</h2>
      <ul>
        <li>Provide truthful information during registration.</li>
        <li>Do not use the service for illegal activities.</li>
        <li>Do not share login credentials with third parties.</li>
      </ul>
      <h2 id="section-4">4. Limitation of liability</h2>
      <p>
        The Controller is not liable for financial losses arising from use of
        the service. Financial data entered is the users' responsibility.
      </p>
      <h2 id="section-5">5. Changes to Terms</h2>
      <p>
        Terms may be updated. Users will be notified and must accept the new
        version to continue accessing the service.
      </p>
      <h2 id="section-6">6. Governing law</h2>
      <p>Any disputes shall be governed by the courts of [CITY], Italy.</p>
    </template>
  </div>
</template>
