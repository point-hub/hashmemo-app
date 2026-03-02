<script setup lang="ts">
import { ref } from 'vue';

import BaseConfirmActionModal from '@/components/base-confirm-action-modal.vue';
import { toast } from '@/toast';
import { handleError } from '@/utils/api';
import { updateFolderApi } from '@/composables/api/folders/update.api';

const confirmActionModalRef = ref();
const emit = defineEmits(['renamed']);

const _id = ref();
const name = ref();
const toggleModal = (filter: { _id: string }, data: { name: string }) => {
  _id.value = filter._id
  name.value = data.name
  confirmActionModalRef.value.toggleModal();
};

const isSaving = ref(false);
const onSaving = async () => {
  // prevent calling twice use loading state
  if (isSaving.value) return;
  isSaving.value = true;

  try {
    await updateFolderApi(_id.value, {
      name: name.value
    });
    toast(`Update Folder success`, { color: 'success' });
    emit('renamed');
    name.value = ''
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
    isSaving.value = false;
  }
};

defineExpose({
  toggleModal,
  isSaving,
});
</script>

<template>
  <base-confirm-action-modal
    ref="confirmActionModalRef"
    title="Rename Folder"
    @success="onSaving"
  >
    <div>
      <base-input v-model="name" autofocus />
    </div>
  </base-confirm-action-modal>
</template>
