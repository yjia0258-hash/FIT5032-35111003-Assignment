import { createRouter, createWebHistory } from 'vue-router'

// Views
import Admin from '../views/Admin.vue'
import Home from '../views/Home.vue'   // Make sure this file exists
import FirebaseSigninView from '@/views/FirebaseSigninView.vue'
import FirebaseRegisterView from '@/views/FirebaseRegisterView.vue'

// Firebase
import { auth } from '@/lib/firebase'

const routes = [
  // Firebase authentication views
  { path: '/FireLogin', name: 'FireLogin', component: FirebaseSigninView },
  { path: '/FireRegister', name: 'FireRegister', component: FirebaseRegisterView },

  // Home page (default page after login)
  { path: '/home', name: 'home', component: Home, meta: { requiresAuth: true } },

  // Admin page (only accessible to admin users)
  { path: '/admin', name: 'admin', component: Admin, meta: { requiresAuth: true, roles: ['admin'] } },

  // Default root path -> redirect to FireLogin
  { path: '/', redirect: '/FireLogin' },

  // Fallback: unknown routes -> redirect to FireLogin
  { path: '/:pathMatch(.*)*', redirect: '/FireLogin' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Global navigation guard
router.beforeEach((to) => {
  const user = auth.currentUser

  // If the route requires authentication but the user is not logged in -> redirect to FireLogin
  if (to.meta?.requiresAuth && !user) {
    return { name: 'FireLogin', query: { redirect: to.fullPath } }
  }

  // If the route requires admin role
  if (to.meta?.roles?.includes('admin') && user) {
    // Example: use email whitelist to simulate admin role
    if (user.email !== 'admin@yourdomain.com') {
      alert('You are not authorized to access Admin.')
      return { name: 'home' } // Non-admin users are redirected to home
    }
  }
})

export default router
