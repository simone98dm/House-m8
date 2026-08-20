<script setup lang="ts">
import type { OccupationType, User } from '~/types';

const { t: $t } = useI18n();

interface Props {
  user: User;
  isSaving?: boolean;
}

interface Emits {
  save: [data: Partial<User>];
  cancel: [];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const form = ref({
  first_name: props.user.first_name || '',
  last_name: props.user.last_name || '',
  email: props.user.email || '',
  birthdate: props.user.birthdate || '',
  gender: props.user.gender || '',
  birthplace: props.user.birthplace || '',
  nationality: props.user.nationality || '',
  occupation_type: props.user.occupation_type || '',
  study_field: props.user.study_field || '',
  job_title: props.user.job_title || '',
  languages: [...(props.user.languages || [])],
  is_smoker: props.user.is_smoker || false,
  pets: props.user.pets || '',
  preferred_currency: props.user.preferred_currency || 'EUR',
  telephone: props.user.telephone || '',
  instagram: props.user.instagram || '',
  twitter: props.user.twitter || '',
  linkedin: props.user.linkedin || '',
  tiktok: props.user.tiktok || '',
});

const genderOptions = [
  { label: $t('profile.personal.genders.male'), value: 'male' },
  { label: $t('profile.personal.genders.female'), value: 'female' },
  { label: $t('profile.personal.genders.other'), value: 'other' },
  {
    label: $t('profile.personal.genders.preferNotToSay'),
    value: 'prefer_not_to_say',
  },
];

const occupationTypes = [
  { label: $t('profile.personal.occupationTypes.student'), value: 'student' },
  { label: $t('profile.personal.occupationTypes.worker'), value: 'worker' },
  { label: $t('profile.personal.occupationTypes.other'), value: 'other' },
];

const currencyOptions = [
  { label: 'USD - US Dollar', value: 'USD' },
  { label: 'EUR - Euro', value: 'EUR' },
];

const showOccupationDetails = computed(
  () =>
    form.value.occupation_type === 'student' ||
    form.value.occupation_type === 'worker',
);

const buildUpdateData = (f: typeof form.value): Partial<User> => {
  const data: Partial<User> = {};
  // Identity fields. Sent only when actually changed: `email` is the sign-in
  // identity and the server does a uniqueness lookup for it, so there is no
  // reason to re-submit the user's own current address on every save.
  const firstName = f.first_name.trim();
  const lastName = f.last_name.trim();
  const email = f.email.trim();
  if (firstName && firstName !== props.user.first_name)
    data.first_name = firstName;
  if (lastName && lastName !== props.user.last_name) data.last_name = lastName;
  if (email && email.toLowerCase() !== (props.user.email ?? '').toLowerCase())
    data.email = email;
  if (f.birthdate) data.birthdate = f.birthdate;
  if (f.gender)
    data.gender = f.gender as 'male' | 'female' | 'other' | 'prefer_not_to_say';
  if (f.birthplace) data.birthplace = f.birthplace;
  if (f.nationality) data.nationality = f.nationality;
  if (f.occupation_type)
    data.occupation_type = f.occupation_type as OccupationType;
  if (f.study_field) data.study_field = f.study_field;
  if (f.job_title) data.job_title = f.job_title;
  if (f.languages.length > 0) data.languages = f.languages;
  // `users.pets` is a TEXT column and the server schema is `z.string()`. This
  // used to send the split array, which failed validation — so saving a profile
  // with any pet filled in returned 400 and silently lost the whole edit.
  const pets = (f.pets || '')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
    .join(', ');
  if (pets) data.pets = pets;
  if (f.preferred_currency)
    data.preferred_currency = f.preferred_currency as 'USD' | 'EUR';
  if (f.telephone) data.telephone = f.telephone;
  if (f.instagram) data.instagram = f.instagram;
  if (f.twitter) data.twitter = f.twitter;
  if (f.linkedin) data.linkedin = f.linkedin;
  if (f.tiktok) data.tiktok = f.tiktok;
  data.is_smoker = f.is_smoker;
  return data;
};

const handleSave = () => {
  emit('save', buildUpdateData(form.value));
};

const handleCancel = () => {
  emit('cancel');
};
</script>

<template>
  <div class="space-y-5">
    <fieldset class="space-y-4">
      <legend
        class="mb-1 text-sm font-semibold text-gray-700 dark:text-gray-300"
      >
        {{ $t('profile.personal.identity') }}
      </legend>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <UiInput
          id="first_name"
          v-model="form.first_name"
          required
          autocomplete="given-name"
          :label="$t('profile.personal.firstName')"
          :placeholder="$t('profile.personal.firstNamePlaceholder')"
        />
        <UiInput
          id="last_name"
          v-model="form.last_name"
          required
          autocomplete="family-name"
          :label="$t('profile.personal.lastName')"
          :placeholder="$t('profile.personal.lastNamePlaceholder')"
        />
      </div>
      <UiInput
        id="email"
        v-model="form.email"
        type="email"
        required
        autocomplete="email"
        :label="$t('profile.personal.email')"
        :placeholder="$t('profile.personal.emailPlaceholder')"
        :hint="$t('profile.personal.emailHint')"
      />
    </fieldset>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <UiInput
        id="birthdate"
        v-model="form.birthdate"
        :label="$t('profile.personal.birthdate')"
        type="date"
      />
      <UiSelect
        id="gender"
        v-model="form.gender"
        :label="$t('profile.personal.gender')"
        :placeholder="$t('common.select')"
        :options="genderOptions"
      />
      <UiInput
        id="birthplace"
        v-model="form.birthplace"
        :label="$t('profile.personal.birthplace')"
        :placeholder="$t('profile.personal.birthplacePlaceholder')"
      />
      <UiInput
        id="nationality"
        v-model="form.nationality"
        :label="$t('profile.personal.nationality')"
        :placeholder="$t('profile.personal.nationalityPlaceholder')"
      />
    </div>

    <UiSelect
      id="occupation_type"
      v-model="form.occupation_type"
      :label="$t('profile.personal.occupationType')"
      :placeholder="$t('common.select')"
      :options="occupationTypes"
    />

    <div
      v-if="showOccupationDetails"
      class="grid grid-cols-1 sm:grid-cols-2 gap-4"
    >
      <UiInput
        v-if="form.occupation_type === 'student'"
        v-model="form.study_field"
        :label="$t('profile.personal.studyField')"
        :placeholder="$t('profile.personal.studyFieldPlaceholder')"
      />
      <UiInput
        v-if="form.occupation_type === 'worker'"
        v-model="form.job_title"
        :label="$t('profile.personal.jobTitle')"
        :placeholder="$t('profile.personal.jobTitlePlaceholder')"
      />
    </div>

    <UiChipInput
      v-model="form.languages"
      :label="$t('profile.personal.languages')"
      :placeholder="$t('profile.personal.languagesPlaceholder')"
      :add-button-text="$t('common.add')"
    />

    <UiSwitch v-model="form.is_smoker" :label="$t('profile.personal.smoker')" />

    <UiInput
      v-model="form.pets"
      :label="$t('profile.personal.pets')"
      :placeholder="$t('profile.personal.petsPlaceholder')"
    />

    <UiSelect
      id="preferred_currency"
      v-model="form.preferred_currency"
      :label="$t('profile.personal.preferredCurrency')"
      :options="currencyOptions"
    />

    <div class="pt-4 border-t border-gray-100 dark:border-gray-700">
      <h3
        class="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2"
      >
        <Icon
          name="heroicons:chat-bubble-left-right"
          class="h-4 w-4"
          aria-hidden="true"
        />
        {{ $t('profile.personal.contactAndSocial') }}
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <UiInput
          v-model="form.telephone"
          :label="$t('profile.social.telephone')"
          :placeholder="$t('profile.social.telephonePlaceholder')"
          type="tel"
        />
        <UiInput
          v-model="form.instagram"
          :label="$t('profile.social.instagram')"
          placeholder="@username"
        />
        <UiInput
          v-model="form.twitter"
          :label="$t('profile.social.twitter')"
          placeholder="@username"
        />
        <UiInput
          v-model="form.linkedin"
          :label="$t('profile.social.linkedin')"
          placeholder="linkedin.com/in/username"
        />
        <UiInput
          v-model="form.tiktok"
          :label="$t('profile.social.tiktok')"
          placeholder="@username"
        />
      </div>
    </div>

    <div class="flex justify-end gap-2 pt-2">
      <UiButton
        variant="ghost"
        size="sm"
        :disabled="isSaving"
        :aria-label="$t('a11y.buttons.cancel')"
        @click="handleCancel"
      >
        {{ $t('common.cancel') }}
      </UiButton>
      <UiButton
        variant="primary"
        size="sm"
        :disabled="isSaving"
        :aria-label="$t('a11y.buttons.save')"
        @click="handleSave"
      >
        <Icon
          v-if="isSaving"
          name="heroicons:arrow-path"
          class="w-4 h-4 mr-1 animate-spin"
          aria-hidden="true"
        />
        {{ $t('common.save') }}
      </UiButton>
    </div>
  </div>
</template>
