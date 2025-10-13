import { createRouter, createWebHistory } from 'vue-router'

// Views (lazy-loaded)
const Admin = () => import('@/views/Admin.vue')
const Home = () => import('@/views/Home.vue')
const FirebaseSigninView = () => import('@/views/FirebaseSigninView.vue')
const FirebaseRegisterView = () => import('@/views/FirebaseRegisterView.vue')
const EmailSend = () => import('@/views/EmailSend.vue')
const TableDemo = () => import('@/views/TableDemo.vue') // D.3 page

// Firebase
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'

// Wait for Firebase Auth to initialize once (avoid false "not logged in" after hard refresh)
function getCurrentUser() {
  return new Promise((resolve) => {
    const stop = onAuthStateChanged(auth, (user) => {
      stop()
      resolve(user || null)
    })
  })
}

// Simple admin whitelist for demo
const ADMIN_EMAILS = new Set(['admin@yourdomain.com'])

const routes = [
  // Auth pages (hide from signed-in users)
  { path: '/FireLogin', name: 'FireLogin', component: FirebaseSigninView, meta: { guestOnly: true, title: 'Login' } },
  { path: '/FireRegister', name: 'FireRegister', component: FirebaseRegisterView, meta: { guestOnly: true, title: 'Register' } },

  // App pages (require auth)
  { path: '/home', name: 'home', component: Home, meta: { requiresAuth: true, title: 'Home' } },
  { path: '/EmailSend', name: 'EmailSend', component: EmailSend, meta: { requiresAuth: true, title: 'Send Email' } },
  { path: '/tables', name: 'tables', component: TableDemo, meta: { requiresAuth: true, title: 'Tables' } },

  // Admin-only
  { path: '/admin', name: 'admin', component: Admin, meta: { requiresAuth: true, roles: ['admin'], title: 'Admin' } },

  // Default & fallback
  { path: '/', redirect: '/FireLogin' },
  { path: '/:pathMatch(.*)*', redirect: '/FireLogin' }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  // Keep scroll position consistent on navigation
  scrollBehavior() {
    return { left: 0, top: 0 }
  }
})

router.beforeEach(async (to) => {
  const requiresAuth = to.matched.some((r) => r.meta && r.meta.requiresAuth)
  const guestOnly    = to.matched.some((r) => r.meta && r.meta.guestOnly)
  const user         = await getCurrentUser()

  // Signed-in users visiting login/register -> go to ?redirect or /home
  if (guestOnly && user) {
    const back = (to.query && to.query.redirect) ? String(to.query.redirect) : '/home'
    return back
  }

  // Route requires auth but user not signed in -> go to login
  if (requiresAuth && !user) {
    return { name: 'FireLogin', query: { redirect: to.fullPath } }
  }

  // Admin whitelist (demo). Swap to custom claims if needed.
  if (to.meta && to.meta.roles && user) {
    const roles = to.meta.roles
    if (Array.isArray(roles) && roles.includes('admin')) {
      const email = user.email || ''
      if (!email || !ADMIN_EMAILS.has(email)) {
        console.warn('Not authorized: admin only.')
        return { name: 'home' }
      }
    }
  }

  return true
})

// Optional: set document title from route meta
router.afterEach((to) => {
  const base = 'App'
  const title = (to.meta && to.meta.title) ? String(to.meta.title) + ' · ' + base : base
  if (typeof document !== 'undefined') {
    document.title = title
  }
})

export default router
