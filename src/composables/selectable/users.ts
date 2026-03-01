import { watchDebounced } from '@vueuse/core';
import { computed, onMounted, ref } from 'vue';

import { getUsersApi, type IUserData } from '../api/master/users/get.api';

export function useSelectableUsers() {
  const users = ref<IUserData[]>([]);
  const searchUser = ref<string | undefined>();
  const isLoading = ref(false);

  const options = computed(() =>
  users.value
    .filter(user => user.name && user.name.trim() !== '')
    .map(user => ({
      label: user.name,
      name: user.name,
      initial_name: user.initial_name,
      value: user._id,
    })),
  );

  // Use a shared controller that can be replaced
  let controller: AbortController | null = null;

  const getUsers = async (search?: string) => {
    // Abort the previous request if it exists
    if (controller) {
      controller.abort();
    }

    // Create a new AbortController for this request
    controller = new AbortController();

    isLoading.value = true;
    const response = await getUsersApi({
      search: {
        all: search,
      },
      page: 1,
      page_size: 100,
    });

    users.value = response.data;
    isLoading.value = false;
  };

  watchDebounced(
    searchUser,
    async (val) => {
      await getUsers(val);
    },
    { debounce: 500, maxWait: 1000 },
  );

  onMounted(() => {
    getUsers();
  });

  return {
    users,
    options,
    isLoading,
    searchUser,
    getUsers,
  };
}
