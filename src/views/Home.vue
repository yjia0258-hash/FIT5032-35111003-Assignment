<template>
  <div class="page-wrapper">
    <div class="page">
      <h2>User Home</h2>
      <p>Welcome! This page is available to any authenticated user.</p>

      <!-- Jump to ratings -->
      <RouterLink to="/reviews" class="btn-primary">Go to Ratings</RouterLink>
    </div>
  </div>
</template>

<script setup>
// nothing needed
</script>

<style scoped>
.page-wrapper { 
    display:flex; 
    justify-content:center; 
    align-items:center; 
    min-height:100vh; 
    background:#f8f9fa; }
.page { 
    max-width:600px; 
    padding:24px; 
    background:#fff; 
    border-radius:8px; 
    border:1px solid #eee; 
    box-shadow:0 2px 10px rgba(0,0,0,.08); 
    text-align:center; }
.btn-primary { 
    display:inline-block; 
    padding:10px 16px;
     border-radius:6px; 
     background:#007bff; 
     color:#fff; 
     text-decoration:none; 
     font-weight:600; }
.btn-primary:hover { 
    opacity:.9; 
    }
</style>
