<script setup lang="ts">
import { ref, watch } from 'vue';

import { apiRequest } from '@/utils/api';

import { type IForm, type IFormError } from './form';

const data = defineModel<IForm>('data', {
  default: () => ({
    name: '',
    nik: '',
    birthdate: '',
    initial_name: '',
    photo_id_url: '',
  }),
});
const errors = defineModel<IFormError>('errors', {
  default: () => ({
    name: [],
    nik: [],
    birthdate: [],
    initial_name: [],
    photo_id_url: [],
  }),
});
const isSaving = defineModel('is-saving', { default: false });

const files = ref();
const uploadedImage = ref();
const onFileSelect = (e: Event) => handleFileChange((e.target as HTMLInputElement).files?.[0] || null);
const handleFileChange = (file: File | null) => {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async (event) => {
    uploadedImage.value = event.target?.result as string;
    await onUpload();
  };
  reader.readAsDataURL(file);
};

function getExtensionFromBlob(blob: Blob): string {
  const mimeToExt: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };
  return mimeToExt[blob.type] || '';
}

function base64ToBlob(base64: string): Blob {
  const [meta, data] = base64.split(',');
  const mime = meta!.match(/data:(.*?);/)?.[1] || '';
  const binary = atob(data!);
  const array = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }

  return new Blob([array], { type: mime });
}

const uploadedBlob = ref();

const onUpload = async () => {
  uploadedBlob.value = base64ToBlob(uploadedImage.value);

  const response = await apiRequest.post('/v1/storages/presign-upload', {
    type: uploadedBlob.value.type,
    size: uploadedBlob.value.size,
    ext: getExtensionFromBlob(uploadedBlob.value),
  });

  data.value.photo_id_url = `${response.data.public_domain}${response.data.public_path}`;

  await fetch(response.data.upload_url, {
    method: 'PUT',
    body: uploadedBlob.value,
    headers: {
      'Content-Type': uploadedBlob.value.type,
    },
  });
};


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
      <base-input required v-model="data.initial_name" label="Initial Name" :errors="errors.initial_name" disabled :helpers="['to be displayed in document as your signature']" maxlength="3" />
      <base-file-upload required v-model="data.photo_id_url" :errors="errors.photo_id_url" label="Upload ID/Passport" layout="h" accept="image/*" @change="onFileSelect">
        <template v-slot="{ fileRef }">
          <div class="flex flex-col w-full gap-2">
            <div class="border border-solid w-full border-slate-300 py-1 px-2">
              <base-button size="sm" @click="fileRef.click()">
                <base-icon icon="i-fa7-regular:arrow-up-from-bracket" /> Choose File
              </base-button>
              <base-icon v-if="files" icon="i-fa7-regular:xmark" class="ml-2 btn" @click="() => (files = null)" />
            </div>
            <img :src="uploadedImage" alt="">
          </div>
        </template>
      </base-file-upload>
      <img :src="data.photo_id_url" alt="">
    </div>
  </base-card>
</template>

<style scoped lang="postcss"></style>
