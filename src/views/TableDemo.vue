<template>
  <main class="container py-3" style="max-width:880px">
    <!-- Title + Go to Charts -->
    <header class="d-flex align-items-center justify-content-between mb-3">
      <h2 class="m-0">Interactive Tables — Places & Bookings</h2>
      <button
        type="button"
        class="btn btn-outline-primary"
        @click="goCharts"
        aria-label="Open interactive charts page"
        title="Open Charts"
      >
        View Charts
      </button>
    </header>

    <!-- Table A: Places -->
    <section class="table-section">
 
      <div class="d-flex align-items-center justify-content-between mb-2 section-head">
        <h3 class="h5 m-0">Table A — Places ({{ places.length }})</h3>
        <div class="btn-group" role="group" aria-label="Places export actions">
          <button
            type="button"
            class="btn btn-outline-secondary btn-sm"
            @click="exportCSV('places')"
            :disabled="!places.length"
            aria-label="Export Places table as CSV"
          >
            Export CSV
          </button>
          <button
            type="button"
            class="btn btn-primary btn-sm"
            @click="exportPDF('places')"
            :disabled="!places.length"
            aria-label="Export Places table as PDF"
          >
            Export PDF
          </button>
        </div>
      </div>

      <DataTable
        :title="`Table A — Places (${places.length})`"
        :columns="placeCols"
        :rows="places"
      />
    </section>

    <!-- Table B: Bookings -->
    <section class="table-section">
      <!-- Export toolbar (accessible) -->
      <div class="d-flex align-items-center justify-content-between mb-2 section-head">
        <h3 class="h5 m-0">Table B — Bookings ({{ bookings.length }})</h3>
        <div class="btn-group" role="group" aria-label="Bookings export actions">
          <button
            type="button"
            class="btn btn-outline-secondary btn-sm"
            @click="exportCSV('bookings')"
            :disabled="!bookings.length"
            aria-label="Export Bookings table as CSV"
          >
            Export CSV
          </button>
          <button
            type="button"
            class="btn btn-primary btn-sm"
            @click="exportPDF('bookings')"
            :disabled="!bookings.length"
            aria-label="Export Bookings table as PDF"
          >
            Export PDF
          </button>
        </div>
      </div>

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
import { useRouter } from 'vue-router'              
// PDF libraries
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const router = useRouter()                          
const goCharts = () => router.push('/charts')        


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


function cleanAddress(a, city) {
  const s = String(a ?? '')
  if (s.startsWith('Syntax error in formula')) {
    return `${city} City Center`
  }
  return s
}

// Helper: normalize status
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

    // Normalize Bookings: status 
    bookings.value = Array.isArray(b)
      ? b.map(row => ({
          ...row,
          status: normStatus(row.status)
        }))
      : []

    if (!places.value.length || !bookings.value.length) {
      err.value = 'Loaded mock JSON but arrays are empty. Check files under /public/mock/.'
    }
  } catch (e) {
    err.value = 'Failed to load /mock/places.json or /mock/bookings.json.'
  }
})


function exportCSV(which) {
  const { cols, rows } = pickData(which)
  if (!rows.length) return

  const header = cols.map(c => c.label)
  const body = rows.map(r => cols.map(c => toCell(r[c.key])))

  const csv = [header, ...body]
    .map(line => line.map(csvCellEscape).join(','))
    .join('\r\n')

  // BOM for Excel UTF-8
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(blob, `${which}_export_${stamp()}.csv`)
}

/** Export PDF for the chosen dataset */
function exportPDF(which) {
  const { cols, rows } = pickData(which)
  if (!rows.length) return

  const head = [cols.map(c => c.label)]
  const body = rows.map(r => cols.map(c => toCell(r[c.key])))

  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })

  // Title
  doc.setFontSize(14)
  doc.text(`${prettyName(which)} — ${new Date().toLocaleString()}`, 40, 40)

  autoTable(doc, {
    head,
    body,
    startY: 60,
    styles: { fontSize: 10, cellPadding: 6, halign: 'left', valign: 'middle' },
    headStyles: { fillColor: [37, 99, 235] }, // subtle blue header
    didDrawPage: () => {
      const pageSize = doc.internal.pageSize
      const pageWidth = pageSize.getWidth()
      const pageNumber = doc.internal.getNumberOfPages()
      doc.setFontSize(9)
      doc.text(`Page ${pageNumber}`, pageWidth - 60, pageSize.getHeight() - 20)
    }
  })

  doc.save(`${which}_export_${stamp()}.pdf`)
}

/* ----- shared helpers for export ----- */

function pickData(which) {
  if (which === 'places')  return { cols: placeCols,   rows: places.value }
  if (which === 'bookings') return { cols: bookingCols, rows: bookings.value }
  return { cols: [], rows: [] }
}

function toCell(v) {
  if (v == null) return ''
  if (typeof v === 'boolean') return v ? 'Yes' : 'No'
  return String(v)
}

function csvCellEscape(val) {
  // Escape commas, quotes, and line breaks (RFC 4180)
  const needsQuotes = /[",\r\n]/.test(val)
  const out = val.replace(/"/g, '""')
  return needsQuotes ? `"${out}"` : out
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function stamp() {
  const pad = (n) => String(n).padStart(2, '0')
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`
}

function prettyName(which) {
  return which === 'places' ? 'Places Export' : 'Bookings Export'
}
</script>

<style scoped>
/* Stable spacing between two cards */
.table-section { margin-bottom: 28px; }

/* Optional: let main breathe a bit with wider layout */
h2.mb-3 { line-height: 1.25; letter-spacing: .2px; }

/* Align toolbar + title nicely on narrow widths */
.section-head { row-gap: .5rem; }
@media (max-width: 480px) {
  .section-head { flex-direction: column; align-items: flex-start !important; }
}
</style>
