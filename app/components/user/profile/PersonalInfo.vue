<script setup lang="ts">
import type { User } from '~/types';

interface Props {
  user: User;
  isOwnProfile?: boolean;
}

interface Emits {
  save: [data: Partial<User>];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isEditMode = ref(false);
const isSaving = ref(false);

const hasPictures = computed(
  () =>
    !!(props.user.profile_pictures && props.user.profile_pictures.length > 0),
);

const handleEdit = () => {
  isEditMode.value = true;
};
const handleCancel = () => {
  isEditMode.value = false;
};
const handleSave = async (data: Partial<User>) => {
  isSaving.value = true;
  try {
    emit('save', data);
    isEditMode.value = false;
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <div>
    <UiCard>
      <template #header>
        <div class="flex items-center gap-2">
          <div class="flex-grow flex items-center gap-2">
            <div class="p-2 rounded-lg bg-[var(--secondary-subtle)]">
              <Icon
                name="heroicons:user-circle"
                class="h-5 w-5 text-[var(--secondary-hover)]"
                aria-hidden="true"
              />
            </div>
            <h2 class="text-lg font-bold text-gray-900 dark:text-gray-100">
              {{ $t('profile.personalInformation') }}
            </h2>
          </div>
          <UiButton
            v-if="isOwnProfile && !isEditMode"
            icon="pencil"
            variant="ghost"
            size="sm"
            :aria-label="$t('a11y.buttons.edit')"
            @click="handleEdit"
          >
            {{ $t('common.edit') }}
          </UiButton>
        </div>
      </template>

      <div
        :class="[
          'flex flex-col gap-4',
          hasPictures ? 'lg:grid lg:grid-cols-3' : '',
        ]"
      >
        <UserProfilePersonalInfoPictures
          :user="user"
          :is-own-profile="isOwnProfile"
          @save="(data) => emit('save', data)"
        />

        <div :class="hasPictures ? 'col-span-2 lg:ml-8' : 'w-full'">
          <UserProfilePersonalInfoForm
            v-if="isEditMode"
            :user="user"
            :is-saving="isSaving"
            @save="handleSave"
            @cancel="handleCancel"
          />
          <UserProfilePersonalInfoView
            v-else
            :user="user"
            :is-own-profile="isOwnProfile"
          />
        </div>
      </div>
    </UiCard>
  </div>
</template>
