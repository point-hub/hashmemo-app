<script setup lang="ts">
import { ref } from 'vue';
import { type IForm, type IFormError } from './form';
import { apiRequest, handleError } from '@/utils/api';

const data = defineModel<IForm>('data', {
  default: () => ({
    pdf_url: undefined,
    name: undefined,
    composite_unique_1: undefined,
    composite_unique_2: undefined,
    age: undefined,
    gender: undefined,
    optional_unique: undefined,
    notes: undefined,
  }),
});
const errors = defineModel<IFormError>('errors', {
  default: () => ({
    pdf_url: [],
    name: [],
    composite_unique_1: [],
    composite_unique_2: [],
    age: [],
    gender: [],
    optional_unique: [],
    notes: [],
  }),
});

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

  data.value.pdf_url = ``;

  await fetch(response.data.upload_url, {
    method: 'PUT',
    body: uploadedBlob.value,
    headers: {
      'Content-Type': uploadedBlob.value.type,
    },
  });
};

const isSaving = defineModel('is-saving', { default: false });
</script>

<template>
  <base-card title="Upload Document">
    <div class="flex flex-col gap-4">
      <base-file-upload v-model="data.pdf_url" :errors="errors.pdf_url" layout="vertical" accept="application/pdf" @change="onFileSelect">
        <template v-slot="{ fileRef }">
          <div class="flex flex-col w-full gap-2">
            <div class="border border-solid w-full border-slate-300 py-6 px-2 flex flex-col justify-center">
              <base-button size="sm" @click="fileRef.click()">
                <base-icon icon="i-fa7-regular:arrow-up-from-bracket" /> Choose File
              </base-button>
              <base-icon v-if="files" icon="i-fa7-regular:xmark" class="ml-2 btn" @click="() => (files = null)" />
            </div>
            <img :src="uploadedImage" alt="">
          </div>
        </template>
      </base-file-upload>
    </div>
  </base-card>
</template>

<style scoped lang="postcss"></style>
