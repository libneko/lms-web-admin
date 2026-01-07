<script setup lang="ts">
import type { Book } from '@/api/types'
import BookCard from './book-card.vue'

defineProps<{
  books: Book[]
}>()
</script>

<template>
  <div class="book-grid">
    <div class="book-item" v-for="book in books" :key="book.id">
      <BookCard :book="book" />
    </div>
  </div>
</template>

<style scoped>
.book-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
  gap: 20px;
}

.book-item {
  cursor: pointer;
}
</style>
