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
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { hideNavBar: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
      meta: { hideNavBar: true },
    },
    {
      path: '/verify',
      name: 'verify',
      component: () => import('@/views/VerifyAccountView.vue'),
      meta: { hideNavBar: true },
    },
    {
      path: '/list/:id',
      name: 'list',
      component: () => import('@/views/ListView.vue'),
    },
    {
      path: '/products',
      name: 'products',
      component: () => import('@/views/ProductsView.vue'),
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  const publicRoutes = new Set(['/login', '/register', '/verify'])
  if (!publicRoutes.has(to.path) && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (publicRoutes.has(to.path) && auth.isAuthenticated) {
    return { path: '/' }
  }
})

export default router
