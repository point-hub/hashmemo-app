export default {
  path: 'activities',
  children: [
    {
      path: '',
      component: () => import('./list/index.vue'),
      meta: { requiresAuth: true, permission: 'documents:read' },
    },
  ],
};
