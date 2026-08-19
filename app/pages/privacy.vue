<script setup lang="ts">
// Size justification (Phase 7, "no component over ~250 lines without one):
// this file is ~384 lines of LEGAL PROSE, not logic — the full policy text held
// twice, once per locale, inside `v-if="locale === 'it'"` blocks. Its script is a
// handful of lines. Splitting it would scatter a single legal document across
// files for no benefit and make it harder to check one version against the other,
// which is exactly what a lawyer reviewing it needs to do. Left whole deliberately.
definePageMeta({ layout: 'legal' });
const { locale, t } = useI18n();
const config = useRuntimeConfig();

useSeoMeta({
  title: t('seo.titles.privacy'),
  ogTitle: `${t('seo.titles.privacy')} | House M8`,
  description: t('seo.descriptions.privacy'),
  ogDescription: t('seo.descriptions.privacy'),
  ogUrl: `${config.public.baseUrl}/privacy`,
});
</script>

<template>
  <div class="prose prose-gray dark:prose-invert max-w-none">
    <template v-if="locale === 'it'">
      <h1>Privacy Policy</h1>
      <aside
        role="note"
        aria-labelledby="privacy-incomplete-heading-it"
        class="state-card state-card--warning not-prose mb-6"
      >
        <div
          class="state-card-icon-chip state-card-icon-chip--warning"
          aria-hidden="true"
        >
          <Icon name="heroicons:exclamation-triangle" class="w-4 h-4" />
        </div>
        <div>
          <p id="privacy-incomplete-heading-it" class="font-semibold text-sm">
            {{ t('legal.incompleteNotice.title') }}
          </p>
          <p class="text-sm mt-1">
            {{ t('legal.incompleteNotice.privacyBody') }}
          </p>
        </div>
      </aside>
      <p><strong>Versione:</strong> 1.0 — In vigore dal [DATA GO-LIVE]</p>

      <h2 id="section-1">1. Titolare del trattamento</h2>
      <p>
        [Nome azienda / nome e cognome], [indirizzo], [email]<br />
        Contatto privacy:
        <a href="mailto:privacy@housem8.app">privacy@housem8.app</a>
      </p>

      <h2 id="section-2">2. Dati raccolti e finalità</h2>
      <table>
        <thead>
          <tr>
            <th>Dato</th>
            <th>Finalità</th>
            <th>Base giuridica</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Email, nome, cognome</td>
            <td>Autenticazione e identificazione</td>
            <td>Art. 6(1)(b) — Esecuzione di un contratto</td>
          </tr>
          <tr>
            <td>Profilo esteso (bio, lavoro, lingue…)</td>
            <td>Ricerca coinquilini compatibili</td>
            <td>Art. 6(1)(a) — Consenso</td>
          </tr>
          <tr>
            <td>Genere, abitudine al fumo</td>
            <td>Compatibilità tra coinquilini</td>
            <td>Art. 9(2)(a) — Consenso esplicito</td>
          </tr>
          <tr>
            <td>Dati finanziari (spese, bollette)</td>
            <td>Gestione costi condivisi</td>
            <td>Art. 6(1)(b) — Esecuzione di un contratto</td>
          </tr>
          <tr>
            <td>Stripe customer ID</td>
            <td>Gestione abbonamento</td>
            <td>Art. 6(1)(b) — Esecuzione di un contratto</td>
          </tr>
          <tr>
            <td>Cookie JWT di sessione</td>
            <td>Mantenimento sessione autenticata</td>
            <td>Art. 6(1)(f) — Interesse legittimo</td>
          </tr>
          <tr>
            <td>Cookie preferenza lingua</td>
            <td>Memorizzazione lingua preferita</td>
            <td>Art. 6(1)(f) — Interesse legittimo</td>
          </tr>
        </tbody>
      </table>

      <h2 id="section-3">3. Sub-processori (Art. 28)</h2>
      <ul>
        <li>
          <strong>Google LLC</strong> — Autenticazione OAuth. Standard
          Contractual Clauses UE.
        </li>
        <li>
          <strong>Resend Inc.</strong> — Invio email transazionali. Standard
          Contractual Clauses UE.
        </li>
        <li>
          <strong>Stripe Inc.</strong> — Elaborazione pagamenti. Standard
          Contractual Clauses UE.
        </li>
        <li>
          <strong>[Provider hosting]</strong> — Hosting applicazione. [Indicare
          DPA].
        </li>
      </ul>

      <h2 id="section-4">4. Trasferimenti extra-UE</h2>
      <p>
        I trasferimenti verso Google, Resend e Stripe avvengono sulla base di
        Standard Contractual Clauses approvate dalla Commissione Europea.
      </p>

      <h2 id="section-5">5. Tempi di conservazione</h2>
      <ul>
        <li>
          Account attivo: i dati sono conservati fino alla richiesta di
          cancellazione.
        </li>
        <li>
          Post-cancellazione: i dati personali identificativi vengono
          pseudonimizzati entro 30 giorni.
        </li>
        <li>
          Token scaduti (verifica email, reset password): eliminazione
          automatica notturna.
        </li>
        <li>
          Inviti utilizzati: email anonimizzata immediatamente all'accettazione.
        </li>
        <li>
          Dati finanziari storici: mantenuti in forma anonima per integrità
          contabile.
        </li>
      </ul>

      <h2 id="section-6">6. Diritti dell'interessato (Art. 15-22)</h2>
      <ul>
        <li>
          <strong>Accesso (Art. 15):</strong> Impostazioni › Privacy › Esporta
          dati
        </li>
        <li><strong>Rettifica (Art. 16):</strong> Impostazioni › Profilo</li>
        <li>
          <strong>Cancellazione (Art. 17):</strong> Impostazioni › Privacy ›
          Cancella account
        </li>
        <li>
          <strong>Portabilità (Art. 20):</strong> Impostazioni › Privacy ›
          Scarica JSON/PDF
        </li>
        <li>
          <strong>Revoca consenso (Art. 7):</strong> Impostazioni › Privacy ›
          Consensi
        </li>
        <li>
          <strong>Reclamo:</strong>
          <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener"
            >Garante per la protezione dei dati personali</a
          >
        </li>
      </ul>

      <h2 id="section-7">7. Cookie</h2>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Scopo</th>
            <th>Durata</th>
            <th>Base giuridica</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>house_m8_access_token</td>
            <td>JWT sessione autenticata</td>
            <td>15 minuti</td>
            <td>Interesse legittimo</td>
          </tr>
          <tr>
            <td>house_m8_refresh_token</td>
            <td>Rinnovo sessione</td>
            <td>Sessione / 7 giorni (ricordami)</td>
            <td>Interesse legittimo</td>
          </tr>
          <tr>
            <td>i18n_locale</td>
            <td>Preferenza lingua</td>
            <td>Sessione</td>
            <td>Interesse legittimo</td>
          </tr>
        </tbody>
      </table>
    </template>

    <template v-else>
      <h1>Privacy Policy</h1>
      <aside
        role="note"
        aria-labelledby="privacy-incomplete-heading-en"
        class="state-card state-card--warning not-prose mb-6"
      >
        <div
          class="state-card-icon-chip state-card-icon-chip--warning"
          aria-hidden="true"
        >
          <Icon name="heroicons:exclamation-triangle" class="w-4 h-4" />
        </div>
        <div>
          <p id="privacy-incomplete-heading-en" class="font-semibold text-sm">
            {{ t('legal.incompleteNotice.title') }}
          </p>
          <p class="text-sm mt-1">
            {{ t('legal.incompleteNotice.privacyBody') }}
          </p>
        </div>
      </aside>
      <p><strong>Version:</strong> 1.0 — Effective from [GO-LIVE DATE]</p>

      <h2 id="section-1">1. Data Controller</h2>
      <p>
        [Company name / full name], [address], [email]<br />
        Privacy contact:
        <a href="mailto:privacy@housem8.app">privacy@housem8.app</a>
      </p>

      <h2 id="section-2">2. Data collected and purposes</h2>
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Purpose</th>
            <th>Legal basis</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Email, first name, last name</td>
            <td>Authentication and identification</td>
            <td>Art. 6(1)(b) — Contract performance</td>
          </tr>
          <tr>
            <td>Extended profile (bio, job, languages…)</td>
            <td>Roommate matching</td>
            <td>Art. 6(1)(a) — Consent</td>
          </tr>
          <tr>
            <td>Gender, smoking habit</td>
            <td>Roommate compatibility</td>
            <td>Art. 9(2)(a) — Explicit consent</td>
          </tr>
          <tr>
            <td>Financial data (expenses, bills)</td>
            <td>Shared cost management</td>
            <td>Art. 6(1)(b) — Contract performance</td>
          </tr>
          <tr>
            <td>Stripe customer ID</td>
            <td>Subscription management</td>
            <td>Art. 6(1)(b) — Contract performance</td>
          </tr>
          <tr>
            <td>JWT session cookies</td>
            <td>Authenticated session maintenance</td>
            <td>Art. 6(1)(f) — Legitimate interest</td>
          </tr>
          <tr>
            <td>Language preference cookie</td>
            <td>Language preference storage</td>
            <td>Art. 6(1)(f) — Legitimate interest</td>
          </tr>
        </tbody>
      </table>

      <h2 id="section-3">3. Sub-processors (Art. 28)</h2>
      <ul>
        <li>
          <strong>Google LLC</strong> — OAuth authentication. EU Standard
          Contractual Clauses.
        </li>
        <li>
          <strong>Resend Inc.</strong> — Transactional email delivery. EU
          Standard Contractual Clauses.
        </li>
        <li>
          <strong>Stripe Inc.</strong> — Payment processing. EU Standard
          Contractual Clauses.
        </li>
        <li>
          <strong>[Hosting provider]</strong> — Application hosting. [Indicate
          DPA].
        </li>
      </ul>

      <h2 id="section-4">4. International transfers</h2>
      <p>
        Transfers to Google, Resend and Stripe are made under Standard
        Contractual Clauses approved by the European Commission.
      </p>

      <h2 id="section-5">5. Retention periods</h2>
      <ul>
        <li>Active account: data retained until deletion request.</li>
        <li>
          Post-deletion: identifying personal data pseudonymised within 30 days.
        </li>
        <li>
          Expired tokens (email verification, password reset): deleted
          automatically each night.
        </li>
        <li>Used invitations: email anonymised immediately on acceptance.</li>
        <li>
          Historical financial data: retained in anonymous form for accounting
          integrity.
        </li>
      </ul>

      <h2 id="section-6">6. Your rights (Art. 15-22)</h2>
      <ul>
        <li>
          <strong>Access (Art. 15):</strong> Settings › Privacy › Export data
        </li>
        <li><strong>Rectification (Art. 16):</strong> Settings › Profile</li>
        <li>
          <strong>Erasure (Art. 17):</strong> Settings › Privacy › Delete
          account
        </li>
        <li>
          <strong>Portability (Art. 20):</strong> Settings › Privacy › Download
          JSON/PDF
        </li>
        <li>
          <strong>Withdraw consent (Art. 7):</strong> Settings › Privacy ›
          Consents
        </li>
        <li>
          <strong>Lodge a complaint:</strong> Your national data protection
          authority
        </li>
      </ul>

      <h2 id="section-7">7. Cookies</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Purpose</th>
            <th>Duration</th>
            <th>Legal basis</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>house_m8_access_token</td>
            <td>Authenticated session JWT</td>
            <td>15 minutes</td>
            <td>Legitimate interest</td>
          </tr>
          <tr>
            <td>house_m8_refresh_token</td>
            <td>Session renewal</td>
            <td>Session / 7 days (remember me)</td>
            <td>Legitimate interest</td>
          </tr>
          <tr>
            <td>i18n_locale</td>
            <td>Language preference</td>
            <td>Session</td>
            <td>Legitimate interest</td>
          </tr>
        </tbody>
      </table>
    </template>
  </div>
</template>
