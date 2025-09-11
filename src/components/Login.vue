<template>
  <div class="login-wrapper">
    <h2 class="mb-3 text-center">Login</h2>

    <!-- Login form -->
    <form @submit.prevent="submit" class="d-flex flex-column gap-3">
      <input
        v-model="email"
        type="email"
        class="form-control"
        placeholder="Email"
        required
      />
      <input
        v-model="password"
        type="password"
        class="form-control"
        placeholder="Password"
        required
      />
      <button type="submit" class="btn btn-primary w-100">Login</button>
    </form>

    <!-- Redirect to Register page if no account -->
    <p class="mt-3 text-center">
      No account?
      <RouterLink to="/register">Go to Register</RouterLink>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { loginUser } from '../lib/auth-local'  // If @ alias is not set, use '../lib/auth-local'

const email = ref('')
const password = ref('')
const router = useRouter()
const route = useRoute()

// Handle login submission
async function submit() {
  try {
    // loginUser returns { email, username, role }
    const me = await loginUser(email.value.trim(), password.value)

    // If redirected from a protected route, go back there after login
    const redirect = route.query.redirect
    if (redirect && typeof redirect === 'string') {
      router.replace(redirect)
      return
    }

    // Otherwise, redirect based on user role
    if (me.role === 'admin') {
      router.replace('/admin')
    } else {
      router.replace('/home')
    }
  } catch (e) {
    alert(e?.message || 'Login failed. Please check your email and password.')
  }
}
</script>

<style scoped>
/* Center the login card in the middle of the screen */
.login-wrapper {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  background: #fff;
  padding: 20px;
  border-radius: 6px;
  border: 1px solid #ddd;
  width: 100%;
  max-width: 400px; 
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
</style>
