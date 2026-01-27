export default {
  path: '',
  children: [
    {
      path: '',
      redirect: 'signin',
    },
    {
      path: 'signin',
      component: () => import('@/pages/auth/signin/index.vue'),
    },
    {
      path: 'verify-email',
      component: () => import('@/pages/auth/verify-email/index.vue'),
    },
    {
      path: 'verify-new-email',
      component: () => import('@/pages/auth/verify-new-email/index.vue'),
    },
    {
      path: 'verify-photo',
      component: () => import('@/pages/auth/verify-photo/index.vue'),
    },
    {
      path: 'forgot-password',
      component: () => import('@/pages/auth/forgot-password/index.vue'),
    },
    {
      path: 'reset-password',
      component: () => import('@/pages/auth/reset-password/index.vue'),
    },
  ],
};
