<script setup lang="ts">
import type { Book } from '@/api/types'
import {} from '@/api/meta'

defineProps<{
  book: Book
}>()
</script>

<template>
  <a target="_blank" class="book-link">
    <el-card class="book-card" shadow="hover">
      <el-image :src="book.image" class="book-img" fit="contain" />
      <template #footer>
        <div class="book-name">{{ book.name }}</div>
        <div class="book-price">¥{{ book.price }}</div>
      </template>
    </el-card>
  </a>
</template>

<style scoped>
.book-card {
  width: 100%;
  height: 320px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  background-color: var(--el-bg-color-overlay);
}
.book-img {
  width: 100%;
  height: 90%;
}

.book-name {
  font-size: 14px;
}

.book-price {
  font-size: 16px;
  font-weight: bold;
  color: #ff4400;
}

.book-link {
  text-decoration: none;
  color: inherit;
}
</style>
