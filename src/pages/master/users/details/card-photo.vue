<script setup lang="ts">
import { type IForm } from './form';

const data = defineModel<IForm>('data', {
  default: () => ({
    photo_id_url: '',
    photo_url: '',
  }),
});
</script>

<template>
  <base-card title="User Media">
    <div class="flex gap-2">
      <div class="flex flex-col min-w-48">
        <p class="p-2 bg-slate-100 font-bold">Photo</p>
        <a v-if="data.photo_url" :href="data.photo_url" target="_blank">
          <img :src="data.photo_url" alt="Photo" class="shadow max-h-48">
        </a>
        <div v-else class="h-48 bg-slate-200 flex items-center justify-center">
          Not Verified
        </div>
      </div>
      <div class="flex flex-col min-w-48">
        <p class="p-2 bg-slate-100 font-bold">Photo ID / Passport</p>
        <a v-if="data.photo_id_url" :href="data.photo_id_url" target="_blank">
          <img :src="data.photo_id_url" alt="Photo ID" class="shadow max-h-48">
        </a>
        <div v-else class="h-48 bg-slate-200 flex items-center justify-center">
          Not Verified
        </div>
      </div>
    </div>
  </base-card>
</template>

<style scoped lang="postcss"></style>
