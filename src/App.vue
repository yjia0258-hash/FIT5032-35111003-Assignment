<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'

// Firebase
import { auth } from '@/lib/firebase'        // If you don't have @ alias, use '../lib/firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'

const router = useRouter()
const route = useRoute()

// Current user from Firebase; only keep the fields you want to display in the UI
const me = ref(null)

// Listen for authentication state changes
let unsubscribe
onMounted(() => {
  unsubscribe = onAuthStateChanged(auth, (user) => {
    me.value = user
      ? { email: user.email ?? '', uid: user.uid } // You can extend with displayName, etc.
      : null
  })
})
onBeforeUnmount(() => {
  if (unsubscribe) unsubscribe()
})

// Paths where navigation should be hidden
const hideNavOn = ['/FireLogin', '/FireRegister']
const showNav = computed(() => !hideNavOn.includes(route.path))

// Optional: role management (update this with real Firestore/custom claims logic)
const isAdmin = computed(() => false)

// Logout user
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
    <!-- Show top navigation only if not on login/register -->
    <nav v-if="showNav" class="topbar">
      <div class="left">
        <!-- Home only visible if logged in -->
        <RouterLink v-if="me" class="btn ghost" to="/home">Home</RouterLink>

        <!-- Admin section (only shown if isAdmin is true) -->
        <RouterLink
          v-if="me && isAdmin"
          class="btn ghost danger"
          to="/admin"
        >
          Admin
        </RouterLink>
      </div>

      <div class="right">
        <span v-if="me" class="me">
          Hi, {{ me.email || me.uid }}
        </span>
        <button v-if="me" class="btn outline" @click="onLogout">Logout</button>
      </div>
    </nav>

    <main class="page">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.topbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-bottom: 1px solid #eee;
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

.page {
  flex: 1;
  padding: 16px;
}

.btn {
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}
.btn.ghost {
  background: transparent;
  border: 1px solid #ddd;
}
.btn.ghost:hover { background: #f6f6f6; }
.btn.outline {
  background: transparent;
  border: 1px solid #333;
  color: #333;
}
.btn.outline:hover { background: #333; color: #fff; }
.btn.danger { border-color: #e74c3c; color: #e74c3c; }
.btn.danger:hover { background: #e74c3c; color: #fff; }
</style>
