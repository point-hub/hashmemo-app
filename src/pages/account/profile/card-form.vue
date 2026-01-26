<script setup lang="ts">
import { watch } from 'vue';

import { type IForm, type IFormError } from './form';

const data = defineModel<IForm>('data', {
  default: () => ({
    name: '',
    nik: '',
    birthdate: '',
    initial_name: '',
  }),
});
const errors = defineModel<IFormError>('errors', {
  default: () => ({
    name: [],
    nik: [],
    birthdate: [],
    initial_name: [],
  }),
});
const isSaving = defineModel('is-saving', { default: false });

watch(() => data.value.initial_name, () => {
  data.value.initial_name = data.value.initial_name.toUpperCase();
});
</script>

<template>
  <base-card title="User Information">
    <div class="flex flex-col gap-2">
      <base-input required v-model="data.name" label="Name" :errors="errors.name" :disabled="isSaving" />
      <base-input required v-model="data.nik" label="NIK" :errors="errors.nik" :disabled="isSaving" />
      <base-datepicker required v-model="data.birthdate" label="Birthdate" :errors="errors.birthdate" :disabled="isSaving" />
      <base-input required v-model="data.initial_name" label="Initial Name" :errors="errors.initial_name" :disabled="isSaving" :helpers="['to be displayed in document as your signature']" maxlength="3" />
    </div>
  </base-card>
</template>

<style scoped lang="postcss"></style>
