<script setup lang="ts">
import { onMounted, ref } from 'vue';

import AppMenu, { type IMenu } from '@/components/app-menu.vue';
import { useAuthStore } from '@/stores/auth.store';

const breadcrumbs = [
  {
    name: 'Home',
    path: '/',
  },
];

const menus = ref<IMenu[]>([]);

const authStore = useAuthStore();

onMounted(() => {
  if (authStore.authUser?.role?.name === 'admin') {
    menus.value.push({ name: 'Master', path: '/master', icon: 'i-fa7-solid:address-card' });
    // menus.value.push({ name: 'Administrator', path: '/administrator', icon: 'i-fa7-solid:folder-gear' });
  }
  menus.value.push({ name: 'Documents', path: '/documents', icon: 'i-fa7-solid:files' });
  menus.value.push({ name: 'Verify Document', path: '/verification', icon: 'i-fa7-solid:file-check' });
});
</script>

<template>
  <app-menu :breadcrumbs="breadcrumbs" v-model:menus="menus" />
</template>
