<script setup lang="ts">
import { ref } from 'vue';
import type { IFormApproval } from '../upload/form';

export interface PdfSignerUser {
  user_id: string
  initial_name: string
  name: string
  role: string
}

const props = defineProps<{
  users: IFormApproval[];
}>();

const emit = defineEmits<{
  (event: 'user:dragstart', user: PdfSignerUser): void
}>();

const draggingUser = ref<PdfSignerUser | null>(null);

const onDragStart = (user: PdfSignerUser, event: DragEvent) => {
  draggingUser.value = user;

  emit('user:dragstart', user);

  if (event.dataTransfer) {
    event.dataTransfer.setData('text/plain', 'signature');
    event.dataTransfer.effectAllowed = 'copy';

    // Create a drag preview element
    const preview = document.createElement('div');
    preview.style.width = '112px'; // 28 * 4px
    preview.style.height = '80px'; // 18 * 4px
    preview.style.display = 'flex';
    preview.style.flexDirection = 'column';
    preview.style.justifyContent = 'space-between';
    preview.style.alignItems = 'center';
    preview.style.padding = '8px';
    preview.style.border = '2px dashed #2563EB';
    preview.style.background = '#DBEAFE';
    preview.style.fontSize = '12px';
    preview.style.fontFamily = 'sans-serif';
    preview.style.boxSizing = 'border-box';

    preview.innerHTML = `
      <div style="font-weight:bold; font-size:0.875rem;">SIGN</div>
      <div style="font-size:0.75rem; color:#2563EB; background:#93C5FD; padding:0.125rem 0.5rem;">${user.initial_name}</div>
      <div style="font-size:0.75rem; text-align:center; margin-bottom: 10.125rem">${user.name}</div>
    `;

    document.body.appendChild(preview);
    event.dataTransfer.setDragImage(preview, 56, 36); // center the preview
    setTimeout(() => document.body.removeChild(preview), 0);
  }
};

</script>

<template>
  <section>
    <div class="flex flex-col gap-2">
      <button
        v-for="user in props.users"
        :key="user.user_id"
        type="button"
        draggable="true"
        @dragstart="onDragStart(user, $event)"
      >
        <div class="flex justify-between items p-2 border-2 border-dashed border-[#7c6ff0] hover:bg-slate-100">
          <span>{{ user.name }}</span>
          <span class="font-bold">{{ user.initial_name }}</span>
        </div>
      </button>
    </div>
  </section>
</template>

<style scoped>
button {
  cursor: grab;
  user-select: none;
}
button:active {
  cursor: grabbing;
}
</style>