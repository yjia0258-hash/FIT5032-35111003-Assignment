<template>
  <main class="home-page">
    <section class="home-shell">
      <header class="home-head">
        <h1>Welcome</h1>

        <p v-if="user" class="user-line">
          Logged in as:
          <strong>{{ user.email }}</strong>
        </p>
      </header>

      <div class="home-card">
        <p class="mb-3">
          If you encounter any problems, please contact the administrator.
        </p>

        <div class="actions">
          <!-- D.2: Send Email page -->
          <button type="button" class="btn btn-primary" @click="goSendEmail">
            Send Email
          </button>
        </div>

        <p class="mb-3">
          You can find locations and make reservations.
        </p>
        <div class="actions">
          <!-- D.3: Tables page -->
          <button type="button" class="btn btn-outline-secondary" @click="goTables">
            View Tables
          </button>
        </div>

        <p class="mb-3">
          Map function
        </p>
        <div class="actions">
          <button type="button" class="btn btn-outline-secondary" @click="goMap">
            Open Map
          </button>
        </div>

        <p v-if="errorMsg" class="err">{{ errorMsg }}</p>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'

const user = ref(null)
const errorMsg = ref('')
const router = useRouter()

let stop
onMounted(() => {
  stop = onAuthStateChanged(auth, (u) => {
    if (u) {
      user.value = u
      errorMsg.value = ''
    } else {
      router.replace('/FireLogin')
    }
  })
})

onBeforeUnmount(() => {
  if (stop) stop()
})

function goSendEmail() {
  router.push('/EmailSend')
}

function goTables() {
  router.push('/tables')
}

function goMap() {
  router.push('/map')
}

async function logout() {
  errorMsg.value = ''
  try {
    await signOut(auth)
    router.replace('/FireLogin')
  } catch (e) {
    errorMsg.value = e?.message || 'Logout failed'
  }
}
</script>

<style scoped>
/* Page canvas: center the main section, give breathing room */
.home-page {
  min-height: 85vh;            /* elongated area */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: #f8fafc;         /* subtle page bg */
}

/* Main shell: clean card-like container */
.home-shell {
  width: 100%;
  max-width: 920px;             /* roomy */
  background: #fff;
  border: 1px solid #e5e7eb;    /* light gray */
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

/* Header */
.home-head h1 {
  margin: 0 0 8px;
  text-align: center; 
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
}
.user-line { margin: 0 0 4px; color: #374151; font-size: 0.95rem; }

/* Content card area */
.home-card {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
  padding: 16px;
  margin-top: 12px;
}
.home-card p { margin: 0 0 8px; color: #374151; font-size: 0.95rem; }

/* Actions row */
.actions {
  display: flex;
  align-items: center;
  gap: 10px;          /* spacing between buttons */
  margin-top: 4px;
}

/* Buttons: small polish on top of Bootstrap */
.btn {
  font-weight: 600;
  border-radius: 8px;
  padding: 8px 14px;
}
.btn-primary {
  background: #3b82f6;      /* blue-500 */
  border-color: #3b82f6;
}
.btn-primary:hover,
.btn-primary:focus {
  background: #2563eb;      /* blue-600 */
  border-color: #2563eb;
}
.btn-outline-secondary {
  border-color: #d1d5db;    /* gray-300 */
  color: #374151;           /* gray-700 */
  background: #fff;
}
.btn-outline-secondary:hover,
.btn-outline-secondary:focus {
  border-color: #9ca3af;    /* gray-400 */
  background: #f9fafb;      /* gray-50 */
}

/* Error text */
.err { color: #b91c1c; margin-top: 10px; }

/* Responsive tweaks */
@media (max-width: 576px) {
  .home-shell {
    padding: 18px;
    border-radius: 12px;
  }
  .home-head h1 { font-size: 1.5rem; }
}
</style>
