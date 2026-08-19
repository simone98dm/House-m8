<script setup lang="ts">
import type { UserExportData } from '~~/server/repositories/interfaces/IGdprRepository';

const { t } = useI18n();
const { formatShort } = useDate();
const api = useApi();

const loading = ref<'json' | 'pdf' | null>(null);
const error = ref('');

async function fetchExportData(): Promise<UserExportData> {
  return await api.fetch<UserExportData>('/api/gdpr/export');
}

async function downloadJson() {
  loading.value = 'json';
  error.value = '';
  try {
    const data = await fetchExportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `housem8-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  } catch {
    error.value = t('common.error');
  } finally {
    loading.value = null;
  }
}

async function downloadPdf() {
  loading.value = 'pdf';
  error.value = '';
  try {
    const data = await fetchExportData();
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(20);
    doc.text('House M8 — Your Data', 14, y);
    y += 10;

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Exported: ${formatShort(data.exported_at)}`, 14, y);
    doc.text(`Email: ${data.user.email}`, 14, y + 6);
    y += 20;

    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Profile', 14, y);
    y += 8;
    doc.setFontSize(10);
    doc.text(`Name: ${data.user.first_name} ${data.user.last_name}`, 14, y);
    y += 6;
    doc.text(`Member since: ${formatShort(data.user.created_at)}`, 14, y);
    y += 12;

    if (data.expenses.length > 0) {
      doc.setFontSize(14);
      doc.text('Expenses', 14, y);
      y += 8;
      doc.setFontSize(10);
      for (const exp of data.expenses.slice(0, 20)) {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(
          `${exp.description} — ${exp.currency} ${exp.my_share.toFixed(2)} (${exp.is_paid ? 'paid' : 'unpaid'})`,
          14,
          y,
        );
        y += 6;
      }
      y += 6;
    }

    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      'Generated under Art. 20 GDPR — Right to Data Portability',
      14,
      290,
    );

    doc.save(`housem8-data-${new Date().toISOString().split('T')[0]}.pdf`);
  } catch {
    error.value = t('common.error');
  } finally {
    loading.value = null;
  }
}
</script>

<template>
  <div
    class="rounded-xl border border-gray-200 bg-[var(--surface)] p-5 dark:border-gray-700"
  >
    <div class="mb-4 flex items-start justify-between">
      <div>
        <p
          class="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500"
        >
          {{ t('gdpr.exportSection') }}
        </p>
        <h3 class="mt-1 font-semibold text-gray-900 dark:text-gray-100">
          {{ t('gdpr.exportTitle') }}
        </h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ t('gdpr.exportDescription') }}
        </p>
      </div>
      <span aria-hidden="true" class="ml-4 text-3xl">📦</span>
    </div>

    <p v-if="error" class="mb-3 text-sm text-red-600" role="alert">
      {{ error }}
    </p>

    <div class="flex flex-wrap gap-2">
      <UiButton
        type="button"
        variant="primary"
        :disabled="loading !== null"
        :loading="loading === 'json'"
        :aria-busy="loading === 'json'"
        :aria-label="t('gdpr.downloadJson')"
        @click="downloadJson"
      >
        {{
          loading === 'json'
            ? t('gdpr.exportGenerating')
            : t('gdpr.downloadJson')
        }}
      </UiButton>
      <UiButton
        type="button"
        variant="secondary"
        :disabled="loading !== null"
        :loading="loading === 'pdf'"
        :aria-busy="loading === 'pdf'"
        :aria-label="t('gdpr.downloadPdf')"
        @click="downloadPdf"
      >
        {{
          loading === 'pdf' ? t('gdpr.exportGenerating') : t('gdpr.downloadPdf')
        }}
      </UiButton>
    </div>
  </div>
</template>
