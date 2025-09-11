<template>
  <div class="page-wrapper">
    <div class="page">
      <h2>Rate These Items</h2>
      <p class="sub">Each user can rate once per item. The average and count are aggregated across all users.</p>

      <div class="items">
        <div class="item" v-for="it in items" :key="it.id">
          <div class="title">{{ it.title }}</div>
          <RatingStars :itemId="it.id" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import RatingStars from '@/components/RatingStars.vue' // 或 '../components/RatingStars.vue'

const items = [
  { id: 'item-1', title: 'Accessibility' },
  { id: 'item-2', title: 'Performance' },
  { id: 'item-3', title: 'UI Polish' }
]
</script>

<style scoped>
.page-wrapper {
  min-height: 100vh;
  display: flex; justify-content: center; align-items: center;
  background: #f8f9fa;
}
.page {
  max-width: 720px;
  width: 96%;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,.08);
  padding: 24px;
  text-align: center;
}
h2 { margin-bottom: 6px; }
.sub { color: #666; margin-bottom: 18px; }
.items { display: grid; gap: 16px; }
.item {
  display: grid; gap: 6px; justify-items: center;
  padding: 12px; border: 1px solid #eee; border-radius: 8px;
}
.title { font-weight: 600; }
</style>
