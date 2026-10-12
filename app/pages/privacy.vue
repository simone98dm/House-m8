<script setup lang="ts">
// Size justification: this file is LEGAL PROSE, not logic — the full policy text
// held twice, once per locale, inside `v-if="locale === 'it'"` blocks. Splitting
// it would scatter one legal document across files and make it harder to check one
// version against the other. Left whole deliberately. The cookie table lives in
// pages/cookies.vue (single source: utils/legal/cookies.ts), never here.
import {
  CONTROLLER_NAME,
  LEGAL_LAST_UPDATED,
  LEGAL_POLICY_VERSION,
  PRIVACY_CONTACT_EMAIL,
} from '~/utils/legal/cookies';

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
      <h1>Informativa sulla privacy</h1>
      <p>
        Informativa ai sensi degli artt. 13 e 14 del Regolamento (UE) 2016/679
        (GDPR).<br />
        <strong>Versione:</strong> {{ LEGAL_POLICY_VERSION }} —
        <strong>Ultimo aggiornamento:</strong> {{ LEGAL_LAST_UPDATED }}
      </p>

      <h2 id="section-1">1. Titolare del trattamento</h2>
      <p>
        Il titolare del trattamento è {{ CONTROLLER_NAME }}, persona fisica (di
        seguito "il titolare", "io"). Per qualsiasi richiesta relativa alla
        privacy puoi scrivere a
        <a :href="`mailto:${PRIVACY_CONTACT_EMAIL}`">{{
          PRIVACY_CONTACT_EMAIL
        }}</a
        >. Questo è l'unico canale per esercitare i tuoi diritti.
      </p>

      <h2 id="section-2">2. Dati trattati</h2>
      <ul>
        <li>
          <strong>Account e profilo:</strong> email, password (conservata solo
          come hash), nome, cognome e, se li inserisci, i dati facoltativi del
          profilo (data di nascita, bio, genere, abitudine al fumo, lavoro,
          studi, lingue, animali domestici, telefono, profili social, foto).
        </li>
        <li>
          <strong>Dati della casa condivisa:</strong> appartenenza alla casa e
          ruolo, inviti, spese e relative quote, bollette e documenti caricati,
          promemoria, bacheca, commenti, segnalazioni (anche con immagini) e
          report mensili.
        </li>
        <li>
          <strong>Autenticazione:</strong> token di sessione (cookie tecnici) e,
          se scegli l'accesso con Google, i dati di identità forniti da Google
          (email e profilo).
        </li>
        <li>
          <strong>Email transazionali:</strong> indirizzo email, nome e
          contenuto dei messaggi (verifica, reset password, inviti, promemoria,
          report, conferma di cancellazione).
        </li>
        <li>
          <strong>Dati tecnici:</strong> log tecnici del server e dei fornitori
          di infrastruttura (ad esempio indirizzo IP e data/ora delle richieste)
          e cookie descritti nella
          <NuxtLink to="/cookies">Cookie Policy</NuxtLink>.
        </li>
        <li>
          <strong>Registro delle richieste privacy:</strong> traccia delle
          richieste di esportazione e cancellazione dei dati, della versione dei
          termini accettata e della data di accettazione.
        </li>
      </ul>

      <h2 id="section-3">3. Finalità e basi giuridiche</h2>
      <table>
        <thead>
          <tr>
            <th scope="col">Finalità</th>
            <th scope="col">Base giuridica</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              Creare e gestire l'account, autenticarti, fornire le funzioni di
              gestione della casa condivisa (spese, bollette, bacheca,
              segnalazioni)
            </td>
            <td>Art. 6(1)(b) — esecuzione del contratto</td>
          </tr>
          <tr>
            <td>
              Inviare email di servizio (verifica, reset password, inviti,
              promemoria, report)
            </td>
            <td>Art. 6(1)(b) — esecuzione del contratto</td>
          </tr>
          <tr>
            <td>
              Compilare il profilo esteso facoltativo e mostrarlo ai coinquilini
            </td>
            <td>Art. 6(1)(a) — consenso</td>
          </tr>
          <tr>
            <td>Trattare genere e abitudine al fumo, se forniti</td>
            <td>Art. 9(2)(a) — consenso esplicito</td>
          </tr>
          <tr>
            <td>
              Sicurezza del servizio, prevenzione degli abusi (ad esempio
              limitazione dei tentativi di accesso), log tecnici
            </td>
            <td>Art. 6(1)(f) — legittimo interesse alla sicurezza</td>
          </tr>
          <tr>
            <td>
              Cookie tecnici e di preferenza (vedi
              <NuxtLink to="/cookies">Cookie Policy</NuxtLink>)
            </td>
            <td>
              Art. 6(1)(f) — legittimo interesse; art. 122 Codice Privacy
              (nessun consenso richiesto per cookie tecnici)
            </td>
          </tr>
          <tr>
            <td>
              Gestire le richieste di esercizio dei diritti e documentare la
              cancellazione degli account
            </td>
            <td>
              Art. 6(1)(c) — obbligo legale; art. 6(1)(f) — accountability
            </td>
          </tr>
        </tbody>
      </table>

      <h2 id="section-4">4. Natura del conferimento</h2>
      <p>
        Email, password (o accesso con Google), nome e cognome sono necessari
        per creare l'account e usare il servizio: senza di essi non posso
        fornirlo. I dati del profilo esteso, genere e abitudine al fumo sono
        facoltativi e trattati solo con il tuo consenso, che puoi revocare in
        qualsiasi momento.
      </p>

      <h2 id="section-5">5. Destinatari e responsabili del trattamento</h2>
      <p>
        I dati non sono venduti. Sono comunicati ai fornitori seguenti, che
        agiscono come responsabili del trattamento (art. 28) o, dove indicato,
        come titolari autonomi, e agli altri membri della tua casa per i dati
        che condividi con loro:
      </p>
      <ul>
        <li>
          <strong>Resend</strong> (Plus Five Five, Inc., USA) — invio delle
          email transazionali; i dati delle email sono conservati negli Stati
          Uniti.
        </li>
        <li>
          <strong>Google</strong> (Google Ireland Limited) — solo se scegli
          l'accesso con Google, per l'autenticazione OAuth.
        </li>
        <li>
          <strong>Vercel Inc.</strong> (USA) — hosting dell'applicazione. Le
          funzioni del server sono eseguite nella regione di Dublino, Irlanda
          (UE); i contenuti statici sono distribuiti tramite la rete CDN globale
          di Vercel.
        </li>
        <li>
          <strong>Supabase</strong> (soggetto contrattuale Supabase Pte. Ltd.,
          Singapore) — database. L'istanza del database è ospitata su AWS
          eu-central-1, Francoforte, Germania (UE).
        </li>
      </ul>

      <h2 id="section-6">6. Trasferimenti extra-UE</h2>
      <p>
        Alcuni fornitori sopra indicati hanno sede o infrastrutture negli Stati
        Uniti o fuori dallo Spazio economico europeo. I trasferimenti avvengono
        sulla base di una decisione di adeguatezza (EU-US Data Privacy
        Framework) o delle Clausole Contrattuali Standard della Commissione
        Europea (decisione 2021/914), come previsto dagli artt. 45 e 46 GDPR:
      </p>
      <ul>
        <li>
          <strong>Vercel:</strong> il fornitore ha sede negli Stati Uniti; i
          dati dell'app sono trattati nell'UE (Dublino) ma il fornitore può
          accedervi dagli Stati Uniti. Si applicano l'EU-US Data Privacy
          Framework (Vercel è certificata) e le Clausole Contrattuali Standard
          incluse nel DPA di Vercel.
        </li>
        <li>
          <strong>Supabase:</strong> i dati sono conservati a Francoforte, ma il
          soggetto contrattuale ha sede a Singapore (paese senza decisione di
          adeguatezza) ed è possibile un accesso di assistenza da fuori UE. Si
          applicano le Clausole Contrattuali Standard incluse nel DPA di
          Supabase.
        </li>
        <li>
          <strong>Resend:</strong> i dati sono conservati negli Stati Uniti; si
          applicano il Data Privacy Framework e le Clausole Contrattuali
          Standard previste dal DPA di Resend.
        </li>
        <li>
          <strong>Google:</strong> il fornitore è Google Ireland Limited; i
          trasferimenti verso Google LLC si basano sul Data Privacy Framework
          (Google LLC è certificata).
        </li>
      </ul>
      <p>
        Puoi richiedere una copia delle Clausole Contrattuali Standard scrivendo
        all'indirizzo email indicato nella sezione 1.
      </p>

      <h2 id="section-7">7. Tempi di conservazione</h2>
      <ul>
        <li>
          <strong>Account attivo:</strong> i dati sono conservati finché
          l'account è attivo.
        </li>
        <li>
          <strong>Cancellazione dell'account:</strong> l'account è disattivato e
          può essere ripristinato per 30 giorni; trascorsi i 30 giorni i dati
          identificativi sono pseudonimizzati con un processo automatico
          giornaliero.
        </li>
        <li>
          <strong>Dati finanziari storici</strong> delle case condivise: restano
          in forma pseudonimizzata, per mantenere coerenti i conti degli altri
          membri.
        </li>
        <li>
          <strong>Inviti:</strong> l'email invitata è anonimizzata appena
          l'invito è usato; gli inviti scaduti e non usati sono eliminati.
        </li>
        <li>
          <strong>Token di verifica email scaduti:</strong> eliminati
          automaticamente.
        </li>
        <li>
          <strong>Cookie di sessione:</strong> token di accesso 15 minuti, token
          di rinnovo sessione del browser o 7 giorni con "ricordami"; durate
          complete nella <NuxtLink to="/cookies">Cookie Policy</NuxtLink>.
        </li>
        <li>
          <strong>Token di reset password:</strong> validi 1 ora; eliminati dal
          processo automatico giornaliero una volta scaduti o usati.
        </li>
        <li>
          <strong>Registro delle richieste privacy</strong> (esportazione e
          cancellazione): conservato finché la richiesta è aperta; le richieste
          chiuse sono eliminate 12 mesi dopo la chiusura, per poter dimostrare
          come sono state gestite.
        </li>
        <li>
          <strong>Documenti e immagini caricati:</strong> il caricamento di file
          non è al momento attivo, quindi nessun file è conservato.
        </li>
        <li>
          <strong>Backup:</strong> il piano del database in uso non prevede
          backup automatici; il fornitore non conserva copie di backup.
        </li>
        <li>
          <strong>Log tecnici del server:</strong> i log di esecuzione di Vercel
          sono conservati 1 ora; i log API e del database di Supabase 1 giorno;
          i log di build (senza dati degli utenti) sono conservati da Vercel
          insieme a ciascun deployment. Resend conserva i log e il contenuto
          delle email per 30 giorni.
        </li>
      </ul>

      <h2 id="section-8">8. I tuoi diritti</h2>
      <p>
        Hai il diritto di chiedere l'accesso ai tuoi dati (art. 15), la
        rettifica (art. 16), la cancellazione (art. 17), la limitazione (art.
        18), la portabilità (art. 20) e di opporti al trattamento basato sul
        legittimo interesse (art. 21). Per esercitarli scrivi a
        <a :href="`mailto:${PRIVACY_CONTACT_EMAIL}`">{{
          PRIVACY_CONTACT_EMAIL
        }}</a
        >; rispondo entro un mese. Nell'app puoi anche, in autonomia, modificare
        il profilo, esportare i tuoi dati e cancellare l'account da Impostazioni
        › Privacy.
      </p>

      <h2 id="section-9">9. Revoca del consenso</h2>
      <p>
        Dove il trattamento si basa sul consenso (profilo esteso, genere e
        abitudine al fumo) puoi revocarlo in qualsiasi momento, scrivendo
        all'indirizzo sopra o dalle impostazioni dell'app, senza pregiudicare la
        liceità del trattamento precedente.
      </p>

      <h2 id="section-10">10. Reclamo all'autorità di controllo</h2>
      <p>
        Puoi proporre reclamo al
        <a
          href="https://www.garanteprivacy.it"
          target="_blank"
          rel="noopener noreferrer"
          >Garante per la protezione dei dati personali</a
        >
        o all'autorità del tuo Stato di residenza.
      </p>

      <h2 id="section-11">11. Processi decisionali automatizzati</h2>
      <p>
        Non è svolta alcuna decisione basata unicamente su un trattamento
        automatizzato, inclusa la profilazione, che produca effetti giuridici
        sul tuo conto o incida in modo analogo significativamente sulla tua
        persona (art. 22).
      </p>

      <h2 id="section-12">12. Cookie</h2>
      <p>
        House M8 usa solo cookie tecnici e di preferenza. L'elenco completo è
        nella <NuxtLink to="/cookies">Cookie Policy</NuxtLink>.
      </p>
    </template>

    <template v-else>
      <h1>Privacy Policy</h1>
      <p>
        Notice under articles 13 and 14 of Regulation (EU) 2016/679 (GDPR).<br />
        <strong>Version:</strong> {{ LEGAL_POLICY_VERSION }} —
        <strong>Last updated:</strong> {{ LEGAL_LAST_UPDATED }}
      </p>

      <h2 id="section-1">1. Data controller</h2>
      <p>
        The data controller is {{ CONTROLLER_NAME }}, a natural person (referred
        to as "the controller" or "I"). For any privacy request, write to
        <a :href="`mailto:${PRIVACY_CONTACT_EMAIL}`">{{
          PRIVACY_CONTACT_EMAIL
        }}</a
        >. This is the only channel for exercising your rights.
      </p>

      <h2 id="section-2">2. Data processed</h2>
      <ul>
        <li>
          <strong>Account and profile:</strong> email, password (stored only as
          a hash), first and last name and, if you provide them, the optional
          profile data (birth date, bio, gender, smoking habit, job, studies,
          languages, pets, phone, social handles, pictures).
        </li>
        <li>
          <strong>Shared household data:</strong> house membership and role,
          invitations, expenses and shares, bills and uploaded documents,
          reminders, bulletin notes, comments, reports (including images) and
          monthly reports.
        </li>
        <li>
          <strong>Authentication:</strong> session tokens (technical cookies)
          and, if you choose Google sign-in, the identity data Google provides
          (email and profile).
        </li>
        <li>
          <strong>Transactional email:</strong> email address, name and message
          content (verification, password reset, invitations, reminders,
          reports, deletion confirmation).
        </li>
        <li>
          <strong>Technical data:</strong> server and infrastructure provider
          logs (for example IP address and request time) and the cookies
          described in the <NuxtLink to="/cookies">Cookie Policy</NuxtLink>.
        </li>
        <li>
          <strong>Privacy request log:</strong> a record of data export and
          deletion requests, the terms version accepted and the acceptance date.
        </li>
      </ul>

      <h2 id="section-3">3. Purposes and legal bases</h2>
      <table>
        <thead>
          <tr>
            <th scope="col">Purpose</th>
            <th scope="col">Legal basis</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              Creating and managing your account, authenticating you, providing
              the shared-household features (expenses, bills, bulletin board,
              reports)
            </td>
            <td>Art. 6(1)(b) — performance of a contract</td>
          </tr>
          <tr>
            <td>
              Sending service emails (verification, password reset, invitations,
              reminders, reports)
            </td>
            <td>Art. 6(1)(b) — performance of a contract</td>
          </tr>
          <tr>
            <td>Optional extended profile shown to housemates</td>
            <td>Art. 6(1)(a) — consent</td>
          </tr>
          <tr>
            <td>Processing gender and smoking habit, if provided</td>
            <td>Art. 9(2)(a) — explicit consent</td>
          </tr>
          <tr>
            <td>
              Service security, abuse prevention (for example login attempt
              limiting), technical logs
            </td>
            <td>Art. 6(1)(f) — legitimate interest in security</td>
          </tr>
          <tr>
            <td>
              Technical and preference cookies (see the
              <NuxtLink to="/cookies">Cookie Policy</NuxtLink>)
            </td>
            <td>
              Art. 6(1)(f) — legitimate interest; art. 122 Italian Privacy Code
              (no consent needed for technical cookies)
            </td>
          </tr>
          <tr>
            <td>Handling rights requests and documenting account deletions</td>
            <td>
              Art. 6(1)(c) — legal obligation; art. 6(1)(f) — accountability
            </td>
          </tr>
        </tbody>
      </table>

      <h2 id="section-4">4. Whether providing data is mandatory</h2>
      <p>
        Email, password (or Google sign-in), first and last name are required to
        create an account and use the service: without them I cannot provide it.
        Extended profile data, gender and smoking habit are optional and
        processed only with your consent, which you can withdraw at any time.
      </p>

      <h2 id="section-5">5. Recipients and processors</h2>
      <p>
        Your data is not sold. It is shared with the providers below, acting as
        processors (art. 28) or, where stated, as independent controllers, and
        with the other members of your house for the data you share with them:
      </p>
      <ul>
        <li>
          <strong>Resend</strong> (Plus Five Five, Inc., USA) — transactional
          email delivery; email data is stored in the USA.
        </li>
        <li>
          <strong>Google</strong> (Google Ireland Limited) — only if you choose
          Google sign-in, for OAuth authentication.
        </li>
        <li>
          <strong>Vercel Inc.</strong> (USA) — application hosting. Server
          functions run in the Dublin, Ireland (EU) region; static content is
          served through Vercel's global CDN.
        </li>
        <li>
          <strong>Supabase</strong> (contracting entity Supabase Pte. Ltd.,
          Singapore) — database. The database instance is hosted on AWS
          eu-central-1, Frankfurt, Germany (EU).
        </li>
      </ul>

      <h2 id="section-6">6. Transfers outside the EU</h2>
      <p>
        Some of the providers above are based in, or run infrastructure in, the
        United States or outside the European Economic Area. Transfers rely on
        an adequacy decision (EU-US Data Privacy Framework) or the European
        Commission's Standard Contractual Clauses (decision 2021/914), as
        provided by articles 45 and 46 GDPR:
      </p>
      <ul>
        <li>
          <strong>Vercel:</strong> the provider is US-based; app data is
          processed in the EU (Dublin) but the provider may access it from the
          US. The EU-US Data Privacy Framework (Vercel is certified) and the
          Standard Contractual Clauses in Vercel's DPA apply.
        </li>
        <li>
          <strong>Supabase:</strong> data is stored in Frankfurt, but the
          contracting entity is in Singapore (no adequacy decision) and support
          access from outside the EU is possible. The Standard Contractual
          Clauses in Supabase's DPA apply.
        </li>
        <li>
          <strong>Resend:</strong> data is stored in the USA; the Data Privacy
          Framework and the Standard Contractual Clauses in Resend's DPA apply.
        </li>
        <li>
          <strong>Google:</strong> the provider is Google Ireland Limited;
          transfers to Google LLC rely on the Data Privacy Framework (Google LLC
          is certified).
        </li>
      </ul>
      <p>
        You can request a copy of the Standard Contractual Clauses by writing to
        the email address in section 1.
      </p>

      <h2 id="section-7">7. Retention</h2>
      <ul>
        <li>
          <strong>Active account:</strong> data is kept while the account is
          active.
        </li>
        <li>
          <strong>Account deletion:</strong> the account is deactivated and can
          be restored for 30 days; after 30 days identifying data is
          pseudonymised by a daily automated process.
        </li>
        <li>
          <strong>Historical financial data</strong> of shared households stays
          in pseudonymised form, so the other members' accounts remain
          consistent.
        </li>
        <li>
          <strong>Invitations:</strong> the invited email is anonymised as soon
          as the invitation is used; expired unused invitations are deleted.
        </li>
        <li>
          <strong>Expired email verification tokens:</strong> deleted
          automatically.
        </li>
        <li>
          <strong>Session cookies:</strong> access token 15 minutes, refresh
          token browser session or 7 days with "remember me"; full durations in
          the <NuxtLink to="/cookies">Cookie Policy</NuxtLink>.
        </li>
        <li>
          <strong>Password reset tokens:</strong> valid for 1 hour; deleted by
          the daily automated cleanup once expired or used.
        </li>
        <li>
          <strong>Privacy request log</strong> (export and deletion requests):
          kept while the request is open; closed requests are deleted 12 months
          after closure, to be able to show how they were handled.
        </li>
        <li>
          <strong>Uploaded documents and images:</strong> file upload is
          currently not active, so no files are stored.
        </li>
        <li>
          <strong>Backups:</strong> the database plan in use does not include
          automatic backups; the provider keeps no backup copies.
        </li>
        <li>
          <strong>Server technical logs:</strong> Vercel runtime logs are kept
          for 1 hour; Supabase API and database logs for 1 day; build logs
          (containing no user data) are kept by Vercel with each deployment.
          Resend keeps email logs and content for 30 days.
        </li>
      </ul>

      <h2 id="section-8">8. Your rights</h2>
      <p>
        You have the right to request access to your data (art. 15),
        rectification (art. 16), erasure (art. 17), restriction (art. 18),
        portability (art. 20) and to object to processing based on legitimate
        interest (art. 21). To exercise them write to
        <a :href="`mailto:${PRIVACY_CONTACT_EMAIL}`">{{
          PRIVACY_CONTACT_EMAIL
        }}</a
        >; I will reply within one month. In the app you can also edit your
        profile, export your data and delete your account yourself from Settings
        › Privacy.
      </p>

      <h2 id="section-9">9. Withdrawing consent</h2>
      <p>
        Where processing is based on consent (extended profile, gender and
        smoking habit) you can withdraw it at any time by writing to the address
        above or from the app settings, without affecting the lawfulness of
        earlier processing.
      </p>

      <h2 id="section-10">10. Complaint to the supervisory authority</h2>
      <p>
        You may lodge a complaint with the Italian Data Protection Authority (<a
          href="https://www.garanteprivacy.it"
          target="_blank"
          rel="noopener noreferrer"
          >Garante per la protezione dei dati personali</a
        >) or the authority in your country of residence.
      </p>

      <h2 id="section-11">11. Automated decision-making</h2>
      <p>
        No decision based solely on automated processing, including profiling,
        that produces legal effects on you or similarly significantly affects
        you is made (art. 22).
      </p>

      <h2 id="section-12">12. Cookies</h2>
      <p>
        House M8 uses only technical and preference cookies. The full list is in
        the <NuxtLink to="/cookies">Cookie Policy</NuxtLink>.
      </p>
    </template>
  </div>
</template>
