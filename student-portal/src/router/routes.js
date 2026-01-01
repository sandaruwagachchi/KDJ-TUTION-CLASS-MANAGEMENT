const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'dashboard', component: () => import('pages/DashboardPage.vue') },
      { path: 'profile', component: () => import('pages/ProfilePage.vue') },
      { path: 'my-classes', component: () => import('pages/MyClassesPage.vue') },
      { path: 'classes', component: () => import('pages/ClassExplorerPage.vue') },
      { path: 'classes/:id', component: () => import('pages/ClassDetailsPage.vue') },
      { path: 'payments', component: () => import('pages/PaymentsPage.vue') },
      { path: 'login', component: () => import('pages/LoginPage.vue') },
      { path: 'register', component: () => import('pages/RegisterPage.vue') },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
