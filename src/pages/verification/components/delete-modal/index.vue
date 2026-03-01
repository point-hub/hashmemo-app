<script setup lang="ts">
import { ref } from 'vue';

import BaseConfirmActionModal from '@/components/base-confirm-action-modal.vue';
import { deleteDocumentApi } from '@/composables/api/documents/delete.api';
import { toast } from '@/toast';
import { handleError } from '@/utils/api';

const confirmActionModalRef = ref();
const _id = ref();
const label = ref();
const emit = defineEmits(['deleted']);

interface IData {
  _id: string
  label: string
}
const toggleModal = (data: IData) => {
  _id.value= data._id;
  label.value= data.label;
  confirmActionModalRef.value.toggleModal();
};

const isDeleting = ref(false);
const onDelete = async (reason: string) => {
  // prevent calling twice use loading state
  if (isDeleting.value) return;
  isDeleting.value = true;

  try {
    await deleteDocumentApi(_id.value as string, reason);
    toast(`Delete Document "${label.value}" success`, { color: 'success' });
    emit('deleted');
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
    isDeleting.value = false;
  }
};

defineExpose({
  toggleModal,
  isDeleting,
});
</script>

<template>
  <base-confirm-action-modal
    ref="confirmActionModalRef"
    title="Delete Document"
    require-password
    require-reason
    @success="onDelete"
  >
    <div>
      <p>Are you sure want to delete "<b>{{ label }}</b>"?</p>
      <p>You won’t be able to undo it.</p>
    </div>
  </base-confirm-action-modal>
</template>
