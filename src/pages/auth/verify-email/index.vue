<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { verifyEmailApi } from '@/composables/api/master/auth/verify-email.api';
import { getUsersApi } from '@/composables/api/master/users/get.api';
import { toast } from '@/toast';
import { apiRequest, handleError } from '@/utils/api';

import { useForm } from './form';
import { usePassword } from './password';

const route = useRoute();
const router = useRouter();

const form = useForm();

form.data.value.code = route.query.code?.toString() ?? '';

const getUsers = async () => {
  const response = await getUsersApi({
    search: {
      'email_verification.code': form.data.value.code,
    },
  });

  if (!response.data[0]) {
    return;
  }

  form.data.value.username = response.data[0].username;
  form.data.value.email = response.data[0].email;
};

onMounted(async () => {
  await getUsers();
});

const onSubmit = async () => {
  isSaving.value = true;
  try {
    if ((form.errors.value.password?.length ?? 0) > 0) {
      return toast('Please use a strong password', { color: 'danger' });
    }

    if (!form.isPasswordConfirmed) {
      return toast('Password confirmation does not match', { color: 'danger' });
    }

    const response = await verifyEmailApi(form.data.value);
    if (response) {
      form.reset();
      router.push(`/verify-photo?code=${response.photo_code}`);
    }
  } catch (error) {
    const errorResponse = handleError(error);
    if (errorResponse.errors) {
      form.errors.value.code = errorResponse.errors.code || [];
      form.errors.value.username = errorResponse.errors.username || [];
      form.errors.value.email = errorResponse.errors.email || [];
      form.errors.value.name = errorResponse.errors.name || [];
      form.errors.value.initial_name = errorResponse.errors.initial_name || [];
      form.errors.value.nik = errorResponse.errors.nik || [];
      form.errors.value.birthdate = errorResponse.errors.birthdate || [];
      form.errors.value.photo_id_url = errorResponse.errors.photo_id_url || [];
      form.errors.value.password = errorResponse.errors.password || [];
      form.errors.value.password_confirmation = errorResponse.errors.password_confirmation || [];
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

  form.data.value.photo_id_url = `${response.data.public_domain}${response.data.public_path}`;

  await fetch(response.data.upload_url, {
    method: 'PUT',
    body: uploadedBlob.value,
    headers: {
      'Content-Type': uploadedBlob.value.type,
    },
  });
};

const isSaving = ref(false);
const { type, toggle } = usePassword();

watch(() => form.data.value.initial_name, () => {
  form.data.value.initial_name = form.data.value.initial_name.toUpperCase();
});

import { watchDebounced } from '@vueuse/core';
watchDebounced(() => (form.data.value.code), async () => {
  await getUsers();
}, { debounce: 500, maxWait: 1000 });

</script>

<template>
  <base-card class="max-w-xl">
    <form @submit.prevent="onSubmit" class="flex flex-col gap-8">
      <div class="flex flex-col gap-8">
        <base-input required v-model="form.data.value.code" :errors="form.errors.value.code" label="Code" layout="vertical" />
        <div class="flex flex-col gap-1" v-if="form.data.value.username">
          <base-input required readonly v-model="form.data.value.username" :errors="form.errors.value.username" label="Username" layout="vertical" />
          <base-input required readonly v-model="form.data.value.email" :errors="form.errors.value.email" label="Email" layout="vertical" />
          <base-input required v-model="form.data.value.name" :errors="form.errors.value.name" label="Full Name" layout="vertical" />
          <base-datepicker required v-model="form.data.value.birthdate" :errors="form.errors.value.birthdate" label="Birthdate" layout="vertical" />
          <base-input required v-model="form.data.value.nik" :errors="form.errors.value.nik" label="NIK" layout="vertical" />
          <base-file-upload required v-model="form.data.value.photo_id_url" :errors="form.errors.value.photo_id_url" label="Upload ID/Passport" layout="vertical" accept="image/*" @change="onFileSelect">
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
          <base-input required v-model="form.data.value.initial_name" :errors="form.errors.value.initial_name" label="Initial Name" layout="vertical" :helpers="['to be displayed in document as your signature']" placeholder="max 3 digit" maxlength="3" />
          <base-input
            layout="vertical"
            label="Password"
            required
            v-model="form.data.value.password"
            :errors="form.errors.value.password"
            @keyup="form.validatePassword()"
            :disabled="isSaving"
            :type="type"
            :reset-errors-on-update="false"
          >
            <template #suffix>
              <button @click="toggle" type="button" variant="text" color="secondary">
                <base-icon icon="i-fa7-regular-eye" />
              </button>
            </template>
          </base-input>
          <base-input
            layout="vertical"
            label="Password Confirmation"
            required
            v-model="form.data.value.password_confirmation"
            :errors="form.errors.value.password_confirmation"
            @keyup="form.validateConfirmationPassword()"
            :disabled="isSaving"
            :type="type"
            :reset-errors-on-update="false"
          >
            <template #suffix>
              <button @click="toggle" type="button" variant="text" color="secondary">
                <base-icon icon="i-fa7-regular-eye" />
              </button>
            </template>
          </base-input>
        </div>
        <base-button type="submit" color="primary">Confirm</base-button>
      </div>
    </form>
  </base-card>
</template>
