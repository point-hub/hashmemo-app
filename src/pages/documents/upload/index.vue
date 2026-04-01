<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { createDocumentApi } from '@/composables/api/documents/create.api';
import router from '@/router';
import { toast } from '@/toast';
import { apiRequest, handleError } from '@/utils/api';

import CardBreadcrumbs from './card-breadcrumbs.vue';
import CardAssign from './card-assign.vue';
import CardForm from './card-form.vue';
import CardDocument from './card-document.vue';
import { useForm } from './form';
import type { IPdfFile } from '@/types/pdf-signer';
import { getFoldersApi } from '@/composables/api/folders/get.api';

const form = useForm();
const pdfFile = ref<IPdfFile>();
const signaturesJson = ref();

const isSaving = ref(false);

const uploadPdf = async () => {
  if (!pdfFile.value?.file) return;

  const file = pdfFile.value.file;

  const presign = await apiRequest.post('/v1/storages/presign-upload', {
    type: file.type,
    size: file.size,
    ext: 'pdf',
    hash: pdfFile.value.hash,
  });

  const { upload_url, public_domain, public_path } = presign.data;

  await fetch(upload_url, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  });

  return `${public_domain}${public_path}`;
};

const save = async () => {
  try {
    isSaving.value = true;

    const fileUrl = await uploadPdf();
    
    if (fileUrl) {
      form.data.pdf_url = fileUrl;
    }

    const response = await createDocumentApi({
      ...form.data,
      name: pdfFile.value?.name,
      hash: pdfFile.value?.hash,
      signatures: signaturesJson.value ? JSON.parse(signaturesJson.value) : []
    });
    if (response?.inserted_id) {
      toast('Create success', { color: 'success' });
      await router.push(`/documents`);
    }
  } catch (error) {
    console.log(error)
    const errorResponse = handleError(error);
    if (errorResponse.errors) {
      form.errors = errorResponse.errors as typeof form.errors;
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

const step = ref(1)
const onNext = () => {
  if (step.value === 1 && !pdfFile.value?.name) {
    toast("please upload pdf document", {
      color: 'danger',
    });
    return
  }
  
  if (step.value === 2 && form.data.approvals?.length === 0) {
    toast("please assign user approvals", {
      color: 'danger',
    });
    return
  }

  if (step.value === 2 && form.data.approvals?.some(a => !a.user_id || !a.role)) {
    toast("Please assign valid user approvals (user and role required)", {
      color: "danger",
    });

    return
  }
  step.value+= 1
}

const folders = ref()
onMounted(async () => {
  folders.value = (await getFoldersApi()).data
  form.data.folder_id = folders.value[0]._id
})
</script>

<template>
  <div class="content-container">
    <card-breadcrumbs />

    <div v-if="step === 1" class="flex flex-col gap-2">
      <card-document v-model:data="form.data" v-model:pdfFile="pdfFile" v-model:errors="form.errors" v-model:is-saving="isSaving" />

      <div class="flex gap-2">
        <base-button class="flex-1" :is-loading="isSaving" color="primary" @click="onNext">Next</base-button>
      </div>
    </div>
    <div v-if="step === 2" class="flex flex-col gap-2">
      <card-form v-model:data="form.data" v-model:errors="form.errors" v-model:is-saving="isSaving" />

      <div class="flex gap-2">
        <base-button class="flex-1" :is-loading="isSaving" color="primary" @click="onNext">Next</base-button>
      </div>
    </div>
    <div v-if="step === 3" class="flex flex-col gap-2">
      <base-card>
        <div class="flex gap-2">
          <base-button class="px-4!" :is-loading="isSaving" color="primary" @click="save">Send</base-button>
        </div>
      </base-card>
      
      <card-assign v-model:data="form.data" v-model:pdfFile="pdfFile" v-model:signaturesJson="signaturesJson" v-model:errors="form.errors" v-model:is-saving="isSaving" />
    </div>
  </div>
</template>
