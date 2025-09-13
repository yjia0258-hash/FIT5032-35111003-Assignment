<script setup>
import { computed } from 'vue'
import { getOverallStats, listAllRatings } from '../lib/rating'

// If you still need item list elsewhere, keep it. Otherwise you can delete it.
// const items = [...]

// Global aggregate (avg across all ratings + total count)
const overall = computed(() => getOverallStats())

// Raw rating matrix: { [itemId]: { [email]: value } }
const matrix = computed(() => listAllRatings())

// Collect all unique rater emails
const raterEmails = computed(() => {
  const m = matrix.value
  const set = new Set()
  for (const itemId of Object.keys(m)) {
    for (const email of Object.keys(m[itemId] || {})) set.add(email)
  }
  return Array.from(set).sort()
})

// Build a sorted item list from the matrix keys (optional, used to show per-user cells)
const items = computed(() =>
  Object.keys(matrix.value).map(id => ({ id, title: id })) // title = id; change mapping if you keep a label map
)

// Per-user row stats (avg & count)
function userRowStats(email) {
  const m = matrix.value
  let sum = 0, count = 0
  for (const it of items.value) {
    const v = Number(m[it.id]?.[email])
    if (!Number.isNaN(v)) { sum += v; count += 1 }
  }
  return { avg: count ? sum / count : 0, count }
}

function wipe() {
  if (confirm('Clear ALL ratings?')) {
    localStorage.removeItem('demo_ratings_v1')
    alert('All ratings cleared.')
  }
}
</script>

<template>
  <div class="page-wrapper">
    <div class="page admin-page">
      <h2 class="title">Admin Panel</h2>

      <!-- Overall Average -->
      <section class="panel">
        <div class="panel__hd">
          <h3>Overall Average</h3>
          <button class="btn btn-danger" @click="wipe">Clear All Ratings</button>
        </div>
        <p class="overall">
          <strong>{{ overall.avg.toFixed(2) }}</strong> / 5
          <span class="muted"> ({{ overall.count }} ratings total)</span>
        </p>
      </section>

      <!-- Per-user Ratings -->
      <section class="panel">
        <div class="panel__hd">
          <h3>Per-user Ratings</h3>
        </div>

        <template v-if="raterEmails.length && items.length">
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th>User (email)</th>
                  <th v-for="it in items" :key="it.id">{{ it.title }}</th>
                  <th>Avg</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="email in raterEmails" :key="email">
                  <td class="email">{{ email }}</td>
                  <td v-for="it in items" :key="it.id" class="center">
                    {{ (matrix[it.id]?.[email] ?? '—') }}
                  </td>
                  <td class="center">{{ userRowStats(email).avg.toFixed(2) }}</td>
                  <td class="center">{{ userRowStats(email).count }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
        <p v-else class="muted">No user ratings yet.</p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.page-wrapper { 
  min-height:100vh; 
  display:flex; 
  justify-content:center; 
  align-items:center; 
  background:#f8f9fa; 
}
.page.admin-page { 
  max-width:1000px; 
  width:96%; 
  background:#fff; 
  border:1px solid #eee; 
  border-radius:12px;
   
  box-shadow:0 2px 10px rgba(0,0,0,.08); 
   
  padding:24px; 
  display:grid; 
  gap:20px; 
}
.title { 
  text-align:center; 
  margin:0 0 4px; 
}

.panel { 
  border:1px solid #eee; 
  border-radius:10px; 
  padding:16px; 
  display:grid; 
  gap:12px; 
}
.panel__hd { 
  display:flex; 
  align-items:center; 
  justify-content:space-between;
 }
.overall { 
  font-size:18px; 
}
.muted { 
  color:#777; 
}

.table-wrap { 
  overflow:auto; 
}
.table { 
  width:100%; 
  border-collapse:collapse; 
}
.table th, .table td { 
  border-bottom:1px solid #eee; 
  padding:8px; 
  text-align:left; 
}
.table th:nth-child(n+2), .table td:nth-child(n+2) { 
  text-align:center; 
}
.email { 
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace; }
.center { 
  text-align:center; 
}

.btn { 
  padding:8px 12px; 
  border-radius:6px; 
  border:1px solid #ddd; 
  background:#fff; 
  cursor:pointer; 
}
.btn:hover { 
  background:#f7f7f7;
 }
.btn-danger { 
  border-color:#e74c3c; 
  color:#e74c3c; 
}
.btn-danger:hover { 
  background:#e74c3c; 
  color:#fff; 
  }
</style>
