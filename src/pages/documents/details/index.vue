<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import AppContainer from '@/components/app-container.vue';
import { findDocumentApi } from '@/composables/api/documents/find-by-id.api';
import { toast } from '@/toast';
import { handleError } from '@/utils/api';

import CardBreadcrumbs from './card-breadcrumbs.vue';
import { useForm, type IForm } from './form';
import type { IPdfFile, ISignature, ISignatureState, IUser } from '@/types/pdf-signer';
import PdfSignerViewer from '../components/pdf-signer-viewer.vue';
import { getStoragesApi } from '@/composables/api/storages/get.api';

const route = useRoute();
const form = useForm();

const isLoading = ref(false);

onMounted(async () => {
  try {
    isLoading.value = true;
    const response = await findDocumentApi(route.params.id as string);
    if (response) {
      form.data._id = response._id;
      form.data.name = response.name;
      form.data.hash = response.hash;
      form.data.certificate_id = response.certificate_id;
      form.data.pdf_url = response.pdf_url;
      form.data.status = response.status;

      signaturesJson.value = JSON.stringify(response.signatures)
      state.value.signatures = JSON.stringify(response.signatures) as unknown as ISignature[]
      console.log(response.pdf_url)
      await handleUploadFromUrl(response.pdf_url!)
      await nextTick();
      previewUrl.value = await pdfViewerRef.value?.previewPdf(true);
    }
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

const data = defineModel<IForm>('data', {
  default: () => ({
    approvals: [],
  }),
});

// Users
const users: IUser[] = [];

// Reactive state
const pdfFile = ref();
const signaturesJson = ref();
const draggingUser = ref<IUser | null>(null);
const state = ref<ISignatureState>({
  signatures: [],
  activeSignature: null,
  currentUser: users[0]!,
  pageSize: { width: 0, height: 0 },
});

// Handle user drag from panel
const handleUserDragStart = (user: IUser) => {
  draggingUser.value = user;
};

const exporting = (pdfResult: IPdfFile) => {
  const bytes =
    pdfResult.bytes instanceof Uint8Array
      ? pdfResult.bytes
      : new Uint8Array(pdfResult.bytes!);

  // Create PDF blob
  const blob = new Blob([bytes as never], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);

  // Trigger download
  const a = document.createElement('a');
  a.href = url;
  a.download = form.data.name!;
  document.body.appendChild(a);
  a.click();

  // Cleanup
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const onSigned = () => {
  // Save current state to database
};

const hashFile = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const handleUploadFromUrl = async (url: string) => {
  if (!url) return;

  try {
    const blob = await getStoragesApi({ url }) as unknown as Blob;

    if (blob.type !== 'application/pdf') {
      throw new Error('File is not a PDF');
    }

    // Convert Blob → File
    const file = new File([blob], 'document.pdf', {
      type: 'application/pdf',
    });

    // Convert Blob → Uint8Array
    const bytes = new Uint8Array(await blob.arrayBuffer());

    // Hash file
    const fileHash = await hashFile(file);

    pdfFile.value = {
      file,
      bytes,
      name: file.name,
      hash: fileHash,
    };

  } catch (err) {
    console.error(err);
  }
};

const pdfViewerRef = ref();
const previewUrl = ref();
const handleExport = async () => {
  await pdfViewerRef.value?.exportPdf();
};
const handleExportWithCertificate = async () => {
  await pdfViewerRef.value?.exportPdf(true);
};
const handlePreviewWithCertificate = async () => {
  previewUrl.value = await pdfViewerRef.value?.previewPdf(true);
};
const handlePreview = async () => {
  if (form.data.status === 'signed') {
    previewUrl.value = await pdfViewerRef.value?.previewPdf(true);
  } else {
    previewUrl.value = await pdfViewerRef.value?.previewPdf(false);
  }
};

watch(pdfFile, async (file) => {
  if (!file) return;

  await nextTick();

  if (pdfViewerRef.value) {
    previewUrl.value = await pdfViewerRef.value.previewPdf(true);
  }
});

const iframeSrc = ref<string | null>(null);

watch(previewUrl, async (url) => {
  if (!url) {
    iframeSrc.value = null;
    return;
  }

  try {
    // fetch the blob from blob URL
    const response = await fetch(url);
    const blob = await response.blob();

    // convert to base64
    const reader = new FileReader();

    reader.onloadend = () => {
      iframeSrc.value = reader.result as string;
    };

    reader.readAsDataURL(blob);
  } catch (err) {
    console.error('Failed to convert blob to base64:', err);
    iframeSrc.value = null;
  }
});
</script>

<template>
  <app-container :is-loading="isLoading">
    <card-breadcrumbs />

    <base-card>
      <div class="flex gap-2 justify-between">
        <div class="flex gap-2">
          <router-link :to="`/documents/${route.params.id}`">
            <base-button variant="filled" color="info">
              Preview
            </base-button>
          </router-link>
          <!-- <base-button v-if="form.data.status === 'signed'" variant="filled" color="primary" @click="handlePreviewWithCertificate">Preview</base-button>
          <base-button v-else variant="filled" color="primary" @click="handlePreview">Preview</base-button> -->
          <router-link :to="`/documents/${route.params.id}/history`">
            <base-button variant="filled" color="primary">
              History
            </base-button>
          </router-link>
        </div>
        <div class="flex gap-2">
          <base-button v-if="form.data.status === 'signed'" variant="filled" color="primary" @click="handleExportWithCertificate">Download</base-button>
        </div>
      </div>
    </base-card>

    <base-card v-if="!form.data._id">
      Data Not Found
    </base-card>
    <template v-else>
      <iframe
        v-if="iframeSrc"
        :src="iframeSrc"
        class="w-full h-[800px] border"
      />
      <pdf-signer-viewer
        ref="pdfViewerRef"
        class="shadow hidden"
        v-model="state"
        v-model:signaturesJson="signaturesJson"
        :hash="form.data.hash"
        :certId="form.data.certificate_id"
        :pdf-file="pdfFile"
        :users="form.data.approvals"
        :current-user="state.currentUser"
        :dragging-user="draggingUser"
        :preview="true"
        :status="form.data.status"
        @signature:signed="onSigned"
        @pdf:export="exporting"
        @viewer:ready="handlePreview"
      />
    </template>
  </app-container>
</template>
