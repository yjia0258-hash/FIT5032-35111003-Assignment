<template>
  <main class="page">
    <section class="panel">
      <header class="panel__header">
        <h1 class="panel__title">Sign Up</h1>
        <p class="panel__subtitle">Please complete the fields below. Required fields are marked with “*”.</p>
      </header>

      <form class="form" @submit.prevent="onSubmit" novalidate>
        <fieldset class="fieldset">
          <legend class="legend">Account</legend>

          <div class="grid-2">
            <!-- Username -->
            <div class="input-block">
              <label for="username" class="label">Username *</label>
              <input
                id="username"
                class="input"
                type="text"
                v-model.trim="model.username"
                @blur="markTouched('username'); checkName()"
                @input="checkNameDebounced()"
                :aria-invalid="!!errs.username || undefined"
                :aria-describedby="errs.username ? 'username-err' : undefined"
              />
              <p v-if="errs.username" id="username-err" class="error">{{ errs.username }}</p>
              <p class="hint">Minimum 3 characters.</p>
            </div>

            <!-- Password -->
            <div class="input-block">
              <label for="password" class="label">Password *</label>
              <input
                id="password"
                class="input"
                type="password"
                v-model="model.password"
                @blur="markTouched('password'); checkPassword()"
                @input="checkPasswordDebounced()"
                :aria-invalid="!!errs.password || undefined"
                :aria-describedby="errs.password ? 'password-err' : undefined"
              />
              <p v-if="errs.password" id="password-err" class="error">{{ errs.password }}</p>
              <p class="hint">At least 8 chars, include upper, lower, number & special.</p>
            </div>
          </div>

          <div class="grid-2">
            <!-- Email -->
            <div class="input-block">
              <label for="email" class="label">Email *</label>
              <input
                id="email"
                class="input"
                type="email"
                v-model.trim="model.email"
                @blur="markTouched('email'); checkEmail()"
                @input="checkEmailDebounced()"
                :aria-invalid="!!errs.email || undefined"
                :aria-describedby="errs.email ? 'email-err' : undefined"
              />
              <p v-if="errs.email" id="email-err" class="error">{{ errs.email }}</p>
              <p class="hint">Example: name@example.com</p>
            </div>

            <!-- Phone (optional) -->
            <div class="input-block">
              <label for="phone" class="label">Phone (optional)</label>
              <input
                id="phone"
                class="input"
                type="tel"
                v-model.trim="model.phone"
                @blur="markTouched('phone'); checkPhone()"
                @input="checkPhoneDebounced()"
                :aria-invalid="!!errs.phone || undefined"
                :aria-describedby="errs.phone ? 'phone-err' : undefined"
              />
              <p v-if="errs.phone" id="phone-err" class="error">{{ errs.phone }}</p>
              <p class="hint">Digits only, 8–15 characters if provided.</p>
            </div>
          </div>
        </fieldset>

        <fieldset class="fieldset">
          <legend class="legend">Profile</legend>

          <div class="grid-2">
            <!-- Gender -->
            <div class="input-block">
              <label for="gender" class="label">Gender</label>
              <select
                id="gender"
                class="select"
                v-model="model.gender"
              >
                <option value="" disabled>Select…</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <!-- Reason -->
          <div class="input-block">
            <label for="reason" class="label">Reason for joining</label>
            <textarea
              id="reason"
              class="textarea"
              rows="3"
              v-model.trim="model.reason"
            ></textarea>
          </div>
        </fieldset>

        <!-- Actions -->
        <div class="actions">
          <button type="submit" class="btn btn--primary" :disabled="!canSubmit">Sign Up</button>
        </div>
      </form>
    </section>

    <!-- Optional: fetch status (shows only when loading or error) -->
    <section class="panel" v-if="loading || loadError" style="margin-top: 12px;">
      <h2>Users (from /public/data/users.json)</h2>
      <div v-if="loading">Loading…</div>
      <div v-else-if="loadError" class="error">Failed to load: {{ loadError }}</div>
    </section>

    <!-- Cards (Dynamic Data render) -->
    <!-- Only show AFTER first successful submit in this session -->
    <section class="cards" v-if="hasSubmitted && cards.length">
      <div style="display:flex; justify-content: space-between; align-items:center; margin-bottom:8px;">
        <h2 class="cards__title">Registered Users</h2>
        <button class="btn btn-secondary" @click="clearAll">Clear All</button>
      </div>

      <div class="cards__wrap">
        <article class="card" v-for="(c, i) in cards" :key="i">
          <header class="card__hd">Registration Info</header>
          <ul class="card__list">
            <li class="card__item"><strong>Username:</strong> {{ c.username }}</li>
            <li class="card__item"><strong>Email:</strong> {{ c.email }}</li>
            <li class="card__item"><strong>Phone:</strong> {{ c.phone || '—' }}</li>
            <li class="card__item"><strong>Password:</strong> {{ c.password }}</li>
            <li class="card__item"><strong>Gender:</strong> {{ c.gender || '—' }}</li>
            <li class="card__item"><strong>Reason:</strong> {{ c.reason || '—' }}</li>
          </ul>
        </article>
      </div>
    </section>
  </main>
</template>

<script setup>
/**
 * Registration form with:
 * - Username/Password validations
 * - Email required + format
 * - Phone optional; digits 8–15 if present
 * - Dynamic list rendered from reactive array
 * - localStorage persistence
 * - Fetch seed from /public/data/USERS.json
 * - hasSubmitted flag to hide list until first successful submit
 * - NEW: clearAll() to empty list & localStorage
 */

import { ref, computed, onMounted, watch } from 'vue'

// Show list only after first successful submit in this session
const hasSubmitted = ref(false)

// Reactive form model
const model = ref({
  username: '',
  password: '',
  email: '',
  phone: '',
  reason: '',
  gender: ''
})

// Validation errors
const errs = ref({
  username: null,
  password: null,
  email: null,
  phone: null
})

// Touched flags
const touched = ref({
  username: false,
  password: false,
  email: false,
  phone: false
})

// Dynamic data list
const cards = ref([])

// Fetch state
const loading = ref(false)
const loadError = ref('')

// Seed from /public/data/USERS.json (can be an empty array)
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

// Restore from localStorage if exists
try {
  const saved = localStorage.getItem('cards')
  if (saved) {
    const parsed = JSON.parse(saved)
    if (Array.isArray(parsed)) cards.value = parsed
  }
} catch { /* ignore malformed storage */ }

// Persist to localStorage whenever cards change
watch(cards, (v) => {
  try { localStorage.setItem('cards', JSON.stringify(v)) } catch {}
}, { deep: true })

// ---- Validations ----
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

// Debounced validators (lightweight)
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

// Can submit only if required fields are valid
const canSubmit = computed(() =>
  !errs.value.username && !errs.value.password && !errs.value.email && !errs.value.phone &&
  model.value.username && model.value.password && model.value.email
)

// Submit handler
const onSubmit = () => {
  touched.value = { username: true, password: true, email: true, phone: true }
  checkName(); checkPassword(); checkEmail(); checkPhone()
  if (!errs.value.username && !errs.value.password && !errs.value.email && !errs.value.phone) {
    cards.value.push({ ...model.value })
    hasSubmitted.value = true           // show list from now on
    resetForm()
  }
}

// Reset form
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

// Clear all registrations and storage
const clearAll = () => {
  cards.value = []
  localStorage.removeItem('cards')
  hasSubmitted.value = false   // hide the list section again
}
</script>
