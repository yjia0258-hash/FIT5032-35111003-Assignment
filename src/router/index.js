import { createRouter, createWebHistory } from 'vue-router'

// Import page components
import Login from '../components/Login.vue'
import Register from '../components/Register.vue'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/register',
    name: 'register',
    component: Register
  },
  {
    path: '/',
    redirect: '/login' // Default redirect to login page
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
