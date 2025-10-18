<template>
  <main
    class="container mt-4"
    style="max-width:720px"
    role="main"
    aria-labelledby="signupTitle"
    id="main"
  >
    <!-- Page title -->
    <h1 id="signupTitle" class="mb-2 text-center">Sign Up</h1>
    <p id="signupIntro" class="text-muted text-center mb-4">
      Please complete the fields below. Required fields are marked with “*”.
    </p>

    <!-- Global SR-visible alert (success/error). Focus moves here after submit -->
    <div
      v-if="globalMsg"
      ref="srAlert"
      class="alert"
      :class="isError ? 'alert-danger' : 'alert-success'"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      tabindex="-1"
    >
      {{ globalMsg }}
    </div>

    <div class="card shadow-sm">
      <div class="card-body">
        <!-- Registration form -->
        <form @submit.prevent="onSubmit" novalidate aria-describedby="signupIntro">
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
                  :aria-invalid="errs.username ? 'true' : undefined"
                  :aria-describedby="errs.username ? 'username-err' : 'username-help'"
                  autocomplete="username"
                  minlength="3"
                  maxlength="30"
                  required
                />
                <div id="username-help" class="form-text">Minimum 3 characters.</div>
                <div v-if="errs.username" id="username-err" class="text-danger small mt-1" role="alert">
                  {{ errs.username }}
                </div>
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
                  :aria-invalid="errs.password ? 'true' : undefined"
                  :aria-describedby="errs.password ? 'password-err' : 'password-help'"
                  autocomplete="new-password"
                  minlength="8"
                  maxlength="64"
                  required
                />
                <div id="password-help" class="form-text">
                  At least 8 chars, include upper, lower, number &amp; special.
                </div>
                <div v-if="errs.password" id="password-err" class="text-danger small mt-1" role="alert">
                  {{ errs.password }}
                </div>
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
                  :aria-invalid="errs.email ? 'true' : undefined"
                  :aria-describedby="errs.email ? 'email-err' : 'email-help'"
                  autocomplete="email"
                  maxlength="100"
                  required
                />
                <div id="email-help" class="form-text">Example: name@example.com</div>
                <div v-if="errs.email" id="email-err" class="text-danger small mt-1" role="alert">
                  {{ errs.email }}
                </div>
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
                  :aria-invalid="errs.phone ? 'true' : undefined"
                  :aria-describedby="errs.phone ? 'phone-err' : 'phone-help'"
                  inputmode="numeric"
                  pattern="\\d{8,15}"
                  minlength="8"
                  maxlength="15"
                />
                <div id="phone-help" class="form-text">Digits only, 8–15 characters if provided.</div>
                <div v-if="errs.phone" id="phone-err" class="text-danger small mt-1" role="alert">
                  {{ errs.phone }}
                </div>
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
                <select id="gender" class="form-select" v-model="model.gender" aria-describedby="gender-help">
                  <option value="" disabled>Select…</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <div id="gender-help" class="form-text">Optional.</div>
              </div>

              <!-- Role -->
              <div class="col-md-6">
                <label for="role" class="form-label">Role *</label>
                <select
                  id="role"
                  class="form-select"
                  v-model="model.role"
                  required
                  aria-describedby="role-help"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <div id="role-help" class="form-text">Demo only: choose a role for testing.</div>
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
                aria-describedby="reason-help"
              ></textarea>
              <div id="reason-help" class="form-text">Free text (sanitized before submit).</div>
            </div>
          </fieldset>

          <!-- Actions -->
          <div class="d-flex justify-content-end gap-2">
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="!canSubmit || submitting"
              :aria-disabled="(!canSubmit || submitting) ? 'true' : undefined"
            >
              {{ submitting ? 'Signing up…' : 'Sign Up' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </main>
</template>

<script setup>
// Vue
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'

// Security: sanitize free text to prevent XSS
import DOMPurify from 'dompurify'

// Firebase Auth
import { auth } from '@/lib/firebase'
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut
} from 'firebase/auth'

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

const submitting = ref(false)

/* ---------- A11y: global alert state ---------- */
const globalMsg = ref('')
const isError = ref(false)
const srAlert = ref(null)

/* ---------- Validators ---------- */
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

/* ---------- Debounced checks ---------- */
let _nameTick = 0, _pwdTick = 0, _emailTick = 0, _phoneTick = 0
const checkNameDebounced = () => { const t = ++_nameTick; setTimeout(() => t === _nameTick && touched.value.username && checkName(), 120) }
const checkPasswordDebounced = () => { const t = ++_pwdTick; setTimeout(() => t === _pwdTick && touched.value.password && checkPassword(), 120) }
const checkEmailDebounced = () => { const t = ++_emailTick; setTimeout(() => t === _emailTick && touched.value.email && checkEmail(), 120) }
const checkPhoneDebounced = () => { const t = ++_phoneTick; setTimeout(() => t === _phoneTick && touched.value.phone && checkPhone(), 120) }

const markTouched = (key) => { touched.value[key] = true }

/* ---------- Submit enabled ---------- */
const canSubmit = computed(() =>
  !errs.value.username && !errs.value.password && !errs.value.email && !errs.value.phone &&
  model.value.username && model.value.password && model.value.email
)

/* ---------- Submit ---------- */
const onSubmit = async () => {
  // reset live region
  globalMsg.value = ''
  isError.value = false

  // validate
  touched.value = { username: true, password: true, email: true, phone: true }
  checkName(); checkPassword(); checkEmail(); checkPhone()

  const firstInvalid = document.querySelector('[aria-invalid="true"]')
  if (firstInvalid) {
    isError.value = true
    globalMsg.value = 'Please fix the highlighted fields.'
    await nextTick()
    firstInvalid.focus()
    return
  }

  try {
    submitting.value = true

    // sanitize free-text to prevent XSS
    const safeReason = DOMPurify.sanitize(model.value.reason || '', {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    })
    // (You can store safeReason later if needed)

    // Firebase registration (signs the user in)
    const cred = await createUserWithEmailAndPassword(
      auth,
      model.value.email.trim(),
      model.value.password
    )

    // Try sending email verification
    try {
      await sendEmailVerification(cred.user)
    } catch (err) {
      console.warn('Email verification error:', err)
    }

    // Inform users (SR + visual)
    globalMsg.value = 'Account created successfully. A verification email has been sent.'
    isError.value = false
    await nextTick()
    srAlert.value?.focus?.()

    // Sign out after register (keeps flow consistent)
    try { await signOut(auth) } catch (e) { console.warn('signOut after register failed:', e) }

    // Redirect to login
    router.replace('/FireLogin')
  } catch (e) {
    isError.value = true
    globalMsg.value = e?.message || 'Firebase Registration failed.'
    await nextTick()
    srAlert.value?.focus?.()
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
/* High-contrast focus ring for keyboard users */
:where(a, button, input, select, textarea, [tabindex]):focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}

/* Basic alerts (if you don't include Bootstrap alerts) */
.alert { padding: .75rem 1rem; border-radius: .5rem; margin-bottom: 1rem; }
.alert-danger { background:#fef2f2; color:#991b1b; border:1px solid #fee2e2; }
.alert-success { background:#ecfdf5; color:#065f46; border:1px solid #d1fae5; }
</style>
