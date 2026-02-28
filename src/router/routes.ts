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
      { path: 'newlogin', component: () => import('pages/LoginPage.vue'), meta: { title: 'Get Started' } },
      { path: 'login', component: () => import('pages/OnboardPage.vue'), meta: { title: 'Get Started' } },
      { path: 'join', component: () => import('pages/JoinPantry.vue'), meta: { title: 'Join Pantry' } },
      { path: 'profile', component: () => import('pages/ProfilePage.vue'), meta: { title: 'My Profile' } },
      { path: 'settings', component: () => import('pages/SettingsPage.vue'), meta: { title: 'Settings' } },
      { path: 'tests', component: () => import('pages/TestResultsPage.vue'), meta: { title: 'Tests' } },
      { path: 'wizard', component: () => import('pages/WizardPage.vue'), meta: { title: 'Setup Wizard' } },
      { path: 'calendar', component: () => import('pages/CalendarPage.vue'), meta: { title: 'Calendar' } },
      { path: 'terms', component: () => import('pages/TermsPage.vue'), meta: { title: 'Terms & Conditions' } },
      { path: 'info', component: () => import('pages/OpsPage.vue'), meta: { title: 'Pantry Info' } },
      { path: 'docs', component: () => import('pages/DocsPage.vue'), meta: { title: 'Documentation' } },
      { path: 'logistics', component: () => import('pages/LogisticsPage.vue'), meta: { title: 'Logistics' } },
      {
        path: 'setup',
        component: () => import('pages/SetupPage.vue'),
        meta: { title: 'Pantry Setup' },
        beforeEnter: (to, from, next) => {
          const store = useAddressStore();
          if (store.canEdit || store.localMode) next();
          else next('/login');
        },
      },
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
