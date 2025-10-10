import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { title: 'Lists' },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { hideNavBar: true, title: 'Login' },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
      meta: { hideNavBar: true, title: 'Register' },
    },
    {
      path: '/verify',
      name: 'verify',
      component: () => import('@/views/VerifyAccountView.vue'),
      meta: { hideNavBar: true, title: 'Verify Account' },
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('@/views/ForgotPasswordView.vue'),
      meta: { hideNavBar: true, title: 'Forgot Password' },
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('@/views/ResetPasswordView.vue'),
      meta: { hideNavBar: true, title: 'Reset Password' },
    },
    {
      path: '/list/:id',
      name: 'list',
      component: () => import('@/views/ListView.vue'),
      meta: { title: 'List' },
    },
    {
      path: '/products',
      name: 'products',
      component: () => import('@/views/ProductsView.vue'),
      meta: { title: 'Products' },
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  const publicRoutes = new Set(['/login', '/register', '/verify', '/forgot-password', '/reset-password'])
  if (!publicRoutes.has(to.path) && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (publicRoutes.has(to.path) && auth.isAuthenticated) {
    return { path: '/' }
  }
})

// Update document title after each navigation
router.afterEach((to) => {
  const baseTitle = 'Listita'
  const pageTitle = to.meta.title as string | undefined
  document.title = pageTitle ? `${baseTitle} - ${pageTitle}` : baseTitle
})

export default router
