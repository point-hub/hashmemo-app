<script setup lang="ts">
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
const data = ref<{ status: string, reason: string, created_at: string, created_by: string }>({
  status: '', 
  reason: '', 
  created_at: '', 
  created_by: ''
})
const toggleModal = (input: { status: string, reason: string, created_at: string, created_by: string }) => {
  data.value = input
  showModal.value = !showModal.value;
};

defineExpose({
  toggleModal,
});
</script>

<template>
  <base-modal title="Status Document" :is-open="showModal">
    <div class="max-h-90vh overflow-auto">
      <div class="space-y-4">
        <slot></slot>
        <div class="flex flex-col gap-2">
          <base-textarea
            layout="v"
            label="Reason"
            :model-value="data.reason"
            disabled
            border="full"
          />
          <base-input
            layout="v"
            :label="`${data.status} At`"
            :model-value="formatDate(data.created_at)"
            disabled
            border="full"
          />
          <base-input
            layout="v"
            :label="`${data.status} By`"
            :model-value="data.created_by"
            disabled
            border="full"
          />
        </div>
      </div>
    </div>
  </base-modal>
</template>
