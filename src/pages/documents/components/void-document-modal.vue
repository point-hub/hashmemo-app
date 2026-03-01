<script setup lang="ts">
import { ref } from 'vue';

import BaseConfirmActionModal from '@/components/base-confirm-action-modal.vue';
import { toast } from '@/toast';
import { handleError } from '@/utils/api';
import { voidDocumentApi } from '@/composables/api/documents/void.api';

const confirmActionModalRef = ref();
const _id = ref();
const emit = defineEmits(['voided']);

interface IData {
  _id: string
}
const toggleModal = (data: IData) => {
  _id.value = data._id;
  confirmActionModalRef.value.toggleModal();
};

const isVoiding = ref(false);
const onVoid = async (reason: string) => {
  // prevent calling twice use loading state
  if (isVoiding.value) return;
  isVoiding.value = true;

  try {
    await voidDocumentApi(_id.value as string, reason);
    toast(`Void Document success`, { color: 'success' });
    emit('voided');
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
    isVoiding.value = false;
  }
};

defineExpose({
  toggleModal,
  isVoiding,
});
</script>

<template>
  <base-confirm-action-modal
    ref="confirmActionModalRef"
    title="Void Document"
    require-reason
    @success="onVoid"
  >
    <div>
      <p>
        By voiding this document, you are canceling all remaining signing activities.
        Recipients who have not yet signed will not be able to view or sign the enclosed documents.
      </p>
    </div>
  </base-confirm-action-modal>
</template>
