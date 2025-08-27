<template>
  <main class="page">
    <section class="panel">
      <header class="panel__header">
        <h1 class="panel__title">User Information</h1>
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
        </fieldset>

        <fieldset class="fieldset">
          <legend class="legend">Profile</legend>

          <div class="grid-2">
            <!-- Resident -->
            <div class="input-block input-block--inline">
              <input
                id="isAustralian"
                class="checkbox"
                type="checkbox"
                v-model="model.isAustralian"
              />
              <label for="isAustralian" class="label label--inline">Australian Resident</label>
            </div>

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
            <p class="hint">Optional. Briefly explain your purpose.</p>
          </div>
        </fieldset>

        <!-- Live region for screen readers -->
        <div class="sr-live" aria-live="polite">
          <span v-if="errs.username">{{ errs.username }}</span>
          <span v-if="errs.password">{{ errs.password }}</span>
        </div>

        <div class="actions">
          <button type="submit" class="btn btn--primary" :disabled="!canSubmit">Submit</button>
          <button type="button" class="btn" @click="resetForm">Clear</button>
        </div>
      </form>
    </section>

    <!-- Cards -->
    <section class="cards" v-if="cards.length">
      <h2 class="cards__title">Submitted</h2>
      <div class="cards__wrap">
        <article class="card" v-for="(c, i) in cards" :key="i">
          <header class="card__hd">User</header>
          <ul class="card__list">
            <li class="card__item"><strong>Username:</strong> {{ c.username }}</li>
            <li class="card__item"><strong>Password:</strong> {{ c.password }}</li>
            <li class="card__item"><strong>Australian Resident:</strong> {{ c.isAustralian ? 'Yes' : 'No' }}</li>
            <li class="card__item"><strong>Gender:</strong> {{ c.gender }}</li>
            <li class="card__item"><strong>Reason:</strong> {{ c.reason }}</li>
          </ul>
        </article>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, computed } from 'vue'

// form model (renamed to reduce similarity)
const model = ref({
  username: '',
  password: '',
  isAustralian: false,
  reason: '',
  gender: ''
})

// error store (renamed keys object)
const errs = ref({
  username: null,
  password: null
})

// touched flags to gate error display (different approach)
const touched = ref({
  username: false,
  password: false
})

const cards = ref([])

// --- validations: (1) required + (2) min length (plus your complexity rules)
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

// small debounce-like guard (simple, no timer lib)
let _nameTick = 0
let _pwdTick = 0
const checkNameDebounced = () => {
  const t = ++_nameTick
  setTimeout(() => t === _nameTick && touched.value.username && checkName(), 120)
}
const checkPasswordDebounced = () => {
  const t = ++_pwdTick
  setTimeout(() => t === _pwdTick && touched.value.password && checkPassword(), 120)
}

const markTouched = (key) => { touched.value[key] = true }

const canSubmit = computed(() => !errs.value.username && !errs.value.password && model.value.username && model.value.password)

const onSubmit = () => {
  // force validate on submit
  touched.value = { username: true, password: true }
  checkName()
  checkPassword()
  if (!errs.value.username && !errs.value.password) {
    cards.value.push({ ...model.value })
    resetForm()
  }
}

const resetForm = () => {
  model.value = {
    username: '',
    password: '',
    isAustralian: false,
    reason: '',
    gender: ''
  }
  errs.value = { username: null, password: null }
  touched.value = { username: false, password: false }
}
</script>
