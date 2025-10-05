<script setup>
// Admin dashboard (ratings removed). Add your admin logic here if needed.
// You can import and define other admin-related data/functions here later.
</script>

<template>
  <div class="page-wrapper">
    <div class="page admin-page">
      <h2 class="title">Admin Panel</h2>

      <!-- Panel: Overview (placeholder after removing ratings) -->
      <section class="panel">
        <div class="panel__hd">
          <h3>Overview</h3>
        </div>
        <p class="overall">
          No metrics available. (Ratings feature removed)
        </p>
      </section>

      <!-- Panel: Placeholder for future admin content -->
      <section class="panel">
        <div class="panel__hd">
          <h3>Management</h3>
        </div>
        <p class="muted">
          Add your admin tools, reports, or settings here.
        </p>
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
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace; 
}
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
