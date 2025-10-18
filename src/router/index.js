import { createRouter, createWebHistory } from 'vue-router'

// Views (lazy-loaded)
const Admin                = () => import('@/views/Admin.vue')
const Home                 = () => import('@/views/Home.vue')
const FirebaseSigninView   = () => import('@/views/FirebaseSigninView.vue')
const FirebaseRegisterView = () => import('@/views/FirebaseRegisterView.vue')
const EmailSend            = () => import('@/views/EmailSend.vue')
const TableDemo            = () => import('@/views/TableDemo.vue')
const MapView              = () => import('@/views/MapView.vue')
const ChartsView = () => import('@/views/ChartsView.vue')

// Firebase
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'

// Resolve current user once (used by route guards)
function getCurrentUser () {
  return new Promise((resolve) => {
    const stop = onAuthStateChanged(auth, (user) => {
      stop()
      resolve(user || null)
    })
  })
}

// Simple admin whitelist (demo only)
const ADMIN_EMAILS = new Set(['admin@yourdomain.com'])

const routes = [
  // Auth pages
  { path: '/FireLogin',    name: 'FireLogin',    component: FirebaseSigninView,   meta: { guestOnly: true,  title: 'Login' } },
  { path: '/FireRegister', name: 'FireRegister', component: FirebaseRegisterView, meta: { guestOnly: true,  title: 'Register' } },

  // App pages
  { path: '/home',      name: 'home',      component: Home,      meta: { requiresAuth: true, title: 'Home' } },
  { path: '/EmailSend', name: 'EmailSend', component: EmailSend, meta: { requiresAuth: true, title: 'Send Email' } },
  { path: '/tables',    name: 'tables',    component: TableDemo, meta: { requiresAuth: true, title: 'Tables' } },
  { path: '/map',       name: 'map',       component: MapView,   meta: { requiresAuth: true, title: 'Map' } },
  { path: '/charts', name: 'charts', component: ChartsView, meta: { requiresAuth: true, title: 'Charts' } },
  

  // Admin-only
  { path: '/admin',     name: 'admin',     component: Admin,     meta: { requiresAuth: true, roles: ['admin'], title: 'Admin' } },

  // Default & fallback
  { path: '/', name: 'root', redirect: '/FireLogin' },
  { path: '/:pathMatch(.*)*', redirect: '/FireLogin' }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior () { return { left: 0, top: 0 } }
})

router.beforeEach(async (to) => {
  const requiresAuth = to.matched.some(r => r.meta && r.meta.requiresAuth)
  const guestOnly    = to.matched.some(r => r.meta && r.meta.guestOnly)

  // If navigating to root '/', decide based on auth state
  if (to.name === 'root') {
    const u = await getCurrentUser()
    return u ? { name: 'home' } : { name: 'FireLogin' }
  }

  const user = await getCurrentUser()

  // If already signed in, block guest-only pages (login/register) -> go home
  if (guestOnly && user) {
    const back = (to.query && to.query.redirect) ? String(to.query.redirect) : '/home'
    return back
  }

  // Protect routes that require auth
  if (requiresAuth && !user) {
    return { name: 'FireLogin', query: { redirect: to.fullPath } }
  }

  // Admin whitelist demo (replace with custom claims in real apps)
  if (to.meta && Array.isArray(to.meta.roles) && to.meta.roles.length && user) {
    if (to.meta.roles.includes('admin')) {
      const email = user.email || ''
      if (!email || !ADMIN_EMAILS.has(email)) {
        console.warn('Not authorized: admin only.')
        return { name: 'home' }
      }
    }
  }

  return true
})

// Set document title from route meta
router.afterEach((to) => {
  const base = 'App'
  const title = (to.meta && to.meta.title) ? `${String(to.meta.title)} · ${base}` : base
  if (typeof document !== 'undefined') document.title = title
})

export default router
