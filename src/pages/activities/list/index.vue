<script setup lang="ts">
import { onMounted, ref } from 'vue';

import AppContainer from '@/components/app-container.vue';
import { toast } from '@/toast';
import { handleError } from '@/utils/api';

import { useForm } from './form';
import { getActivitiesApi } from '@/composables/api/activities/get.api';
import { formatDate } from '@/utils/date';
import { useAuthStore } from '@/stores/auth.store';

const form = useForm();

const isLoading = ref(false);
const activities = ref()
const authStore = useAuthStore()
onMounted(async () => {
  try {
    isLoading.value = true;
    activities.value = (await getActivitiesApi({
      search: {
        user_id: authStore.authUser?._id
      }
    })).data;
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
      </base-card>
    </template>
  </app-container>
</template>
