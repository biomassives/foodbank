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
      { path: 'login', component: () => import('pages/LoginPage.vue'), meta: { title: 'Sign In' } },
      { path: 'onboard', component: () => import('pages/OnboardPage.vue'), meta: { title: 'Get Started' } },
      { path: 'join', component: () => import('pages/JoinPantry.vue'), meta: { title: 'Join Pantry' } },
      { path: 'profile', component: () => import('pages/ProfilePage.vue'), meta: { title: 'My Profile' } },
      { path: 'settings', component: () => import('pages/SettingsPage.vue'), meta: { title: 'Settings' } },
      { path: 'tests', component: () => import('pages/TestResultsPage.vue'), meta: { title: 'Tests' } },
      { path: 'wizard', component: () => import('pages/WizardPage.vue'), meta: { title: 'Setup Wizard' } },
      { path: 'calendar', component: () => import('pages/CalendarPage.vue'), meta: { title: 'Calendar' } },
      { path: 'terms', component: () => import('pages/TermsPage.vue'), meta: { title: 'Terms & Conditions' } },
      { path: 'launch', component: () => import('pages/LaunchPage.vue'), meta: { title: 'Run Your Own' } },
      { path: 'info', component: () => import('pages/OpsPage.vue'), meta: { title: 'Pantry Info' } },
      { path: 'docs', component: () => import('pages/DocsPage.vue'), meta: { title: 'Docs' } },
      { path: 'mcp-docs', component: () => import('pages/McpDocsPage.vue'), meta: { title: 'MCP & Chat Ops' } },
      { path: 'recordings', component: () => import('pages/RecordingsPage.vue'), meta: { title: 'Test Recordings' } },
      { path: 'logistics', component: () => import('pages/LogisticsPage.vue'), meta: { title: 'Logistics' } },
      { path: 'audio', component: () => import('pages/AudioSequenceBuilder.vue'), meta: { title: 'Audio Sequences' } },
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
        beforeEnter: async (to, from, next) => {
          const store = useAddressStore();
          // localMode grants immediate access (offline dev)
          if (store.localMode) { next(); return; }
          // On in-app navigation the role is already loaded — fast path
          if (store.isAdmin) { next(); return; }
          // On full-page load the role hasn't been fetched yet — do it now
          await store.fetchUserRole();
          if (store.isAdmin) next();
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
