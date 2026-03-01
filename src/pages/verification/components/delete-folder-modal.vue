<script setup lang="ts">
import { ref } from 'vue';

import BaseConfirmActionModal from '@/components/base-confirm-action-modal.vue';
import { deleteFolderApi } from '@/composables/api/folders/delete.api';
import { toast } from '@/toast';
import { handleError } from '@/utils/api';

const confirmActionModalRef = ref();
const _id = ref();
const emit = defineEmits(['deleted']);

const toggleModal = (id: string) => {
  _id.value = id
  confirmActionModalRef.value.toggleModal();
};

const isDeleting = ref(false);
const onDelete = async (reason: string) => {
  // prevent calling twice use loading state
  if (isDeleting.value) return;
  isDeleting.value = true;

  try {
    await deleteFolderApi(_id.value as string, reason);
    toast(`Delete Document success`, { color: 'success' });
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
    title="Delete Folder"
    @success="onDelete"
  >
    <div>
      <p>Are you sure want to delete this folder?</p>
    </div>
  </base-confirm-action-modal>
</template>
