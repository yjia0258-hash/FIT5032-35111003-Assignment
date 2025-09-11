<template>
  <div class="login-wrapper">
    <h2 class="mb-3 text-center">Login</h2>

    <form @submit.prevent="submit" class="d-flex flex-column gap-3">
      <input
        v-model="email"
        type="email"
        class="form-control"
        placeholder="Email"
        required
      />
      <input
        v-model="password"
        type="password"
        class="form-control"
        placeholder="Password"
        required
      />
      <button type="submit" class="btn btn-primary w-100">Login</button>
    </form>

    <p class="mt-3 text-center">
      No account?
      <RouterLink to="/register">Go to Register</RouterLink>
    </p>
  </div>
</template>

<style scoped>
.login-wrapper {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  background: #fff;
  padding: 20px;
  border-radius: 6px;
  border: 1px solid #ddd;
  width: 100%;
  max-width: 400px; 
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
</style>
