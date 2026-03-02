<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';

import AppContainer from '@/components/app-container.vue';
import { toast } from '@/toast';
import { handleError } from '@/utils/api';

import { useForm } from './form';
import { getActivitiesApi } from '@/composables/api/activities/get.api';
import { formatDate } from '@/utils/date';
import { useAuthStore } from '@/stores/auth.store';

const form = useForm();

const pagination = ref({
  page: 1,
  page_count: 0,
  page_size: 1,
  total_document: 0,
});

const onPageUpdate = async () => {
  const response = (await getActivitiesApi({
    search: {
      user_id: authStore.authUser?._id
    },
    page: pagination.value.page,
    sort: '-_id'
  }));

  activities.value = response.data
  pagination.value = response.pagination
};

const isLoading = ref(false);
const activities = ref()
const authStore = useAuthStore()
onMounted(async () => {
  try {
    isLoading.value = true;
    const response = await getActivitiesApi({
      search: {
        user_id: authStore.authUser?._id
      },
      page: pagination.value.page,
      sort: '-_id'
    });
    activities.value = response.data
    pagination.value = response.pagination
  } catch (error) {
    const errorResponse = handleError(error);
    if (errorResponse.message) {
      toast(errorResponse.message, {
        lists: errorResponse.lists,
        color: 'danger',
      });
    }
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <app-container :is-loading="isLoading">
    <base-card v-if="!activities">
      Data Not Found
    </base-card>
    <template v-else>
      <base-card title="Activities">
        <base-table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Activity</th>
              <th>Name</th>
              <th>IP Address</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="activity in activities">
              <td>{{ formatDate(activity.created_at) }}</td>
              <td>{{ activity.action }} {{ activity.file_name }}</td>
              <td>{{ activity.name }}</td>
              <td>{{ activity.ip }}</td>
            </tr>
          </tbody>
        </base-table>
        <br>
        <base-pagination
          v-if="!isLoading"
          v-model="pagination.page"
          :page-size="pagination.page_size"
          :total-document="pagination.total_document"
          @update:model-value="onPageUpdate()"
        />
      </base-card>
    </template>
  </app-container>
</template>
