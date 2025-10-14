<template>
  <main class="container py-3" style="max-width:880px">
    <h2 class="mb-3">Interactive Tables — Places & Bookings</h2>

    <!-- Table A: Places -->
    <section class="table-section">
      <DataTable
        :title="`Table A — Places (${places.length})`"
        :columns="placeCols"
        :rows="places"
      />
    </section>

    <!-- Table B: Bookings -->
    <section class="table-section">
      <DataTable
        :title="`Table B — Bookings (${bookings.length})`"
        :columns="bookingCols"
        :rows="bookings"
      />
    </section>

    <p v-if="err" class="text-danger small mt-2 mb-0">{{ err }}</p>
  </main>
</template>

<script setup>
// DataTables-powered generic table
import DataTable from '@/components/DataTable.vue'
import { ref, onMounted } from 'vue'

/**
 * Columns MUST match your JSON keys exactly.
 * places.json has: place_id, name, category, city, address, ratings, open_now
 * bookings.json has: booking_id, customer_name, place_name, date, time, party_size, status
 */
const placeCols = [
  { key: 'place_id',  label: 'ID' },
  { key: 'name',      label: 'Name' },
  { key: 'category',  label: 'Category' },
  { key: 'city',      label: 'City' },
  { key: 'address',   label: 'Address' },
  { key: 'ratings',   label: 'Rating' },   // IMPORTANT: your JSON is "ratings"
  { key: 'open_now',  label: 'Open?' }
]

const bookingCols = [
  { key: 'booking_id',    label: 'Booking ID' },
  { key: 'customer_name', label: 'Customer' },
  { key: 'place_name',    label: 'Place' },
  { key: 'date',          label: 'Date' },
  { key: 'time',          label: 'Time' },
  { key: 'party_size',    label: 'Party' },
  { key: 'status',        label: 'Status' }
]

// Table data
const places   = ref([])
const bookings = ref([])
const err      = ref('')

// Helper: clean weird "Syntax error in formula ..." addresses from your Mockaroo output
function cleanAddress(a, city) {
  const s = String(a ?? '')
  if (s.startsWith('Syntax error in formula')) {
    return `${city} City Center`
  }
  return s
}

// Helper: normalize status (null/empty -> 'unknown')
function normStatus(s) {
  const v = (s ?? '').toString().trim()
  return v ? v : 'unknown'
}

onMounted(async () => {
  try {
    const [p, b] = await Promise.all([
      fetch('/mock/places.json').then(r => r.json()),
      fetch('/mock/booking.json').then(r => r.json())
    ])

    // Sanitize Places: fix address, keep other fields
    places.value = Array.isArray(p)
      ? p.map(row => ({
          ...row,
          address: cleanAddress(row.address, row.city)
        }))
      : []

    // Normalize Bookings: status -> 'unknown' if null/empty
    bookings.value = Array.isArray(b)
      ? b.map(row => ({
          ...row,
          status: normStatus(row.status)
        }))
      : []

    // Debug (optional)
    // console.log('places length:', places.value.length)
    // console.log('bookings length:', bookings.value.length)

    if (!places.value.length || !bookings.value.length) {
      err.value = 'Loaded mock JSON but arrays are empty. Check files under /public/mock/.'
    }
  } catch (e) {
    err.value = 'Failed to load /mock/places.json or /mock/bookings.json.'
  }
})
</script>

<style scoped>
/* Stable spacing between two cards */
.table-section {
  margin-bottom: 28px;
}

/* Optional: let main breathe a bit with wider layout */
h2.mb-3 {
  line-height: 1.25;
  letter-spacing: .2px;
}
</style>
