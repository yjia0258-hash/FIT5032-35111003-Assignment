<template>
  <div class="card dt-card">
    <div v-if="title" class="card-header fw-semibold dt-card-header">
      {{ title }}
    </div>

    <div class="card-body dt-card-body">
      <div class="table-responsive">
        <table ref="tableRef" class="table table-striped table-bordered align-middle w-100">
          <thead>
            <!-- Header labels -->
            <tr>
              <th v-for="c in columns" :key="c.key">{{ c.label }}</th>
            </tr>
            <!-- Per-column search inputs -->
            <tr class="column-filters">
              <th v-for="c in columns" :key="c.key">
                <input
                  v-if="c.searchable !== false"
                  type="search"
                  class="form-control form-control-sm"
                  :placeholder="`Search ${c.label}`"
                />
              </th>
            </tr>
          </thead>

      
          <tbody></tbody>
        </table>
      </div>

      <div class="d-flex flex-wrap gap-2 align-items-center justify-content-between mt-2">
        <small class="text-muted">
          * 10 rows/page · sorting · global & per-column search
        </small>
      </div>
    </div>
  </div>
</template>

<script setup>

import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import $ from 'jquery'
import 'datatables.net'
import 'datatables.net-bs5'

const props = defineProps({
  title:   { type: String, default: '' },
  columns: { type: Array, required: true },
  rows:    { type: Array, required: true }
})

const tableRef = ref(null)
let dt = null

onMounted(() => {
  const $el = $(tableRef.value)


  const dtColumns = (props.columns || []).map((c) => ({
    data: c.key,
    title: c.label,
    orderable: c.sortable === false ? false : true
  }))

  dt = $el.DataTable({
    // Place filter top-right, info left & pager right at bottom
    dom:
      "<'row align-items-center gx-2 mb-2'<'col-sm-6'i><'col-sm-6 text-sm-end'f>>" +
      'rt' +
      "<'row align-items-center mt-2'<'col-sm-5'i><'col-sm-7 text-sm-end'p>>",

    data: props.rows || [],
    columns: dtColumns,
    paging: true,
    pageLength: 10,
    lengthChange: false,
    responsive: true,
    searching: true,         
    orderCellsTop: true,
    autoWidth: false,
    deferRender: true,
    language: {
      search: '',
      searchPlaceholder: 'Global search…',
      info: '_START_–_END_ of _TOTAL_',
      infoEmpty: '0 results',
      zeroRecords: 'No matching records',
      paginate: { previous: '‹', next: '›' }
    }
  })

 
  dt.columns().every(function (colIdx) {
    const $input = $(tableRef.value)
      .find('thead tr.column-filters th')
      .eq(colIdx)
      .find('input')
    if ($input.length) {
      $input.on('keyup change', function () {
        dt.column(colIdx).search(this.value).draw()
      })
    }
  })
})

onBeforeUnmount(() => {
  if (dt) { dt.destroy(); dt = null }
})

// When props.rows changes, refresh table data
watch(
  () => props.rows,
  (newRows) => {
    if (!dt) return
    dt.clear()
    dt.rows.add(newRows || [])
    dt.draw(false)
  },
  { deep: true }
)
</script>

<style scoped>

.dt-card{
  border: 1px solid #fff;
  border-radius: 14px;
  box-shadow: 0 6px 20px rgba(0,0,0,.04);
  background: #fff;
}
.dt-card-header{
  background: linear-gradient(180deg,#fff 0%, #fff 100%);
  border-bottom: 1px solid #eef0f4 !important;
  padding: .75rem 1rem;
  font-size: .95rem;
}
.dt-card-body{
  padding: .9rem 1rem 1rem;
}


.table{ font-size: .94rem; }
.table thead th{
  background: #fff;
  border-bottom: 1px solid #eef0f4;
  white-space: nowrap;
}
.table tbody td{ border-top: 1px solid #f2f3f7; }
.table tbody tr:hover{ background: #fafbff !important; }
th, td{
  padding: .5rem .6rem !important;
  vertical-align: middle !important;
}


.column-filters th{
  padding: .25rem .5rem !important;
  background: #fbfcfe;
  border-bottom: 1px solid #eef0f4;
}
.column-filters input{
  min-width: 120px;
  border-radius: 8px;
  height: 30px;
  font-size: .85rem;
}


:deep(.dataTables_wrapper .dataTables_filter){ margin: 0; }
:deep(.dataTables_wrapper .dataTables_filter label){ width: 100%; }
:deep(.dataTables_wrapper .dataTables_filter input){
  width: 100%;
  max-width: 260px;
  margin-left: 0 !important;
  border-radius: 10px;
  height: 32px;
  padding: .25rem .5rem .25rem 2rem;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' fill='none' viewBox='0 0 24 24' stroke='%2399A3AE' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='7'/%3E%3Cpath d='M21 21l-3.5-3.5'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: .5rem center;
  background-size: 14px;
}
:deep(.dataTables_wrapper .dataTables_info){
  padding-top: .25rem !important;
  color: #6b7280;
}
:deep(.dataTables_wrapper .dataTables_paginate){ padding-top: .25rem !important; }
:deep(.dataTables_wrapper .paginate_button){
  border-radius: 8px !important;
  padding: .25rem .5rem !important;
  margin: 0 .125rem !important;
  border: 1px solid #e5e7eb !important;
  background: #fff !important;
  color: #0d6efd !important;
}
:deep(.dataTables_wrapper .paginate_button.current){
  background: #0d6efd !important;
  color: #fff !important;
  border-color: #0d6efd !important;
}


@media (max-width: 576px){
  .column-filters input{ min-width: 100px; }
}
</style>
