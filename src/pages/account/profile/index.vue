<script setup lang="ts">
import { onMounted, ref } from 'vue';

import AppContainer from '@/components/app-container.vue';
import PasswordConfirmationModal from '@/components/password-confirmation-modal/index.vue';
import { findUserApi } from '@/composables/api/master/users/find-by-id.api';
import { updateUserApi } from '@/composables/api/master/users/update.api';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from '@/toast';
import { handleError } from '@/utils/api';

import CardBreadcrumbs from './card-breadcrumbs.vue';
import CardForm from './card-form.vue';
import { useForm } from './form';

const form = useForm();

const isSaving = ref(false);
const isLoading = ref(false);
const selectedRole = ref();
const authStore = useAuthStore();

onMounted(async () => {
  try {
    isLoading.value = true;
    const response = await findUserApi(authStore.authUser?._id as string);
    form.data.name = response.name;
    form.data.nik = response.nik;
    form.data.birthdate = response.birthdate;
    form.data.initial_name = response.initial_name;
    form.data.photo_id_url = response.photo_id_url;

    selectedRole.value = {
      label: `[${response.role.code}] ${response.role.name}`,
      value: response.role._id,
    };
  } catch (error) {
    const errorResponse = handleError(error);
    if (errorResponse.message) {
      toast(errorResponse.message, {
        lists: errorResponse.lists,
        color: 'danger',
      });
    }
  } finally {
    isLoading.value = false;
  }
});

const onSave = async () => {
  try {
    isSaving.value = true;
    await updateUserApi(authStore.authUser?._id as string, form.data);
    toast('Update success', { color: 'success' });
  } catch (error) {
    const errorResponse = handleError(error);
    if (errorResponse.errors) {
      form.errors.name = errorResponse.errors.name || [];
      form.errors.initial_name = errorResponse.errors.initial_name || [];
      form.errors.birthdate = errorResponse.errors.birthdate || [];
      form.errors.nik = errorResponse.errors.nik || [];
      form.errors.photo_id_url = errorResponse.errors.photo_id_url || [];
    }
    if (errorResponse.message) {
      toast(errorResponse.message, {
        lists: errorResponse.lists,
        color: 'danger',
      });
    }
  } finally {
    isSaving.value = false;
  }
};

const onSubmit = () => {
  passwordConfirmationModalRef.value.toggleModal();
};

const passwordConfirmationModalRef = ref();
const onPasswordConfirmed = async () => {
  await onSave();
};
</script>

<template>
  <password-confirmation-modal ref="passwordConfirmationModalRef" @confirmed="onPasswordConfirmed" />
  <app-container :is-loading="isLoading">
    <card-breadcrumbs />
    <card-form v-model:data="form.data" v-model:errors="form.errors" v-model:is-saving="isSaving" />
    <div class="flex gap-2">
      <base-button class="flex-1" :is-loading="isSaving" color="primary" @click="onSubmit">Save</base-button>
    </div>
  </app-container>
</template>
