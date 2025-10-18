<template>
  <main class="container py-3" style="max-width:960px">
    <header class="d-flex align-items-center justify-content-between mb-3">
      <h2 class="m-0">Charts</h2>
      <button type="button" class="btn btn-outline-secondary" @click="goBack" aria-label="Back to tables">
        Back
      </button>
    </header>

    <section class="card shadow-sm mb-3">
      <div class="card-body">
        <h3 class="h5 mb-3">Bookings in the last 14 days</h3>
    
        <p id="line-desc" class="visually-hidden">
          Line chart showing number of bookings per day over the last fourteen days.
        </p>
        <canvas
          ref="lineEl"
          role="img"
          aria-labelledby="line-desc"
          aria-label="Line chart of bookings in the last 14 days"
          height="120"
        ></canvas>
      </div>
    </section>

    <section class="card shadow-sm">
      <div class="card-body">
        <h3 class="h5 mb-3">Top places (by bookings)</h3>
        <p id="bar-desc" class="visually-hidden">
          Bar chart showing the most popular places by number of bookings.
        </p>
        <canvas
          ref="barEl"
          role="img"
          aria-labelledby="bar-desc"
          aria-label="Bar chart of top places by number of bookings"
          height="120"
        ></canvas>
      </div>
    </section>

    <p v-if="err" class="text-danger small mt-3 mb-0">{{ err }}</p>
  </main>
</template>

<script setup>
// Vue
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

// Chart.js
import Chart from 'chart.js/auto'

const router = useRouter()
const goBack = () => router.back()

// Refs for canvases
const lineEl = ref(null)
const barEl  = ref(null)

// Chart instances 
let lineChart = null
let barChart  = null

// Error state
const err = ref('')


function lastNDaysLabels(n = 14) {
  const out = []
  const d = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const t = new Date(d)
    t.setDate(d.getDate() - i)
    const label = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
    out.push(label)
  }
  return out
}


function countByDate(rows, labels) {
  const map = Object.fromEntries(labels.map(l => [l, 0]))
  rows.forEach(r => {
    const k = String(r.date || '').slice(0, 10)
    if (k in map) map[k]++
  })
  return labels.map(l => map[l])
}

function topPlaces(rows, topN = 8) {
  const counts = new Map()
  rows.forEach(r => {
    const name = (r.place_name ?? '').toString().trim() || 'Unknown'
    counts.set(name, (counts.get(name) || 0) + 1)
  })
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, topN)
  return {
    labels: sorted.map(([name]) => name),
    values: sorted.map(([, cnt]) => cnt)
  }
}

onMounted(async () => {
  try {
 
    const rows = await fetch('/mock/booking.json').then(r => r.json())

    const labels14 = lastNDaysLabels(14)
    const counts14 = countByDate(Array.isArray(rows) ? rows : [], labels14)
    if (lineChart) lineChart.destroy()
    lineChart = new Chart(lineEl.value, {
      type: 'line',
      data: {
        labels: labels14,
        datasets: [{
          label: 'Bookings',
          data: counts14,
          borderWidth: 2,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: true }
        },
        scales: {
          x: { ticks: { autoSkip: true, maxTicksLimit: 7 } },
          y: { beginAtZero: true, precision: 0 }
        }
      }
    })

  
    const top = topPlaces(Array.isArray(rows) ? rows : [], 8)
    if (barChart) barChart.destroy()
    barChart = new Chart(barEl.value, {
      type: 'bar',
      data: {
        labels: top.labels,
        datasets: [{
          label: 'Bookings',
          data: top.values
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: { legend: { display: true } },
        scales: { y: { beginAtZero: true, precision: 0 } }
      }
    })
  } catch (e) {
    err.value = 'Failed to load /mock/booking.json or render charts.'
 
  }
})

onBeforeUnmount(() => {
  if (lineChart) lineChart.destroy()
  if (barChart) barChart.destroy()
})
</script>

<style scoped>
.visually-hidden {
  position: absolute !important;
  height: 1px; width: 1px;
  overflow: hidden; clip: rect(1px, 1px, 1px, 1px);
  white-space: nowrap; border: 0; padding: 0; margin: -1px;
}
</style>
