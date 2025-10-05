import { createRouter, createWebHistory } from 'vue-router'

// Pages
import Login from '../components/Login.vue'
import Register from '../components/Register.vue'
import Admin from '../views/Admin.vue'            // make sure this file exists

// Auth helpers
import { getCurrentUser } from '../lib/auth-local'

const routes = [
  { path: '/login', name: 'login', component: Login },
  { path: '/register', name: 'register', component: Register },
  // /admin: admin only
  { path: '/admin', name: 'admin', component: Admin, meta: { requiresAuth: true, roles: ['admin'] } },

  // Default and fallback
  { path: '/', redirect: '/login' },
  { path: '/:pathMatch(.*)*', redirect: '/login' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Global guard: enforce login and role-based access
router.beforeEach((to) => {
  const user = getCurrentUser() // { email, username, role } or null

  // Require authentication when meta.requiresAuth is set
  if (to.meta?.requiresAuth && !user) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

})

export default router
