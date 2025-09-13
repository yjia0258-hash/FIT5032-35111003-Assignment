import { createRouter, createWebHistory } from 'vue-router'

// Pages
import Login from '../components/Login.vue'
import Register from '../components/Register.vue'
import Home from '../views/Home.vue'
import Admin from '../views/Admin.vue'            // make sure this file exists
import Reviews from '../views/Reviews.vue'        // ratings page
import Forbidden from '../views/Forbidden.vue'

// Auth helpers
import { getCurrentUser } from '../lib/auth-local'

const routes = [
  { path: '/login', name: 'login', component: Login },
  { path: '/register', name: 'register', component: Register },

  // /home: any authenticated user
  { path: '/home', name: 'home', component: Home, meta: { requiresAuth: true } },

  // /reviews: any authenticated user
  { path: '/reviews', name: 'reviews', component: Reviews, meta: { requiresAuth: true } },

  // /admin: admin only
  { path: '/admin', name: 'admin', component: Admin, meta: { requiresAuth: true, roles: ['admin'] } },

  // 403
  { path: '/403', name: 'forbidden', component: Forbidden },

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

  // Enforce role constraints when meta.roles is present
  if (to.meta?.roles && Array.isArray(to.meta.roles)) {
    const allowed = user && to.meta.roles.includes(user.role)
    if (!allowed) return { name: 'forbidden' }
  }
})

export default router
