<template>
  <div class="page-wrapper">
    <div class="page forbidden-page">
      <h2>403 Forbidden</h2>
      <p>You do not have permission to access this page.</p>

     
      <RouterLink to="/login" class="btn-primary">Back to Login</RouterLink>
    </div>
  </div>
</template>

<script setup>
// no script needed
</script>

<style scoped>
.page-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;       
  background: #f8d7da;    
}

.page.forbidden-page {
  max-width: 600px;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #f5c6cb;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  text-align: center;
}

.forbidden-page h2 {
  margin-bottom: 12px;
  color: #c0392b;          
}

.forbidden-page p {
  color: #444;
  margin-bottom: 16px;
  font-size: 16px;
}

/* 返回按钮 */
.btn-primary {
  display: inline-block;
  padding: 10px 16px;
  border-radius: 6px;
  background: #007bff;
  color: #fff;
  text-decoration: none;
  font-weight: 600;
}
.btn-primary:hover {
  opacity: 0.9;
}
</style>
