<template>
  <main class="container mt-4">
    <div class="card shadow-sm">
      <div class="card-body">
        <h1 class="card-title text-center mb-2">Sign Up</h1>
        <p class="text-muted text-center mb-4">
          Please complete the fields below. Required fields are marked with “*”.
        </p>

        <!-- Registration form -->
        <form @submit.prevent="onSubmit" novalidate>
          <!-- Account -->
          <fieldset class="border rounded p-3 mb-3">
            <legend class="float-none w-auto px-2 fs-6 text-muted">Account</legend>

            <div class="row g-3">
              <!-- Username -->
              <div class="col-md-6">
                <label for="username" class="form-label">Username *</label>
                <input
                  id="username"
                  type="text"
                  class="form-control"
                  v-model.trim="model.username"
                  @blur="markTouched('username'); checkName()"
                  @input="checkNameDebounced()"
                  :aria-invalid="!!errs.username || undefined"
                  :aria-describedby="errs.username ? 'username-err' : undefined"
                  autocomplete="username"
                  minlength="3"
                  maxlength="30"
                  required
                />
                <div v-if="errs.username" id="username-err" class="text-danger small mt-1">{{ errs.username }}</div>
                <div class="form-text">Minimum 3 characters.</div>
              </div>

              <!-- Password -->
              <div class="col-md-6">
                <label for="password" class="form-label">Password *</label>
                <input
                  id="password"
                  type="password"
                  class="form-control"
                  v-model="model.password"
                  @blur="markTouched('password'); checkPassword()"
                  @input="checkPasswordDebounced()"
                  :aria-invalid="!!errs.password || undefined"
                  :aria-describedby="errs.password ? 'password-err' : undefined"
                  autocomplete="new-password"
                  minlength="8"
                  maxlength="64"
                  required
                />
                <div v-if="errs.password" id="password-err" class="text-danger small mt-1">{{ errs.password }}</div>
                <div class="form-text">At least 8 chars, include upper, lower, number &amp; special.</div>
              </div>
            </div>

            <div class="row g-3 mt-1">
              <!-- Email -->
              <div class="col-md-6">
                <label for="email" class="form-label">Email *</label>
                <input
                  id="email"
                  type="email"
                  class="form-control"
                  v-model.trim="model.email"
                  @blur="markTouched('email'); checkEmail()"
                  @input="checkEmailDebounced()"
                  :aria-invalid="!!errs.email || undefined"
                  :aria-describedby="errs.email ? 'email-err' : undefined"
                  autocomplete="email"
                  maxlength="100"
                  required
                />
                <div v-if="errs.email" id="email-err" class="text-danger small mt-1">{{ errs.email }}</div>
                <div class="form-text">Example: name@example.com</div>
              </div>

              <!-- Phone (optional) -->
              <div class="col-md-6">
                <label for="phone" class="form-label">Phone (optional)</label>
                <input
                  id="phone"
                  type="tel"
                  class="form-control"
                  v-model.trim="model.phone"
                  @blur="markTouched('phone'); checkPhone()"
                  @input="checkPhoneDebounced()"
                  :aria-invalid="!!errs.phone || undefined"
                  :aria-describedby="errs.phone ? 'phone-err' : undefined"
                  inputmode="numeric"
                  pattern="\\d{8,15}"
                  minlength="8"
                  maxlength="15"
                />
                <div v-if="errs.phone" id="phone-err" class="text-danger small mt-1">{{ errs.phone }}</div>
                <div class="form-text">Digits only, 8–15 characters if provided.</div>
              </div>
            </div>
          </fieldset>

          <!-- Profile -->
          <fieldset class="border rounded p-3 mb-3">
            <legend class="float-none w-auto px-2 fs-6 text-muted">Profile</legend>

            <div class="row g-3">
              <!-- Gender -->
              <div class="col-md-6">
                <label for="gender" class="form-label">Gender</label>
                <select id="gender" class="form-select" v-model="model.gender">
                  <option value="" disabled>Select…</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <!-- Role (demo: choose user/admin) -->
              <div class="col-md-6">
                <label for="role" class="form-label">Role *</label>
                <select id="role" class="form-select" v-model="model.role" required>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <div class="form-text">Demo only: choose a role for testing.</div>
              </div>
            </div>

            <!-- Reason -->
            <div class="mt-3">
              <label for="reason" class="form-label">Reason for joining</label>
              <textarea
                id="reason"
                class="form-control"
                rows="3"
                v-model.trim="model.reason"
                maxlength="500"
                placeholder="Optional (max 500 characters)"
              ></textarea>
            </div>
          </fieldset>

          <!-- Actions -->
          <div class="d-flex justify-content-end gap-2">
            <button type="submit" class="btn btn-primary" :disabled="!canSubmit">Sign Up</button>
          </div>
        </form>
      </div>
    </div>
  </main>
</template>

<script setup>
// Vue
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

// Security: sanitize free text to prevent XSS
import DOMPurify from 'dompurify'

// Local auth (demo only; uses localStorage)
import { registerUser } from '@/lib/auth-local' // or '../lib/auth-local' if no @ alias

const router = useRouter()

/* ---------- Form state ---------- */
const model = ref({
  username: '',
  password: '',
  email: '',
  phone: '',
  reason: '',
  gender: '',
  role: 'user'
})

const errs = ref({
  username: null,
  password: null,
  email: null,
  phone: null
})

const touched = ref({
  username: false,
  password: false,
  email: false,
  phone: false
})

/* ---------- Validation ---------- */
const checkName = () => {
  const v = model.value.username?.trim() || ''
  if (!v) errs.value.username = 'Username is required.'
  else if (v.length < 3) errs.value.username = 'Name must be at least 3 characters.'
  else errs.value.username = null
}

const checkPassword = () => {
  const pwd = model.value.password || ''
  const min = 8
  const hasUpper = /[A-Z]/.test(pwd)
  const hasLower = /[a-z]/.test(pwd)
  const hasDigit = /\d/.test(pwd)
  const hasSpec = /[!@#$%^&*(),.?":{}|<>]/.test(pwd)

  if (!pwd) errs.value.password = 'Password is required.'
  else if (pwd.length < min) errs.value.password = `Password must be at least ${min} characters.`
  else if (!hasUpper) errs.value.password = 'Add at least one uppercase letter.'
  else if (!hasLower) errs.value.password = 'Add at least one lowercase letter.'
  else if (!hasDigit) errs.value.password = 'Add at least one number.'
  else if (!hasSpec) errs.value.password = 'Add at least one special character.'
  else errs.value.password = null
}

const checkEmail = () => {
  const v = model.value.email?.trim() || ''
  const basicEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!v) errs.value.email = 'Email is required.'
  else if (!basicEmail.test(v)) errs.value.email = 'Please enter a valid email.'
  else errs.value.email = null
}

const checkPhone = () => {
  const v = model.value.phone?.trim() || ''
  if (!v) { errs.value.phone = null; return }
  const onlyDigits = /^\d{8,15}$/
  if (!onlyDigits.test(v)) errs.value.phone = 'Phone must be 8–15 digits.'
  else errs.value.phone = null
}

/* Debounced checks */
let _nameTick = 0, _pwdTick = 0, _emailTick = 0, _phoneTick = 0
const checkNameDebounced = () => { const t = ++_nameTick; setTimeout(() => t === _nameTick && touched.value.username && checkName(), 120) }
const checkPasswordDebounced = () => { const t = ++_pwdTick; setTimeout(() => t === _pwdTick && touched.value.password && checkPassword(), 120) }
const checkEmailDebounced = () => { const t = ++_emailTick; setTimeout(() => t === _emailTick && touched.value.email && checkEmail(), 120) }
const checkPhoneDebounced = () => { const t = ++_phoneTick; setTimeout(() => t === _phoneTick && touched.value.phone && checkPhone(), 120) }

const markTouched = (key) => { touched.value[key] = true }

/* Submit is allowed only when required fields are valid */
const canSubmit = computed(() =>
  !errs.value.username && !errs.value.password && !errs.value.email && !errs.value.phone &&
  model.value.username && model.value.password && model.value.email
)

/* ---------- Submit ---------- */
const onSubmit = async () => {
  // trigger validations
  touched.value = { username: true, password: true, email: true, phone: true }
  checkName(); checkPassword(); checkEmail(); checkPhone()
  if (errs.value.username || errs.value.password || errs.value.email || errs.value.phone) return

  try {
    // sanitize free-text to prevent XSS (no HTML allowed)
    const safeReason = DOMPurify.sanitize(model.value.reason || '', {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    })

    await registerUser({
      email: model.value.email.trim(),
      password: model.value.password,           // demo only; backend should hash/verify
      username: model.value.username.trim(),
      role: model.value.role || 'user',
      // if your backend needs reason/gender/phone later, you can pass them too
      // here we keep only what's necessary for local demo auth
    })

    // Redirect to Login after successful registration
    router.replace('/login')
  } catch (e) {
    alert(e?.message || 'Registration failed.')
  }
}
</script>
