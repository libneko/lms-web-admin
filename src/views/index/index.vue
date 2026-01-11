<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getCategories, getRandomBooks } from '@/api/home'
import type { Book, Category } from '@/api/types'
import { useRouter } from 'vue-router'

import BookGrid from '@/component/book-grid.vue'

// 分类数据
const router = useRouter()
const categories = ref<Category[]>([])
const books = ref<Book[]>([])
// Banner 图书
const banners = ref<Book[]>([])
// 推荐图书
const suggestBooks = ref<Book[]>([])

const loadData = async () => {
  categories.value = (await getCategories()).data
  const res = await getRandomBooks(23)
  books.value = res.data
  banners.value = books.value.slice(0, 3)
  suggestBooks.value = books.value.slice(3, 23)
}

const searchCategory = (id: number) => {
  router.push({
    path: '/search',
    query: { categoryId: id },
  })
}

// Banner轮播逻辑
const currentIndex = ref(0)

// 自动轮播
onMounted(() => {
  loadData()
})
</script>

<template>
  <el-container class="home">
    <!-- 核心内容区 -->
    <el-main class="content">
      <!-- 顶部 Banner（放在最上面） -->
      <div class="banner-wrap">
        <el-carousel :current-index="currentIndex" class="banner-carousel" height="500px">
          <el-carousel-item v-for="(banner, index) in banners" :key="index">
            <el-image style="width: 100%; height: 100%" :src="banner.image" fit="contain" />
          </el-carousel-item>
        </el-carousel>
      </div>

      <!-- 横向分类栏 -->
      <div class="category-bar">
        <div>全部图书分类</div>

        <el-scrollbar wrap-style="overflow-x: auto; white-space: nowrap;">
          <el-space size="10">
            <el-button
              v-for="category in categories"
              :key="category.id"
              @click="searchCategory(category.id)"
              type="default"
              plain
              round
            >
              {{ category.name }}
            </el-button>
          </el-space>
        </el-scrollbar>
      </div>

      <div class="book-title">猜你喜欢</div>
      <BookGrid :books="suggestBooks" />
    </el-main>
  </el-container>
</template>

<style scoped>
.content {
  padding: 10px 40px;
  height: 100%; /* 计算内容区高度（视口高度 - 顶部padding - 底部footer高度） */
  overflow-y: auto; /* 保留内容区内部滚动（如果内容超出），但隐藏外部滚动条 */
  scrollbar-width: none; /* Firefox 隐藏滚动条 */
}

/* Banner样式 */
.banner-wrap {
  margin-bottom: 16px;
}

/* 横向分类栏 */
.category-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
}

.book-title {
  font-size: 18px;
  font-weight: bold;
  margin-top: 20px;
  margin-bottom: 15px;
}
</style>
