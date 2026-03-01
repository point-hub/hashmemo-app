export default {
  path: 'documents',
  children: [
    {
      path: '',
      component: () => import('./list/index.vue'),
      meta: { requiresAuth: true, permission: 'documents:read' },
    },
    {
      path: 'create',
      component: () => import('./create/index.vue'),
      meta: { requiresAuth: true, permission: 'documents:create' },
    },
    {
      path: 'upload',
      component: () => import('./upload/index.vue'),
      meta: { requiresAuth: true, permission: 'documents:create' },
    },
    {
      path: ':id',
      component: () => import('./details/index.vue'),
      meta: { requiresAuth: true, permission: 'documents:read' },
    },
    {
      path: ':id/histories',
      component: () => import('./histories/index.vue'),
      meta: { requiresAuth: true, permission: 'documents:read' },
    },
    {
      path: ':id/audits',
      component: () => import('./audits/index.vue'),
      meta: { requiresAuth: true, permission: 'audit-logs:read' },
    },
    {
      path: ':id/field-histories/:field',
      component: () => import('./field-histories/index.vue'),
      meta: { requiresAuth: true, permission: 'documents:read' },
    },
  ],
};
