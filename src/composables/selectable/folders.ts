import { watchDebounced } from '@vueuse/core';
import { computed, onMounted, ref } from 'vue';

import { getFoldersApi, type IFolderData } from '../api/folders/get.api';

export function useSelectableFolders() {
  const folders = ref<IFolderData[]>([]);
  const searchFolder = ref<string | undefined>();
  const isLoading = ref(false);

  const options = computed(() =>
  folders.value
    .filter(folder => folder.name && folder.name.trim() !== '')
    .map(folder => ({
      label: folder.name,
      name: folder.name,
      value: folder._id,
    })),
  );

  // Use a shared controller that can be replaced
  let controller: AbortController | null = null;

  const getFolders = async (search?: string) => {
    // Abort the previous request if it exists
    if (controller) {
      controller.abort();
    }

    // Create a new AbortController for this request
    controller = new AbortController();

    isLoading.value = true;
    const response = await getFoldersApi({
      search: {
        all: search,
      },
      page: 1,
      page_size: 100,
    });

    console.log(response)
    folders.value = response.data;
    isLoading.value = false;
  };

  watchDebounced(
    searchFolder,
    async (val) => {
      await getFolders(val);
    },
    { debounce: 500, maxWait: 1000 },
  );

  onMounted(() => {
    getFolders();
  });

  return {
    folders,
    options,
    isLoading,
    searchFolder,
    getFolders,
  };
}
