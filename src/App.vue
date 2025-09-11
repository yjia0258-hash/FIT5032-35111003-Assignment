<script setup>

</script>

<template>
  <div class="container mt-4">
    <!-- Simple navigation -->
    <nav class="mb-3 d-flex gap-2">
      <RouterLink class="btn btn-outline-primary" to="/login">Login</RouterLink>
      <RouterLink class="btn btn-outline-success" to="/register">Register</RouterLink>
    </nav>

    <!-- Route outlet: renders the matched page (Login.vue / Register.vue) -->
    <RouterView />
  </div>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
