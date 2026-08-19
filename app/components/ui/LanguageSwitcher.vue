<script lang="ts" setup>
type Locale = 'en' | 'it';

const { locale, setLocale } = useI18n();

// Get current locale info
const currentLocale = computed(() => locale.value);
const availableLocales = computed(() => [
  { code: 'en' as Locale, name: 'English', flag: '🇬🇧' },
  { code: 'it' as Locale, name: 'Italiano', flag: '🇮🇹' },
]);

// Switch language function
const switchLanguage = async (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const newLocale = target.value as Locale;

  if (newLocale !== currentLocale.value) {
    await setLocale(newLocale);
  }
};
</script>

<template>
  <div class="flex items-center justify-between">
    <label
      for="language-select"
      class="text-sm font-medium text-gray-700 dark:text-gray-300"
    >
      {{ $t('profile.settings.language') }}
    </label>
    <select
      id="language-select"
      :value="currentLocale"
      class="w-36 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400 transition-colors duration-150"
      @change="switchLanguage"
    >
      <option v-for="loc in availableLocales" :key="loc.code" :value="loc.code">
        {{ loc.flag }} {{ loc.name }}
      </option>
    </select>
  </div>
</template>
