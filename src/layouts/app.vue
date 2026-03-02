<script setup lang="ts">
import {
  type IAppMenu,
  useDarkMode,
  useMobileBreakpoint,
  useSidebar,
  useSidebarMenuStore,
  useSidebarStore,
} from '@point-hub/papp';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import AppHeaderNotifications from '@/components/app-header-notifications.vue';
import { useAblyChannel } from '@/composables/ably-channel';
import { useAuthStore } from '@/stores/auth.store';

import { version } from '../../package.json';

const route = useRoute();
const router = useRouter();

useSidebar();

const mobileBreakpoint = useMobileBreakpoint();
const sidebarStore = useSidebarStore();
const sidebarMenuStore = useSidebarMenuStore();
const { isDarkMode, toggleDarkMode } = useDarkMode();
const authStore = useAuthStore();

const { subscribe } = useAblyChannel(`notifications:${authStore.authUser?._id}`);
const isHeaderMenuOpen = ref(false);

// Sidebar
const appMenu = ref<IAppMenu[]>([
  {
    name: 'Hash Memo',
    path: '/',
    icon: 'https://assets.pointhub.net/assets/images/logo/primary/icon-rounded.png',
    menu: [
      {
        name: 'Home',
        path: '/home',
      },
    ],
  },
]);

const appList = ref<IAppMenu[]>([
  {
    name: 'Hash Memo',
    path: 'https://www.example.com',
  },
]);
sidebarMenuStore.setAppMenu(appMenu.value, appList.value);

// Header
const account = ref();

const organizations = ref();

const onSignout = async () => {
  await authStore.signout();
  await router.push('/signin');
};

onMounted(() => {
  subscribe();
  sidebarMenuStore.onChooseApp(route.path);

  account.value = {
    organization: 'Hash Memo',
    username: authStore.authUser?.username,
    avatar: 'https://placehold.co/150',
  };

  if (authStore.authUser?.role?.name === 'admin') {
    appMenu.value[0]?.menu?.push({
      name: 'Master',
      submenu: [
        { name: 'Users', path: '/master/users' },
      ],
    });
  }

  appMenu.value[0]?.menu?.push({
    name: 'Documents',
    path: '/documents'
  });
  
  appMenu.value[0]?.menu?.push({
    name: 'Verification Document',
    path: '/verification'
  });
});
</script>

<template>
  <div class="app-layout">
    <!-- Header -->
    <app-header class="print:hidden!">
      <template #left-header>
        <header-sidebar-button
          :on-toggle-sidebar="sidebarStore.toggleSidebar"
          v-model:is-sidebar-open="sidebarStore.isSidebarOpen"
        />
      </template>
      <template #right-header>
        <!-- <app-header-notifications /> -->
        <base-divider class="h-10 print:hidden!" orientation="horizontal" />
        <header-menu v-model:is-open="isHeaderMenuOpen" :organization="account?.organization" :username="account?.username" :avatar="authStore.authUser?.photo_url" class="print:hidden!">
          <header-menu-account :organization="account?.organization" :username="account?.username" :avatar="authStore.authUser?.photo_url" />
          <base-divider orientation="vertical" class="my-2!" />
          <header-menu-link label="My Account" icon="i-ph:user-circle-gear-duotone" path="/account" @click="() => isHeaderMenuOpen = false" />
          <header-menu-link label="My Activities" icon="i-ph:clock-duotone" path="/activities" @click="() => isHeaderMenuOpen = false" />
          <header-menu-switch-organization :organizations="organizations" />
          <header-menu-dark-mode :on-toggle-dark-mode="toggleDarkMode" v-model:is-dark-mode="isDarkMode" />
          <header-menu-signout :on-signout="onSignout" />
        </header-menu>
      </template>
    </app-header>

    <!-- Sidebar -->
    <div class="print:hidden!">
      <app-sidebar
        
        :title="sidebarMenuStore.choosenAppTitle"
        :apps="sidebarMenuStore.appMenu"
        :menus="sidebarMenuStore.appMenu[sidebarMenuStore.choosenAppIndex]?.menu ?? []"
        :is-sidebar-open="sidebarStore.isSidebarOpen"
        :is-mobile="mobileBreakpoint.isMobile()"
        @choose="sidebarMenuStore.onChooseApp"
      />
    </div>

    <!-- Main Container -->
    <div class="main-container">
      <!-- Main Content -->
      <main class="main-content">
        <router-view />
      </main>

      <!-- Footer -->
      <app-footer :version="version" :year="2025" class="print:hidden!" />
    </div>
  </div>
</template>

<style scoped lang="postcss">
.app-layout {
  @apply h-100vh w-full flex grow;
}

.main-container {
  @apply flex flex-col py-4 space-y-8 w-full transition-all duration-300;
}

.is-sidebar-open .main-container {
  @apply lg:w-[calc(100%-(var(--sidebar-panel-width)+var(--sidebar-menu-width)))] lg:ml-[calc(var(--sidebar-panel-width)+var(--sidebar-menu-width))];
}

.main-content {
  @apply mt-[60px] px-4 flex-1;
}

.main-content-header {
  @apply flex space-x-4 py-2 overflow-x-hidden;
}

.main-content-body {
  @apply flex flex-col space-y-5;
}
</style>
