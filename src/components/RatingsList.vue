<template>
  <div class="ratings-list">
    <button class="btn-toggle" @click="open = !open">
      {{ open ? 'Hide' : 'Show' }} ratings ({{ entries.length }})
    </button>

    <div v-if="open" class="list">
      <div v-if="!entries.length" class="empty">No ratings yet.</div>
      <div v-for="(row, i) in entries" :key="i" class="row">
        <span class="who">{{ mask(row.email) }}</span>
        <span class="stars">{{ '★'.repeat(row.score) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getItemMap } from '../lib/rating' // 本地评分存储

const props = defineProps({ itemId: { type: String, required: true } })
const open = ref(false)

const entries = computed(() => {
  const map = getItemMap(props.itemId) // { [email]: score }
  return Object.entries(map).map(([email, score]) => ({ email, score: Number(score) }))
})

function mask(email) {
  const [name, domain] = email.split('@')
  if (!name || !domain) return email
  return `${name[0]}***@${domain}`
}
</script>

<style scoped>
.btn-toggle{margin-top:8px;padding:6px 10px;border-radius:6px;border:1px solid #ddd;background:#fff;cursor:pointer}
.list{margin-top:10px;border:1px solid #eee;border-radius:6px;padding:8px}
.row{display:flex;justify-content:space-between;padding:6px 4px;border-bottom:1px solid #f4f4f4}
.row:last-child{border-bottom:none}
.who{color:#555}
.stars{color:#ffb400}
.empty{color:#888;font-style:italic}
</style>
