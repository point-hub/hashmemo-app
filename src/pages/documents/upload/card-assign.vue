<script setup lang="ts">
import { type IForm } from './form';
import { ref } from 'vue';

import type { IPdfFile, ISignatureState, IUser } from '@/types/pdf-signer';
import pdfSignerPanel from '../components/pdf-signer-panel.vue';
import PdfSignerViewer from '../components/pdf-signer-viewer.vue';

const data = defineModel<IForm>('data', {
  default: () => ({
    approvals: [],
  }),
});

// Users
const users: IUser[] = [];

// Reactive state
const pdfFile = defineModel<IPdfFile>('pdfFile');
const signaturesJson = defineModel<string>('signaturesJson');
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
  a.download = pdfResult.name ?? 'signed.pdf';
  document.body.appendChild(a);
  a.click();

  // Cleanup
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const onSigned = () => {
  // Save current state to database
};

const onSave = async () => {

}
</script>

<template>
  <base-card title="Assign Signer to Document">
    <div class="overflow-auto flex gap-4 h-full p-4">
      <!-- PDF Viewer -->
      <div class="w-[210mm]! h-[297mm]! max-h-screen overflow-auto shadow">
        <pdf-signer-viewer
          class="shadow"
          v-model="state"
          v-model:signaturesJson="signaturesJson"
          :pdf-file="pdfFile"
          :users="data.approvals"
          :current-user="state.currentUser"
          :dragging-user="draggingUser"
          @signature:signed="onSigned"
          @pdf:export="exporting"
        />
      </div>

      <div class="lg:max-w-80 lg:min-w-80 flex flex-col h-full">
        <h1 class="font-bold">Signer</h1>
        <pdf-signer-panel
          :users="data.approvals!"
          @user:dragstart="handleUserDragStart"
        />
        <!-- <base-button class="flex-1 mt-4" color="primary" @click="onSave">Save</base-button> -->
      </div>
    </div>
  </base-card>
</template>

<style scoped lang="postcss"></style>
