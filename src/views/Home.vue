<template>
  <div class="home-wrapper">
    <h1>Welcome!</h1>
    <p v-if="user">Logged in as: {{ user.email }}</p>
    <button @click="logout">Logout</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'

const user = ref(null)
const router = useRouter()

onMounted(() => {
  onAuthStateChanged(auth, (u) => {
    if (u) {
      user.value = u
    } else {
      router.replace('/FireLogin') // 如果未登录，跳回登录
    }
  })
})

async function logout() {
  await signOut(auth)
  router.replace('/FireLogin')
}
</script>
