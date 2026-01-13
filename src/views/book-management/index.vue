<script setup lang="ts">
import {
  changeStatusApi,
  deleteBookApi,
  getBooks,
  submitBookApi,
  updateApi,
  upload,
} from '@/api/book-management'
import { getCategories } from '@/api/home'
import type { Book, Category, SendBookData, SendSearch } from '@/api/types'
import { formatRelativeTime } from '@/utils/datetime'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, reactive, ref, watch } from 'vue'

const dialogVisible = ref(false)
const isEditMode = ref(false)
const currentPage = ref(1)
const pageSize = ref(5)
const searchQuery = ref('')
const total = ref(0)
const categories = ref<Category[]>([])
const rawFile = ref<File | null>(null)
let timer: any = null

const defaultBook: Book = {
  id: 0,
  name: '',
  author: '',
  isbn: '',
  location: '',
  stock: 1,
  image: '',
  category_id: '',
  publisher: '',
  description: '',
  status: 1,
  update_time: '',
}

const defaultSend: SendBookData = {
  id: 0,
  name: '',
  author: '',
  category_id: '',
  image: '',
  description: '',
  status: 1,
  stock: 0,
  isbn: '',
  publisher: '',
  location: '',
}

const sendBook = reactive<SendBookData>({ ...defaultSend })

const tableData = ref<Book[]>([])

const bookForm = reactive<Book>({ ...defaultBook })

const handleCoverChange = (uploadFile: any) => {
  const file = uploadFile.raw
  const isJPGOrPNG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPGOrPNG) {
    ElMessage.error('上传封面图片只能是 JPG 或 PNG 格式!')
    return
  }
  if (!isLt2M) {
    ElMessage.error('上传封面图片大小不能超过 2MB!')
    return
  }

  rawFile.value = file
  bookForm.image = URL.createObjectURL(file)
}
const handleCurrentChange = (val: number) => {
  fetchBooks()
  window.scrollTo(0, 0)
}
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
  fetchBooks()
}

const copyBookFormToSendBook = () => {
  Object.assign(sendBook, bookForm)

  delete (sendBook as any).update_time
}

const changestatus = async (item: Book) => {
  const newStatus = item.status === 1 ? 0 : 1
  try {
    const res = await changeStatusApi(item.id, newStatus)
    if (res.code === 1) {
      await fetchBooks()
      ElMessage.success('状态更改成功')
    } else {
      ElMessage.error(res.message || '更改状态失败')
    }
  } catch (error) {
    ElMessage.error('网络错误，请稍后重试')
  }
}

const submitBook = async () => {
  if (bookForm.stock < 1 || bookForm.stock > 10) {
    ElMessage.error('库存数量必须在1-10之间')
    return
  }

  if (rawFile.value) {
    try {
      const uploadRes = await upload(rawFile.value)
      if (uploadRes.code === 1) {
        const imageUrl = uploadRes.data
        bookForm.image = imageUrl
      } else {
        ElMessage.error('图片上传失败，请稍后重试')
        return
      }
    } catch (error) {
      ElMessage.error('上传图片时出错')
      return
    }
  }
  copyBookFormToSendBook()
  if (isEditMode.value) {
    const res = await updateApi(sendBook)
    if (res.code === 1) {
      await fetchBooks()
      ElMessage.success('书籍更新成功')
      dialogVisible.value = false
    } else {
      ElMessage.error(res.message || '更新失败，请稍后重试')
    }
    return
  } else {
    sendBook.id = null

    const res = await submitBookApi(sendBook)
    if (res.code === 1) {
      currentPage.value = 1
      await fetchBooks()
      ElMessage.success('书籍添加成功')
    } else {
      ElMessage.error(res.message || '操作失败，请稍后重试')
      return
    }
  }

  dialogVisible.value = false
}

const handleAdd = () => {
  isEditMode.value = false
  Object.assign(bookForm, defaultBook)
  bookForm.image = ''
  dialogVisible.value = true
}

const editBook = (row: Book) => {
  isEditMode.value = true
  Object.assign(bookForm, JSON.parse(JSON.stringify(row)))
  dialogVisible.value = true
}

const deletebook = async (row: Book) => {
  ElMessageBox.confirm(`确定删除书籍《${row.name}》吗?`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    const res = await deleteBookApi(String(row.id))
    if (res.code !== 1) {
      ElMessage.error('删除失败，请检查是否已下架')
      return
    }
    await fetchBooks()
    ElMessage.success('删除成功')
  })
}

watch(searchQuery, () => {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    currentPage.value = 1
    fetchBooks()
  }, 500)
})

const fetchBooks = async () => {
  const params: SendSearch = {
    page: currentPage.value,
    pageSize: pageSize.value,
    name: searchQuery.value,
    categoryId: 0,
    status: null,
  }

  try {
    const res = await getBooks(params)
    if (res.code === 1) {
      tableData.value = res.data.records
      total.value = res.data.total
    }
  } catch (error) {
    ElMessage.error('加载数据失败')
  }
}
const fetchCategory = async () => {
  const res = await getCategories()
  if (res.code === 1) {
    categories.value = res.data
  } else {
    ElMessage.error('获取分类信息失败')
  }
}

onMounted(async () => {
  await fetchBooks()
  await fetchCategory()
})
</script>

<template>
  <div class="book">
    <div class="book-header">
      <el-button type="primary" class="add" @click="handleAdd"> 添加书籍 </el-button>

      <div class="search-area">
        <el-input
          v-model="searchQuery"
          placeholder="请输入书名进行搜索..."
          clearable
          prefix-icon="Search"
          style="width: 300px"
        />
      </div>

      <el-dialog
        v-model="dialogVisible"
        :title="isEditMode ? '编辑书籍' : '添加书籍'"
        width="600px"
        align-center
      >
        <el-form :model="bookForm" label-width="90px">
          <el-form-item label="书本封面">
            <el-upload
              class="cover-uploader"
              action="#"
              :show-file-list="false"
              :auto-upload="false"
              :on-change="handleCoverChange"
              accept="image/jpeg,image/png"
            >
              <img v-if="bookForm.image" :src="bookForm.image" class="cover-image" />
              <el-icon v-else class="cover-uploader-icon"><Plus /></el-icon>
            </el-upload>
          </el-form-item>

          <el-form-item label="书本名">
            <el-input v-model="bookForm.name" placeholder="请输入书名" />
          </el-form-item>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="作者">
                <el-input v-model="bookForm.author" placeholder="作者名" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="出版社">
                <el-input v-model="bookForm.publisher" placeholder="出版社" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="ISBN">
                <el-input v-model="bookForm.isbn" placeholder="例如: 9787xxx" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="位置">
                <el-input v-model="bookForm.location" placeholder="例如: 1-1-1001" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="数量">
                <el-input-number v-model="bookForm.stock" :min="1" :max="10" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="分类ID">
                <el-select v-model="bookForm.category_id">
                  <el-option
                    v-for="category in categories"
                    :key="category.id"
                    :label="category.name"
                    :value="category.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="状态">
                <el-select v-model="bookForm.status">
                  <el-option label="正常" :value="1" />
                  <el-option label="异常" :value="0" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="简介">
            <el-input
              v-model="bookForm.description"
              type="textarea"
              :rows="3"
              placeholder="请输入简介..."
            />
          </el-form-item>
        </el-form>

        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitBook">提交</el-button>
          </span>
        </template>
      </el-dialog>
    </div>

    <el-card class="cart-container">
      <!-- 表头 -->
      <template #header>
        <el-row :gutter="24" align="middle">
          <el-col :span="2"></el-col>
          <el-col :span="10">图书</el-col>
          <el-col class="head-label" :span="3">状态</el-col>
          <el-col class="head-label" :span="3">操作</el-col>
          <el-col class="head-label" :span="3">更新时间</el-col>
        </el-row>
      </template>
      <div class="book-items" v-if="tableData.length > 0">
        <el-card v-for="item in tableData" :key="item.id" class="book-card" shadow="hover">
          <el-row align="middle" type="flex">
            <el-col class="book-info" :span="12">
              <el-row :gutter="10" align="middle">
                <el-col :span="6">
                  <el-image
                    :src="item.image"
                    style="width: 80px; height: 100px; border-radius: 4px"
                    fit="cover"
                  >
                    <template #error>
                      <div class="image-slot">
                        <el-icon><Picture /></el-icon>
                      </div>
                    </template>
                  </el-image>
                </el-col>
                <el-col :span="18">
                  <div class="book-title" :title="item.name">{{ item.name }}</div>
                  <div class="book-author">作者: {{ item.author }}</div>
                  <div class="book-isbn">ISBN: {{ item.isbn }}</div>
                  <div class="info-label">位置:{{ item.location }}</div>
                  <div class="info-label">库存:{{ item.stock }}</div>
                  <div class="book-publisher">出版社: {{ item.publisher }}</div>
                </el-col>
              </el-row>
            </el-col>

            <el-col class="book-status" :span="3" style="">
              <el-tag :type="item.status === 1 ? 'success' : 'warning'">
                {{ item.status === 1 ? '正常' : '下架' }}
              </el-tag>
            </el-col>

            <el-col class="book-opera" :span="3" style="text-align: right">
              <el-button type="primary" class="button" @click="changestatus(item)"
                >更改状态</el-button
              >
              <el-button type="primary" class="button" @click="editBook(item)">编辑书籍</el-button>
              <el-button type="danger" class="button" @click="deletebook(item)">删除书籍</el-button>
            </el-col>

            <el-col class="book-time" :span="5">
              <el-tooltip :content="item.update_time" placement="top">
                <span>{{ formatRelativeTime(item.update_time) }}</span>
              </el-tooltip>
            </el-col>
          </el-row>
        </el-card>

        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[5, 10, 20]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            background
          />
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.book {
  max-width: 80%;
  margin: 0 auto;
  padding: 20px;
  position: relative;
  min-height: 100vh;
}
.cart-container {
  margin-bottom: 100px;
  padding-bottom: 20px;
}
.head-label {
  text-align: center;
  font-weight: bold;
}
.book-header {
  margin-bottom: 20px;
}
.book-status,
.book-time {
  text-align: center;
}

.add {
  margin-bottom: 10px;
}
.card-list-container {
  padding: 20px;
}

.button {
  margin-left: 12px;
  margin-right: 15px;
  margin-bottom: 12px;
}
.book-card {
  margin-bottom: 15px; /* 卡片之间的间距 */
  transition: all 0.3s;
}
.book-card:hover {
  transform: translateY(-2px); /* 悬浮时的微动效 */
}

.book-opera {
  display: flex;
  flex-direction: column;
}
.cover-image {
  width: 100%; /* 占满容器宽度 */
  height: 100%; /* 占满容器高度 */
  object-fit: contain; /* 关键属性：保持比例显示完整图片，不裁剪 */
  display: block;
}

.cover-uploader {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}
:deep(.el-upload) {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}
.cover-uploader {
  border-color: var(--el-color-primary);
}
:deep(.el-upload:hover) {
  border-color: var(--el-color-primary);
}
.cover-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px; /* 封面图宽 */
  height: 140px; /* 封面图高，模拟书本比例 */
  line-height: 140px;
  text-align: center;
}
.book-title {
  font-size: 16px;
  font-weight: bold;
  color: var(--el-text-color-primary);
  margin-bottom: 8px;
  /* 超出省略 */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.info-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.book-author,
.book-isbn,
.book-publisher {
  font-size: 13px;
  color: #909399;
  margin-bottom: 4px;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
  font-size: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
