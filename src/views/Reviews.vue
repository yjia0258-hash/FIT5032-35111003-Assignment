<template>
  <div class="page-wrapper">
    <div class="page">
      <h2>Rate These Items</h2>
      <p class="sub">Each user can rate once per item. Average and count aggregate across all users.</p>

      <div class="items">
        <div class="item" v-for="it in items" :key="it.id">
          <div class="title">{{ it.title }}</div>

          <!-- Star rating (1..5) -->
          <RatingStars :itemId="it.id" />

          <!-- Toggle to view all users' ratings for this item -->
          <RatingsList :itemId="it.id" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import RatingStars from '../components/RatingStars.vue'
import RatingsList from '../components/RatingsList.vue' // NEW: show all ratings per item

const items = [
  { id: 'item-1', title: 'Accessibility' },
  { id: 'item-2', title: 'Performance' },
  { id: 'item-3', title: 'UI Polish' }
]
</script>

<style scoped>
.page-wrapper { 
  min-height: 100vh; 
  display: flex; 
  justify-content: center; 
  align-items: center; 
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
.sub { 
  color: #666; 
  margin-bottom: 18px;
}
.items { 
  display: grid; 
  gap: 16px; 
}
.item { 
  display: grid; 
  gap: 10px; 
  justify-items: center; 
  padding: 12px; 
  border: 1px solid #eee; 
  border-radius: 8px; 
}
.title { 
  font-weight: 600;
}
</style>
