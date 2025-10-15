<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute, RouterLink, RouterView } from 'vue-router'

// Firebase
import { auth } from '@/lib/firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'

const router = useRouter()
const route = useRoute()

// Minimal user info for header
const me = ref(null)

// Listen to auth changes
let unsubscribe = null
onMounted(() => {
  unsubscribe = onAuthStateChanged(auth, (user) => {
    me.value = user ? { email: user.email ?? '', uid: user.uid } : null
  })
})
onBeforeUnmount(() => { if (unsubscribe) unsubscribe() })

// Hide top nav on these routes
const hideNavOn = ['/FireLogin', '/FireRegister']
const showNav = computed(() => !hideNavOn.includes(route.path))

// (Optional) role, integrate with claims/Firestore if needed
const isAdmin = computed(() => false)

// Logout
async function onLogout() {
  try { await signOut(auth) } finally {
    me.value = null
    router.push('/FireLogin')
  }
}
</script>

<template>
  <div class="app">
    <!-- Top navigation (hidden on login/register) -->
    <header v-if="showNav" class="topbar">
      <div class="topbar__inner">
        <nav class="nav-left">
          <template v-if="me">
            <RouterLink to="/home" class="btn ghost" exact>Home</RouterLink>
            <RouterLink to="/EmailSend" class="btn ghost">Send Email</RouterLink>
            <RouterLink to="/tables" class="btn ghost">Tables</RouterLink>
            <RouterLink v-if="isAdmin" to="/admin" class="btn ghost danger">Admin</RouterLink>
          </template>
        </nav>

        <div class="nav-right">
          <span v-if="me" class="me">Hi, {{ me.email || me.uid }}</span>
          <button v-if="me" class="btn outline" @click="onLogout">Logout</button>
        </div>
      </div>
    </header>

    <!-- Page body -->
    <main class="page">
      <div class="page__inner">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<style scoped>
/* ===== Layout ===== */
.app{
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8fafc; /* subtle app bg */
}

/* Sticky topbar with centered content */
.topbar{
  position: sticky; 
  top: 0;
  z-index: 1020;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 0 rgba(17,24,39,0.04);
}
.topbar__inner{
  max-width: 1100px;  
  margin: 0 auto;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.nav-left{
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.nav-right{
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 10px;
}
.me{ font-size: 14px; color: #555; }

.page{
  flex: 1;
}
.page__inner{
  max-width: 960px;    
  padding: 16px;
  margin: 0 auto;
}

/* Buttons */
.btn{
  border: 1px solid transparent;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  background: #fff;
  color: #111827;
  transition: background .15s, color .15s, border-color .15s, box-shadow .15s;
}
.btn.ghost{
  background: transparent;
  border-color: #d1d5db; /* gray-300 */
}
.btn.ghost:hover{ background: #f3f4f6; }
.btn.outline{
  background: transparent;
  border-color: #111827;
  color: #111827;
}
.btn.outline:hover{
  background: #111827;
  color: #fff;
}
.btn.danger{
  border-color: #e74c3c;
  color: #e74c3c;
}
.btn.danger:hover{
  background: #e74c3c;
  color: #fff;
}

/* Active route highlight */
:deep(a.router-link-exact-active.btn.ghost){
  border-color: #0d6efd;
  color: #0d6efd;
  box-shadow: 0 0 0 2px rgba(13,110,253,0.12);
}

/* Keyboard focus visible */
.btn:focus-visible, :deep(a.btn:focus-visible){
  outline: none;
  box-shadow: 0 0 0 3px rgba(13,110,253,0.35);
}

/* Mobile tweaks */
@media (max-width: 640px){
  .topbar__inner{ padding: 8px 12px; gap: 8px; }
  .btn{ padding: 6px 10px; }
  .page__inner{ padding: 12px; }
}
</style>
