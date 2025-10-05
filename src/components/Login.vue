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

      <!-- Captcha block -->
      <div class="captcha">
        <div class="captcha__code" aria-label="Verification code">{{ captcha }}</div>
        <button type="button" class="btn btn-outline-secondary btn-sm" @click="generateCaptcha">
          Refresh
        </button>
      </div>

      <!-- Input: text + numeric-only + strict 6 digits -->
      <input
        v-model="captchaInput"
        type="text"
        class="form-control"
        placeholder="Enter 6-digit code"
        inputmode="numeric"
        autocomplete="one-time-code"
        pattern="^[0-9]{6}$"
        minlength="6"
        maxlength="6"
        required
        @input="captchaInput = (captchaInput || '').replace(/[^0-9]/g, '')"
      />

      <button type="submit" class="btn btn-primary w-100">Login</button>
    </form>

    <!-- Link to register page if user has no account -->
    <p class="mt-3 text-center">
      No account?
      <RouterLink to="/register">Go to Register</RouterLink>
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { loginUser } from '../lib/auth-local'

// form state
const email = ref('')
const password = ref('')

// captcha state
const captcha = ref('')       // generated 6-digit code
const captchaInput = ref('')  // user input

const router = useRouter()
const route = useRoute()

// ====== Added: fallback path if /home does not exist ======
const FALLBACK_AFTER_LOGIN = '/reviews'
function pathExists(p) {
  return router.getRoutes().some(r => r.path === p)
}
// ==========================================================

// Generate a 6-digit numeric captcha (preserve leading zeros if any)
function generateCaptcha() {
  // use crypto for better randomness than Math.random()
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 1000000
  captcha.value = n.toString().padStart(6, '0')
  captchaInput.value = ''
}

onMounted(() => {
  generateCaptcha()
})

function isSafeRedirect(p) {
  return typeof p === 'string' && p.startsWith('/') && !p.startsWith('//')
}

// Handle login logic
async function submit() {
  // Validate captcha input
  const code = (captchaInput.value || '').trim()
  if (!/^[0-9]{6}$/.test(code)) {
    alert('Please enter a 6-digit code.')
    return
  }
  if (code !== captcha.value) {
    alert('Verification code is incorrect. A new code has been generated.')
    generateCaptcha()
    return
  }

  try {
    // loginUser returns { email, username, role }
    const me = await loginUser(email.value.trim(), password.value)

    // If redirected from a protected route, go back there
    const redirect = route.query.redirect
    if (isSafeRedirect(redirect)) {
      router.replace(redirect)
      return
    }

    // Otherwise redirect based on role
    // Fallback if /home does not exist
    const normalTarget = pathExists('/home') ? '/home' : FALLBACK_AFTER_LOGIN
    router.replace(me.role === 'admin' ? '/admin' : normalTarget)
  } catch (e) {
    alert(e?.message || 'Login failed. Please check your email and password.')
    // regenerate captcha on failure to slow brute force
    generateCaptcha()
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

/* Captcha block styling */
.captcha {
  display: flex;
  align-items: center;
  gap: 8px;
}
.captcha__code {
  font-family: ui-monospace, Menlo, Consolas, monospace;
  letter-spacing: 2px;
  padding: 6px 10px;
  border: 1px dashed #bbb;
  border-radius: 6px;
  background: #fafafa;
  user-select: none;
}
</style>
