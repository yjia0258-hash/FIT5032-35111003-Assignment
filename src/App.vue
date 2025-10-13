<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute, RouterLink, RouterView } from 'vue-router'

// Firebase
import { auth } from '@/lib/firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'

const router = useRouter()
const route = useRoute()

// Keep minimal user info for header
const me = ref(null)

// Listen to auth changes
let unsubscribe
onMounted(() => {
  unsubscribe = onAuthStateChanged(auth, (user) => {
    me.value = user ? { email: user.email ?? '', uid: user.uid } : null
  })
})
onBeforeUnmount(() => { unsubscribe && unsubscribe() })

// Hide top nav on these routes
const hideNavOn = ['/FireLogin', '/FireRegister']
const showNav = computed(() => !hideNavOn.includes(route.path))

// (Optional) role, integrate with claims/Firestore if needed
const isAdmin = computed(() => false)

// Logout
async function onLogout() {
  try {
    await signOut(auth)
  } finally {
    me.value = null
    router.push('/FireLogin')
  }
}
</script>

<template>
  <div class="app-container">
    <!-- Top navigation (hidden on login/register) -->
    <nav v-if="showNav" class="topbar">
      <div class="left">
        <!-- Visible only after sign-in -->
        <template v-if="me">
          <RouterLink to="/home" class="btn ghost">Home</RouterLink>
          <RouterLink to="/EmailSend" class="btn ghost">Send Email</RouterLink>
          <RouterLink to="/tables" class="btn ghost">Tables</RouterLink>
          <RouterLink
            v-if="isAdmin"
            to="/admin"
            class="btn ghost danger"
          >
            Admin
          </RouterLink>
        </template>
      </div>

      <div class="right">
        <span v-if="me" class="me">Hi, {{ me.email || me.uid }}</span>
        <button v-if="me" class="btn outline" @click="onLogout">Logout</button>
      </div>
    </nav>

    <!-- Page body -->
    <main class="page">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
/* Layout */
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.page {
  flex: 1;
  padding: 16px;
  background: #f8fafc; /* subtle background */
}

/* Topbar */
.topbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #fff;
}
.topbar .left { display: flex; gap: 8px; }
.topbar .right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 10px;
}
.me { font-size: 14px; color: #555; }

/* Buttons */
.btn {
  border: 1px solid transparent;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  background: #fff;
  color: #111827;
  transition: background .15s, color .15s, border-color .15s;
}
.btn.ghost {
  background: transparent;
  border-color: #d1d5db; /* gray-300 */
}
.btn.ghost:hover { background: #f3f4f6; } /* gray-100 */
.btn.outline {
  background: transparent;
  border-color: #111827;
  color: #111827;
}
.btn.outline:hover { background: #111827; color: #fff; }
.btn.danger { border-color: #e74c3c; color: #e74c3c; }
.btn.danger:hover { background: #e74c3c; color: #fff; }
</style>
