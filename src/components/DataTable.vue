<template>
  <div class="datatable">
    <!-- Top bar: global search -->
    <div class="d-flex align-items-center justify-content-between mb-2 gap-2">
      <input
        v-model.trim="globalQuery"
        type="search"
        class="form-control form-control-sm"
        placeholder="Search all columns..."
        style="max-width: 320px"
        aria-label="Global search"
      />
      <button class="btn btn-outline-secondary btn-sm" @click="clearAllFilters">Clear filters</button>
    </div>

    <div class="table-responsive">
      <table class="table table-sm table-bordered align-middle mb-2">
        <thead>
          <!-- Sort header -->
          <tr class="table-light">
            <th
              v-for="col in columns"
              :key="col.key"
              :style="{ width: col.width || 'auto', cursor: col.sortable !== false ? 'pointer' : 'default' }"
              @click="col.sortable !== false && setSort(col.key)"
              scope="col"
            >
              <div class="d-flex align-items-center justify-content-between">
                <span>{{ col.label }}</span>
                <span v-if="sortKey === col.key" class="text-muted small">
                  {{ sortDir === 'asc' ? '▲' : '▼' }}
                </span>
              </div>
            </th>
          </tr>

          <!-- Column filters (per-column search) -->
          <tr>
            <th v-for="col in columns" :key="col.key">
              <input
                v-if="col.searchable !== false"
                v-model="columnFilters[col.key]"
                type="search"
                class="form-control form-control-sm"
                :placeholder="`Search ${col.label}`"
                @keydown.stop
              />
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="row in paginatedRows" :key="row.__rid">
            <td v-for="col in columns" :key="col.key">
              {{ formatCell(row[col.key]) }}
            </td>
          </tr>

          <tr v-if="paginatedRows.length === 0">
            <td :colspan="columns.length" class="text-center text-muted py-4">
              No data
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination (fixed 10 rows/page) -->
    <div class="d-flex align-items-center justify-content-between">
      <div class="small text-muted">
        Showing {{ startIndex + 1 }}–{{ endIndex }} of {{ filteredRows.length }}
      </div>

      <nav>
        <ul class="pagination pagination-sm mb-0">
          <li class="page-item" :class="{ disabled: page === 1 }">
            <button class="page-link" @click="goPrev" :disabled="page === 1">Prev</button>
          </li>

          <li
            v-for="p in pageCount"
            :key="p"
            class="page-item"
            :class="{ active: page === p }"
          >
            <button class="page-link" @click="goPage(p)">{{ p }}</button>
          </li>

          <li class="page-item" :class="{ disabled: page === pageCount }">
            <button class="page-link" @click="goNext" :disabled="page === pageCount">Next</button>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'

/**
 * Props:
 * - columns: [{ key: 'name', label: 'Name', searchable?: true, sortable?: true, width?: '160px' }]
 * - rows:    [{ name: 'Alice', age: 20, ... }]
 */
const props = defineProps({
  columns: { type: Array, required: true },
  rows: { type: Array, required: true }
})

/** Fixed page size = 10 (as per assignment requirement) */
const PAGE_SIZE = 10

/** Sort state */
const sortKey = ref(null)
const sortDir = ref('asc') // 'asc' | 'desc'

/** Global search & per-column filters */
const globalQuery = ref('')
const columnFilters = reactive({})

/** Pagination */
const page = ref(1)

/** Initialize column filters */
props.columns.forEach(c => {
  columnFilters[c.key] = ''
})

/** Internal: normalize rows with runtime id */
const normalizedRows = computed(() => {
  return (props.rows || []).map((r, idx) => ({ __rid: idx + '-' + (r.id ?? ''), ...r }))
})

/** Helpers */
function setSort(key) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'asc'
  }
  page.value = 1
}

function formatCell(val) {
  if (val == null) return ''
  return String(val)
}

function clearAllFilters() {
  globalQuery.value = ''
  Object.keys(columnFilters).forEach(k => (columnFilters[k] = ''))
  page.value = 1
}

const filteredRows = computed(() => {
  let data = normalizedRows.value

  // global search (OR across all visible columns)
  const q = globalQuery.value.trim().toLowerCase()
  if (q) {
    const keys = props.columns.map(c => c.key)
    data = data.filter(row =>
      keys.some(k => String(row[k] ?? '').toLowerCase().includes(q))
    )
  }

  // per-column filters (AND across each filled filter)
  for (const k of Object.keys(columnFilters)) {
    const v = (columnFilters[k] || '').trim().toLowerCase()
    if (v) {
      data = data.filter(row => String(row[k] ?? '').toLowerCase().includes(v))
    }
  }

  return data
})

const sortedRows = computed(() => {
  const key = sortKey.value
  if (!key) return filteredRows.value

  const dir = sortDir.value === 'asc' ? 1 : -1
  const copy = filteredRows.value.slice()
  copy.sort((a, b) => {
    const va = a[key]; const vb = b[key]
    if (va == null && vb == null) return 0
    if (va == null) return -1 * dir
    if (vb == null) return 1 * dir

    const sa = String(va).toLowerCase()
    const sb = String(vb).toLowerCase()
    if (sa < sb) return -1 * dir
    if (sa > sb) return 1 * dir
    return 0
  })
  return copy
})

/** Pagination derived values */
const pageCount = computed(() => Math.max(1, Math.ceil(sortedRows.value.length / PAGE_SIZE)))
const startIndex = computed(() => (page.value - 1) * PAGE_SIZE)
const endIndex = computed(() => Math.min(sortedRows.value.length, startIndex.value + PAGE_SIZE))
const paginatedRows = computed(() => sortedRows.value.slice(startIndex.value, endIndex.value))

/** Guard current page when filters/search change */
watch([filteredRows, sortedRows], () => {
  if (page.value > pageCount.value) page.value = pageCount.value
})

function goPrev() { if (page.value > 1) page.value-- }
function goNext() { if (page.value < pageCount.value) page.value++ }
function goPage(p) { page.value = p }
</script>

<style scoped>
.table { margin-bottom: .5rem; }
.pagination .page-link { cursor: pointer; }
</style>
