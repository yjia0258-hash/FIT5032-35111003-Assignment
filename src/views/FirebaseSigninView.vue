<template>
  <div class="login-wrapper">
    <h2 class="mb-3 text-center">Login</h2>

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

      <!-- Captcha -->
      <div class="captcha">
        <div class="captcha__code" aria-label="Verification code">{{ captcha }}</div>
        <button type="button" class="btn btn-outline-secondary btn-sm" @click="generateCaptcha">
          Refresh
        </button>
      </div>

      <!-- 6-digit numeric code -->
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

    <p class="mt-3 text-center">
      No account?
      <RouterLink to="/FireRegister">Go to Register</RouterLink>
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '@/lib/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'

const router = useRouter()

// form state
const email = ref('')
const password = ref('')

// captcha state
const captcha = ref('')       // generated 6-digit code
const captchaInput = ref('')  // user input

// Generate a 6-digit numeric captcha (keeps leading zeros)
function generateCaptcha() {
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 1000000
  captcha.value = n.toString().padStart(6, '0')
  captchaInput.value = ''
}

onMounted(() => {
  generateCaptcha()
})

async function submit() {
  // Validate captcha
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
    await signInWithEmailAndPassword(auth, email.value.trim(), password.value)

    // If you don't have /home, change this to your desired route
    router.replace('/home')
  } catch (e) {
    alert(e?.message || 'Login failed. Please check your email and password.')
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

/* Captcha block */
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
