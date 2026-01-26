<script setup lang="ts">
import { type IForm } from './form';

const data = defineModel<IForm>('data', {
  default: () => ({
    username: '',
  }),
});
</script>

<template>
  <base-card title="User Information">
    <div class="flex flex-col gap-2">
      <base-input v-model="data.username" label="Username" :disabled="true" />
    </div>
  </base-card>
</template>

<style scoped lang="postcss"></style>
