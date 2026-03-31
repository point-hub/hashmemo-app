<script setup lang="ts">
import { ref } from 'vue';

import BaseConfirmActionModal from '@/components/base-confirm-action-modal.vue';
import { toast } from '@/toast';
import { handleError } from '@/utils/api';
import { rejectDocumentApi } from '@/composables/api/documents/reject.api';

const confirmActionModalRef = ref();
const _id = ref();
const label = ref();
const emit = defineEmits(['rejected']);

interface IData {
  _id: string
  label: string
}
const toggleModal = (data: IData) => {
  _id.value= data._id;
  label.value= data.label;
  confirmActionModalRef.value.toggleModal();
};

const isRejecting = ref(false);
const onReject = async (reason: string) => {
  // prevent calling twice use loading state
  if (isRejecting.value) return;
  isRejecting.value = true;

  try {
    await rejectDocumentApi(_id.value as string, reason);
    toast(`Reject Document success`, { color: 'success' });
    emit('rejected');
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
    isRejecting.value = false;
  }
};

defineExpose({
  toggleModal,
  isRejecting,
});
</script>

<template>
  <base-confirm-action-modal
    ref="confirmActionModalRef"
    title="Reject Document"
    require-reason
    @success="onReject"
  >
  </base-confirm-action-modal>
</template>
