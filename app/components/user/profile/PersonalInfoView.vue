<script setup lang="ts">
import type { User } from '~/types';

interface Props {
  user: User;
  isOwnProfile?: boolean;
}

const { user, isOwnProfile = false } = defineProps<Props>();

const { formatShort } = useDate();

const formatDate = (dateString: string) => formatShort(dateString);

const getGenderDisplay = (g: string) => g.replace('_', ' ');

const getOccupationDisplay = (u: User) => {
  if (!u.occupation_type) return '';
  let base = u.occupation_type;
  if (u.occupation_type === 'student' && u.study_field)
    base += ` - ${u.study_field}`;
  if (u.occupation_type === 'worker' && u.job_title)
    base += ` - ${u.job_title}`;
  return base;
};

const hasNoInformation = computed(
  () =>
    isOwnProfile &&
    !user.birthdate &&
    !user.gender &&
    !user.birthplace &&
    !user.nationality &&
    !user.occupation_type &&
    (!user.languages || user.languages.length === 0) &&
    !user.is_smoker &&
    !user.pets &&
    !user.telephone &&
    !user.instagram &&
    !user.twitter &&
    !user.linkedin &&
    !user.tiktok,
);
</script>

<template>
  <div v-if="hasNoInformation" class="text-center py-8">
    <Icon
      name="heroicons:user-circle"
      class="mx-auto h-10 w-10 text-gray-300 mb-3"
      aria-hidden="true"
    />
    <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">
      {{ $t('profile.personal.noInformation') }}
    </p>
    <p class="text-xs text-gray-500 dark:text-gray-400">
      {{ $t('profile.personal.clickEditToAdd') }}
    </p>
  </div>

  <div v-else class="grid gap-3 sm:grid-cols-2">
    <UserProfileInfoField
      v-if="user.birthdate"
      icon="heroicons:cake"
      icon-bg-class="bg-danger-subtle"
      icon-color-class="text-danger-fg"
      :label="$t('profile.personal.birthdate')"
      :value="formatDate(user.birthdate)"
    />

    <UserProfileInfoField
      v-if="user.gender"
      icon="heroicons:user"
      icon-bg-class="bg-[var(--secondary-subtle)]"
      icon-color-class="text-[color:var(--secondary-hover)]"
      :label="$t('profile.personal.gender')"
      :value="getGenderDisplay(user.gender)"
      value-class="capitalize"
    />

    <UserProfileInfoField
      v-if="user.birthplace"
      icon="heroicons:map-pin"
      icon-bg-class="bg-brand-subtle"
      icon-color-class="text-brand-hover"
      :label="$t('profile.personal.birthplace')"
      :value="user.birthplace"
    />

    <UserProfileInfoField
      v-if="user.nationality"
      icon="heroicons:flag"
      icon-bg-class="bg-ok-subtle"
      icon-color-class="text-ok-fg"
      :label="$t('profile.personal.nationality')"
      :value="user.nationality"
    />

    <UserProfileInfoField
      v-if="user.occupation_type"
      icon="heroicons:briefcase"
      icon-bg-class="bg-warn-subtle"
      icon-color-class="text-warn-fg"
      :label="$t('profile.personal.occupationType')"
      :value="getOccupationDisplay(user)"
      value-class="capitalize"
    />

    <UserProfileInfoField
      v-if="user.languages && user.languages.length > 0"
      icon="heroicons:language"
      icon-bg-class="bg-[var(--secondary-subtle)]"
      icon-color-class="text-[color:var(--secondary-hover)]"
      :label="$t('profile.personal.languages')"
    >
      <div class="mt-1 flex flex-wrap gap-1">
        <span
          v-for="language in user.languages"
          :key="language"
          class="inline-block rounded-full bg-[var(--secondary-subtle)] px-2.5 py-0.5 text-xs font-bold text-[color:var(--secondary-hover)]"
        >
          {{ language }}
        </span>
      </div>
    </UserProfileInfoField>

    <UserProfileInfoField
      v-if="user.is_smoker !== undefined && user.is_smoker !== null"
      icon="heroicons:no-symbol"
      icon-bg-class="bg-warn-subtle"
      icon-color-class="text-warn-fg"
      :label="$t('profile.personal.smoker')"
      :value="user.is_smoker ? $t('common.yes') : $t('common.no')"
    />

    <UserProfileInfoField
      v-if="user.pets"
      icon="heroicons:heart"
      icon-bg-class="bg-danger-subtle"
      icon-color-class="text-danger-fg"
      :label="$t('profile.personal.pets')"
    >
      <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
        {{ user.pets }}
      </p>
    </UserProfileInfoField>

    <UserProfileInfoField
      v-if="user.preferred_currency"
      icon="heroicons:currency-dollar"
      icon-bg-class="bg-ok-subtle"
      icon-color-class="text-ok-fg"
      :label="$t('profile.personal.preferredCurrency')"
      :value="user.preferred_currency"
    />

    <UserProfilePersonalInfoSocial :user="user" />
  </div>
</template>
