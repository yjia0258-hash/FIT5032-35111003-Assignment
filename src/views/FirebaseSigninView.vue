<template>
  <div class="login-wrapper">
    <h2 class="mb-3 text-center">Login</h2>

    <form @submit.prevent="submit" class="d-flex flex-column gap-3" novalidate>
      <!-- Email -->
      <input
        v-model="email"
        type="email"
        class="form-control"
        placeholder="Email"
        required
        autocomplete="username"
      />

      <!-- Password + show/hide -->
      <div class="d-flex gap-2">
        <input
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          class="form-control"
          placeholder="Password"
          required
          autocomplete="current-password"
        />
        <button type="button" class="btn btn-outline-secondary" @click="toggleShowPassword">
          {{ showPassword ? 'Hide' : 'Show' }}
        </button>
      </div>

      <button type="submit" class="btn btn-primary w-100" :disabled="loading">
        {{ loading ? 'Signing in...' : 'Login' }}
      </button>

      <p v-if="errorText" class="text-danger small mt-2" role="alert">{{ errorText }}</p>
    </form>

    <p class="mt-3 text-center">
      No account?
      <RouterLink to="/FireRegister">Go to Register</RouterLink>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { auth } from '@/lib/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'

const route = useRoute()
const router = useRouter()

// form state
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorText = ref('')

function toggleShowPassword() {
  showPassword.value = !showPassword.value
}

function normalizeFirebaseError(code, message) {
  // Helpful messages for common local-dev cases
  if (code === 'auth/network-request-failed') {
    return 'Network error: Is the Auth Emulator running on port 9099? Check firewall/VPN and try again.'
  }
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
    return 'Invalid email or password.'
  }
  if (code === 'auth/user-not-found') {
    return 'User not found. Please register first.'
  }
  return message || 'Login failed.'
}

async function submit() {
  errorText.value = ''
  try {
    loading.value = true
    await signInWithEmailAndPassword(auth, (email.value || '').trim(), password.value)

    // Redirect: prefer ?redirect=..., otherwise go to /EmailSend
    var target = '/Home'
    if (route && route.query && route.query.redirect) {
      target = String(route.query.redirect)
    }
    router.replace(target)
  } catch (e) {
    var code = e && e.code ? String(e.code) : ''
    var msg = e && e.message ? String(e.message) : ''
    errorText.value = normalizeFirebaseError(code, msg)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Center the login card */
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
