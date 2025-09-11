import { createRouter, createWebHistory } from 'vue-router'

// Pages
import Login from '../components/Login.vue'
import Register from '../components/Register.vue'
import Home from '../views/Home.vue'             // User home page
import Forbidden from '../views/Forbidden.vue'   // 403 page

// Auth helpers
import { getCurrentUser } from '../lib/auth-local'

// Inline Admin page (replace with a real Admin.vue later if you like)
const AdminPage = {
  template: `
    <div class="container mt-4">
      <h2>Admin Page</h2>
      <p>Only <strong>admin</strong> can view this page.</p>
    </div>
  `
}

const routes = [
  { path: '/login', name: 'login', component: Login },
  { path: '/register', name: 'register', component: Register },

  // /home: accessible to any authenticated user
  { path: '/home', name: 'home', component: Home, meta: { requiresAuth: true } },

  // /admin: only accessible to "admin" role
  { path: '/admin', name: 'admin', component: AdminPage, meta: { requiresAuth: true, roles: ['admin'] } },

  // 403 Forbidden page
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
