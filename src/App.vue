<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getCurrentUser, logoutUser } from './lib/auth-local'  

const router = useRouter()
const route = useRoute()
const me = ref(getCurrentUser())


router.afterEach(() => {
  me.value = getCurrentUser()
})


const hideNavOn = ['/login', '/register']
const showNav = computed(() => !hideNavOn.includes(route.path))

function onLogout() {
  logoutUser()
  me.value = null
  router.push('/login')
}
</script>

<template>
  <div class="app-container">
    
    <nav v-if="showNav" class="topbar">
      <div class="left">
     
        <RouterLink class="btn ghost" to="/home">Home</RouterLink>
        
        <RouterLink
          v-if="me && me.role === 'admin'"
          class="btn ghost danger"
          to="/admin"
        >Admin</RouterLink>
      </div>

      <div class="right">
        <span v-if="me" class="me">Hi, {{ me.username || me.email }} ({{ me.role }})</span>
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
.btn.ghost:hover {
   background: #f6f6f6; 
  }
.btn.outline {
  background: transparent;
  border: 1px solid #333;
  color: #333;
}
.btn.outline:hover { 
  background: #333; color: #fff; 
}
.btn.danger {
   border-color: #e74c3c; color: #e74c3c;
   }
.btn.danger:hover {
   background: #e74c3c; color: #fff; 
   }
</style>
