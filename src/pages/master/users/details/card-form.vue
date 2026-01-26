<script setup lang="ts">
import { type IForm } from './form';

const data = defineModel<IForm>('data', {
  default: () => ({
    name: '',
    username: '',
    initial_name: '',
    nik: '',
    birthdate: '',
  }),
});
</script>

<template>
  <base-card title="User Information">
    <div class="flex flex-col gap-2">
      <base-input v-model="data.name" label="Name" :disabled="true" />
      <base-input v-model="data.username" label="Username" :disabled="true" />
      <base-input v-model="data.initial_name" label="Initial Name" :disabled="true" />
      <base-input v-model="data.nik" label="NIK" :disabled="true" />
      <base-input v-model="data.birthdate" label="Birthdate" :disabled="true" />
    </div>
  </base-card>
</template>

<style scoped lang="postcss"></style>
