<script setup lang="ts">
import { ref } from 'vue';

import BaseConfirmActionModal from '@/components/base-confirm-action-modal.vue';
import { toast } from '@/toast';
import { handleError } from '@/utils/api';
import { signDocumentApi } from '@/composables/api/documents/sign.api';

const confirmActionModalRef = ref();
const _id = ref();
const label = ref();
const otp = ref();
const emit = defineEmits(['signed']);

interface IData {
  _id: string
  label: string
}
const toggleModal = (data: IData) => {
  _id.value = data._id;
  label.value = data.label;
  otp.value = '';
  confirmActionModalRef.value.toggleModal();
};

const isSigning = ref(false);
const onSign = async (reason: string) => {
  // prevent calling twice use loading state
  if (isSigning.value) return;
  isSigning.value = true;

  try {
    await signDocumentApi(_id.value as string, {
      otp: otp.value
    });
    toast(`Sign Document success`, { color: 'success' });
    emit('signed');
  } catch (error) {
    const errorResponse = handleError(error);
    if (errorResponse.message) {
      toast(errorResponse.message, {
        lists: errorResponse.lists,
        color: 'danger',
      });
    }
  } finally {
    // stop loading state
    isSigning.value = false;
  }
};

defineExpose({
  toggleModal,
  isSigning,
});
</script>

<template>
  <base-confirm-action-modal
    ref="confirmActionModalRef"
    title="Sign Document"
    @success="onSign"
  >
    <div>
      <p>Please enter the OTP code to sign this document.</p>
      <p>OTP serves to ensure that the person signing is really you.</p>
      <br />
      <base-input v-model="otp" autofocus />
    </div>
  </base-confirm-action-modal>
</template>
