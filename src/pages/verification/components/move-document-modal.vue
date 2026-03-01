<script setup lang="ts">
import { ref } from 'vue';

import BaseConfirmActionModal from '@/components/base-confirm-action-modal.vue';
import { toast } from '@/toast';
import { handleError } from '@/utils/api';
import { getFoldersApi } from '@/composables/api/folders/get.api';
import { updateDocumentApi } from '@/composables/api/documents/update.api';
import { useSelectableFolders } from '@/composables/selectable/folders';

const folders = ref<{ _id: string, name: string }[]>()
const confirmActionModalRef = ref();
const _id = ref();
const emit = defineEmits(['updated']);
const { options: folderOptions, searchFolder } = useSelectableFolders();

interface IData {
  _id: string
}
const toggleModal = async (data: IData) => {
  _id.value = data._id;
  folders.value = (await getFoldersApi()).data
  confirmActionModalRef.value.toggleModal();
};

const folderId = ref();
const isUpdating = ref(false);
const onUpdate = async (reason: string) => {
  // prevent calling twice use loading state
  if (isUpdating.value) return;
  isUpdating.value = true;

  try {
    await updateDocumentApi(_id.value as string, {
      folder_id: folderId.value
    });
    toast(`Void Document success`, { color: 'success' });
    emit('updated');
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
    isUpdating.value = false;
  }
};

defineExpose({
  toggleModal,
  isUpdating,
});
</script>

<template>
  <base-confirm-action-modal
    ref="confirmActionModalRef"
    title="Move Folder"
    @success="onUpdate"
  >
    <div>
      <p>
        <base-choosen
          title="Folders"
          v-model="folderId"
          v-model:search="searchFolder"
          :options="folderOptions"
          placeholder="Select"
        />
      </p>
    </div>
  </base-confirm-action-modal>
</template>
