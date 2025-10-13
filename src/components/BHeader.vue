<template>
  <!-- Full-width header bar -->
  <div class="container-fluid bg-white border-bottom app-header">
    <header class="container d-flex justify-content-between align-items-center py-2">
      <!-- Left: navigation -->
      <ul class="nav nav-pills m-0">
        <!-- Always visible -->
        <li class="nav-item">
          <RouterLink to="/home" class="nav-link" active-class="active">Home</RouterLink>
        </li>

        <!-- Only when signed in -->
        <template v-if="signedIn">
          <li class="nav-item">
            <RouterLink to="/EmailSend" class="nav-link" active-class="active">Send Email</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink to="/tables" class="nav-link" active-class="active">Tables</RouterLink>
          </li>
        </template>

        <!-- Only when signed out -->
        <template v-else>
          <li class="nav-item">
            <RouterLink to="/FireLogin" class="nav-link" active-class="active">Firebase Login</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink to="/FireRegister" class="nav-link" active-class="active">Register</RouterLink>
          </li>
        </template>
      </ul>

      <!-- Right: user & actions -->
      <div class="d-flex align-items-center gap-2">
        <span v-if="signedIn" class="text-muted small me-1">
          {{ user?.email }}
        </span>

        <button
          v-if="signedIn"
          type="button"
          class="btn btn-outline-secondary btn-sm"
          @click="logout"
        >
          Logout
        </button>

        <RouterLink
          v-else
          to="/FireLogin"
          class="btn btn-outline-secondary btn-sm"
        >
          Login
        </RouterLink>
      </div>
    </header>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'

const router = useRouter()
const user = ref(null)
const signedIn = ref(false)

let unsub = null
onMounted(() => {
  unsub = onAuthStateChanged(auth, (u) => {
    user.value = u
    signedIn.value = !!u
  })
})
onBeforeUnmount(() => { unsub && unsub() })

async function logout() {
  try {
    await signOut(auth)
  } finally {
    router.replace('/FireLogin')
  }
}
</script>

<style scoped>
.app-header {
  position: sticky;   /* keep header visible on scroll */
  top: 0;
  z-index: 1030;
}

/* Make pills a bit tighter / cleaner */
.nav-link {
  padding: 6px 10px;
}
</style>
