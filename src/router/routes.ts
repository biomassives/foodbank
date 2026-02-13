import { RouteRecordRaw } from 'vue-router';

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
      { path: 'login', component: () => import('pages/LoginPage.vue') }, 
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
          else next('/login'); // Redirect unauthorized users
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
