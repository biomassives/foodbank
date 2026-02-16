import { RouteRecordRaw } from 'vue-router';
import { useAddressStore } from 'src/store/store';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/IndexPage.vue'),
        meta: { title: 'Address Book' },
      },
      { path: 'login', component: () => import('pages/OnboardPage.vue'), meta: { title: 'Get Started' } },
      { path: 'settings', component: () => import('pages/SettingsPage.vue'), meta: { title: 'Settings' } },
      { path: 'setup', redirect: '/login' },
    ],
    meta: {
      title: 'Contact Management System - Vue',
    },
  },
  {
    path: '/admin',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/AdminPage.vue'),
        beforeEnter: (to, from, next) => {
          const store = useAddressStore();
          if (store.canEdit) next();
          else next('/login');
        }
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
