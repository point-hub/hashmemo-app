<script setup lang="ts">
import { ref } from 'vue';

import BaseConfirmActionModal from '@/components/base-confirm-action-modal.vue';
import { toast } from '@/toast';
import { handleError } from '@/utils/api';
import { createFolderApi } from '@/composables/api/folders/create.api';

const confirmActionModalRef = ref();
const emit = defineEmits(['added']);

const toggleModal = () => {
  confirmActionModalRef.value.toggleModal();
};

const name = ref();
const isSaving = ref(false);
const onSaving = async () => {
  // prevent calling twice use loading state
  if (isSaving.value) return;
  isSaving.value = true;

  try {
    await createFolderApi({
      name: name.value
    });
    toast(`Add Folder success`, { color: 'success' });
    emit('added');
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
    title="Add Folder"
    @success="onSaving"
  >
    <div>
      <base-input v-model="name" autofocus />
    </div>
  </base-confirm-action-modal>
</template>
