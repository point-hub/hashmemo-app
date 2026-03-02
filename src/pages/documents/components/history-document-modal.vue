<script setup lang="ts">
import { getActivitiesApi } from '@/composables/api/activities/get.api';
import { formatDate } from '@/utils/date';
import { ref } from 'vue';

interface IProps {
  requireReason?: boolean
  requirePassword?: boolean
  confirmText?: string
  cancelText?: string
}

const props = withDefaults(defineProps<IProps>(), {
  requireReason: false,
  requirePassword: false,
  confirmText: 'Confirm',
  cancelText: 'Cancel',
});

const emit = defineEmits(['close', 'success']);

const showModal = ref(false);
const activities = ref()
const fileName = ref()
const owner = ref()
const toggleModal = async (file_id: string, created_by: string, name: string) => {
  showModal.value = !showModal.value;
  fileName.value = name
  owner.value = created_by
  const response = await getActivitiesApi({
    search: {
      file_id: file_id
    },
    page_size: 1000
  })

  activities.value = response.data
};

defineExpose({
  toggleModal,
});
</script>

<template>
  <base-modal title="History Document" :is-open="showModal">
    <div class="max-h-90vh overflow-auto">
      <div class="space-y-4">
        <slot></slot>
        <div class="flex flex-col gap-2">
          <div>
            <p>Document: {{ fileName }}</p>
            <p>Owner: {{ owner }}</p>
          </div>
          <base-table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Activity</th>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="activity in activities">
                <td>{{ formatDate(activity.created_at) }}</td>
                <td>{{ activity.action }} {{ activity.file_name }}</td>
                <td>{{ activity.name }}</td>
              </tr>
            </tbody>
          </base-table>
        </div>
      </div>
    </div>
  </base-modal>
</template>
