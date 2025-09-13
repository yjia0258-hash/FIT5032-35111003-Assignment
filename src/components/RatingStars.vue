<template>
  <div class="rating">
    <div class="stars" role="radiogroup" aria-label="Rating 1 to 5">
      <button
        v-for="n in 5"
        :key="n"
        class="star"
        :class="{ active: n <= current }"
        :aria-checked="n === current"
        role="radio"
        @click="onRate(n)"
        :title="`Rate ${n}`"
      >★</button>
    </div>

    <div class="meta">
      <span class="avg">Avg: {{ avgLabel }}</span>
      <span class="count">({{ stats.count }} ratings)</span>
      <span v-if="userEmail" class="mine">Your rating: {{ current || '—' }}</span>
      <span v-else class="hint">Login to rate</span>
    </div>
  </div>
</template>

<script setup>
import { ref, watchEffect, computed } from 'vue'
import { getCurrentUser } from '../lib/auth-local'
import { getItemStats, getUserRating, rateItem } from '../lib/rating'

const props = defineProps({
  itemId: { type: String, required: true }
})

const stats = ref({ avg: 0, count: 0 })
const current = ref(0)
const userEmail = getCurrentUser()?.email || null

function refresh() {
  stats.value = getItemStats(props.itemId)
  current.value = userEmail ? getUserRating(props.itemId, userEmail) : 0
}

function onRate(n) {
  if (!userEmail) {
    alert('Please login to rate.')
    return
  }
  try {
    rateItem(props.itemId, userEmail, n)
    refresh()
  } catch (e) {
    alert(e?.message || 'Failed to rate.')
  }
}

watchEffect(refresh)

const avgLabel = computed(() =>
  stats.value.count ? stats.value.avg.toFixed(2) : '—'
)
</script>

<style scoped>
.rating { display:inline-flex; flex-direction:column; gap:6px; align-items:center; text-align:center; }
.stars { display:inline-flex; gap:6px; }
.star { font-size:28px; line-height:1; background:transparent; border:none; cursor:pointer; opacity:.5; transition:transform .08s, opacity .1s; }
.star:hover { transform:scale(1.1); opacity:.9; }
.star.active { color:#ffb400; opacity:1; }
.meta { display:flex; gap:8px; font-size:14px; color:#555; }
.meta .avg { font-weight:600; }
.meta .mine { color:#007bff; }
</style>
