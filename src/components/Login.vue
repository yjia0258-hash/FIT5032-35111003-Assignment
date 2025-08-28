<template>
  <main class="container mt-4">
    <div class="card shadow-sm">
      <div class="card-body">
        <h1 class="card-title text-center mb-2">Sign Up</h1>
        <p class="text-muted text-center mb-4">
          Please complete the fields below. Required fields are marked with “*”.
        </p>

  
        <form @submit.prevent="onSubmit" novalidate>
       
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
            </div>

            <!-- Reason -->
            <div class="mt-3">
              <label for="reason" class="form-label">Reason for joining</label>
              <textarea
                id="reason"
                class="form-control"
                rows="3"
                v-model.trim="model.reason"
              ></textarea>
            </div>
          </fieldset>

  
          <div class="d-flex justify-content-end gap-2">
            <button type="submit" class="btn btn-primary" :disabled="!canSubmit">Sign Up</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Load status -->
    <div class="card mt-3" v-if="loading || loadError">
      <div class="card-body">
        <h2 class="h5 mb-2">Users (from /public/data/USERS.json)</h2>
        <div v-if="loading">Loading…</div>
        <div v-else-if="loadError" class="text-danger">Failed to load: {{ loadError }}</div>
      </div>
    </div>

    <!-- Registered Users -->
    <div class="mt-3" v-if="hasSubmitted && cards.length">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h2 class="h5 m-0">Registered Users</h2>
        <button class="btn btn-outline-danger btn-sm" @click="clearAll">Clear All</button>
      </div>

      <div class="row g-3">
        <div class="col-md-4" v-for="(c, i) in cards" :key="i">
          <div class="card h-100">
            <div class="card-header fw-semibold">Registration Info</div>
            <ul class="list-group list-group-flush">
              <li class="list-group-item"><strong>Username:</strong> {{ c.username }}</li>
              <li class="list-group-item"><strong>Email:</strong> {{ c.email }}</li>
              <li class="list-group-item"><strong>Phone:</strong> {{ c.phone || '—' }}</li>
              <li class="list-group-item"><strong>Password:</strong> {{ c.password }}</li>
              <li class="list-group-item"><strong>Gender:</strong> {{ c.gender || '—' }}</li>
              <li class="list-group-item"><strong>Reason:</strong> {{ c.reason || '—' }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const hasSubmitted = ref(false)

const model = ref({
  username: '',
  password: '',
  email: '',
  phone: '',
  reason: '',
  gender: ''
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

const cards = ref([])

const loading = ref(false)
const loadError = ref('')

onMounted(async () => {
  try {
    loading.value = true
    const res = await fetch('/data/USERS.json')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    cards.value = Array.isArray(data)
      ? data.map(u => ({
          username: u.username ?? '',
          password: u.password ?? '',
          email: u.email ?? '',
          phone: u.phone ?? '',
          gender: u.gender ?? '',
          reason: u.reason ?? ''
        }))
      : []
  } catch (e) {
    loadError.value = String(e)
  } finally {
    loading.value = false
  }
})

try {
  const saved = localStorage.getItem('cards')
  if (saved) {
    const parsed = JSON.parse(saved)
    if (Array.isArray(parsed)) cards.value = parsed
  }
} catch {}

watch(cards, (v) => {
  try { localStorage.setItem('cards', JSON.stringify(v)) } catch {}
}, { deep: true })

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

let _nameTick = 0, _pwdTick = 0, _emailTick = 0, _phoneTick = 0
const checkNameDebounced = () => {
  const t = ++_nameTick
  setTimeout(() => t === _nameTick && touched.value.username && checkName(), 120)
}
const checkPasswordDebounced = () => {
  const t = ++_pwdTick
  setTimeout(() => t === _pwdTick && touched.value.password && checkPassword(), 120)
}
const checkEmailDebounced = () => {
  const t = ++_emailTick
  setTimeout(() => t === _emailTick && touched.value.email && checkEmail(), 120)
}
const checkPhoneDebounced = () => {
  const t = ++_phoneTick
  setTimeout(() => t === _phoneTick && touched.value.phone && checkPhone(), 120)
}

const markTouched = (key) => { touched.value[key] = true }

const canSubmit = computed(() =>
  !errs.value.username && !errs.value.password && !errs.value.email && !errs.value.phone &&
  model.value.username && model.value.password && model.value.email
)

const onSubmit = () => {
  touched.value = { username: true, password: true, email: true, phone: true }
  checkName(); checkPassword(); checkEmail(); checkPhone()
  if (!errs.value.username && !errs.value.password && !errs.value.email && !errs.value.phone) {
    cards.value.push({ ...model.value })
    hasSubmitted.value = true
    resetForm()
  }
}

const resetForm = () => {
  model.value = {
    username: '',
    password: '',
    email: '',
    phone: '',
    reason: '',
    gender: ''
  }
  errs.value = { username: null, password: null, email: null, phone: null }
  touched.value = { username: false, password: false, email: false, phone: false }
}

const clearAll = () => {
  cards.value = []
  localStorage.removeItem('cards')
  hasSubmitted.value = false
}
</script>
