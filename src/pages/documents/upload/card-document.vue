<script setup lang="ts">
import { ref } from 'vue';
import { type IForm, type IFormError } from './form';
import type { IPdfFile } from '@/types/pdf-signer';

const pdfFile = defineModel<IPdfFile>('pdfFile');
const data = defineModel<IForm>('data', {
  default: () => ({
    pdf_url: undefined,
  }),
});
const errors = defineModel<IFormError>('errors', {
  default: () => ({
    pdf_url: [],
  }),
});

const isUploading = ref(false);

const hashFile = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const handleUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement)?.files?.[0];
  if (!file) return;

  if (file.type !== 'application/pdf') {
    return;
  }

  isUploading.value = true;
  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const fileHash = await hashFile(file);
    pdfFile.value = {
      file: file,
      bytes: bytes,
      name: file.name,
      hash: fileHash,
    }
  } catch (err) {
    console.error(err);
  } finally {
    isUploading.value = false;
  }
};

const isSaving = defineModel('is-saving', { default: false });
</script>

<template>
  <base-card title="Upload Document">
    <div class="flex flex-col gap-4">
      <base-file-upload
        v-model="data.pdf_url"
        :errors="errors.pdf_url"
        layout="vertical"
        accept="application/pdf"
        @change="handleUpload"
      >
        <template v-slot="{ fileRef }">
          <div class="flex flex-col w-full gap-2">
            <div class="border border-solid w-full border-slate-300 flex flex-col justify-center">
              <base-button size="sm" @click="fileRef.click()" class="py-10! flex flex-col">
                <base-icon icon="i-fa7-regular:arrow-up-from-bracket" /> Choose File
                <p v-if="pdfFile?.name" class="text-sm text-gray-600 text-center">
                  {{ pdfFile.name }}
                </p>
              </base-button>

              <base-icon
                v-if="data.pdf_url"
                icon="i-fa7-regular:xmark"
                class="ml-2 btn"
                @click="data.pdf_url = undefined"
              />
            </div>
          </div>
        </template>
      </base-file-upload>
    </div>
  </base-card>
</template>

<style scoped lang="postcss"></style>
