import exampleRoutes from './examples/routes';
import roleRoutes from './roles/routes';
import userRoutes from './users/routes';

export default {
  path: 'master',
  children: [
    {
      path: '',
      component: () => import('./index.vue'),
      meta: { requiresAuth: true, role: 'admin' },
    },
    exampleRoutes,
    userRoutes,
    roleRoutes,
  ],
};
