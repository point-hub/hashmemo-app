<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import AppContainer from '@/components/app-container.vue';
import { findDocumentApi } from '@/composables/api/documents/find-by-id.api';
import { toast } from '@/toast';
import { handleError } from '@/utils/api';

import { useForm, type IForm } from './form';
import type { IPdfFile, ISignature, ISignatureState, IUser } from '@/types/pdf-signer';

import { getStoragesApi } from '@/composables/api/storages/get.api';
import { getActivitiesApi } from '@/composables/api/activities/get.api';
import { formatDate } from '@/utils/date';

const route = useRoute();
const form = useForm();

const isLoading = ref(false);
const activities = ref()
onMounted(async () => {
  try {
    isLoading.value = true;
    activities.value = (await getActivitiesApi({
      search: {
        file_id: route.params.id
      }
    })).data;
    const response = await findDocumentApi(route.params.id as string);
    if (response) {
      form.data._id = response._id;
      form.data.name = response.name;
      form.data.hash = response.hash;
      form.data.certificate_id = response.certificate_id;
      form.data.pdf_url = response.pdf_url;
      form.data.created_by = response.created_by;
      form.data.signatures = response.signatures as unknown as ISignature[];

      signaturesJson.value = JSON.stringify(response.signatures)
      state.value.signatures = JSON.stringify(response.signatures) as unknown as ISignature[]
      
      await handleUploadFromUrl(response.pdf_url!)
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
</script>

<template>
  <app-container :is-loading="isLoading">
    <base-card v-if="!form.data._id">
      Data Not Found
    </base-card>
    <template v-else>
      <base-card title="Document Information">
        <base-table>
          <tbody>
            <tr>
              <td>Document</td>
              <td>{{ form.data.name }}</td>
            </tr>
            <tr>
              <td>Owner</td>
              <td>{{ form.data.created_by?.name }}</td>
            </tr>
          </tbody>
        </base-table>
      </base-card>
      <base-card title="History">
        <base-table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Activity</th>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="activity in activities">
              <td>{{ formatDate(activity.created_at) }}</td>
              <td>{{ activity.action }}</td>
              <td>{{ activity.name }}</td>
            </tr>
          </tbody>
        </base-table>
      </base-card>
    </template>
  </app-container>
</template>
