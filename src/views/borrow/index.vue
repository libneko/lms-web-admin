<script setup lang="ts">
import { getBorrow, getBorrowDetailApi } from '@/api/borrow'
import type { Borrow, SendBorrow } from '@/api/types'
import { BorrowStatus, BorrowStatusMap } from '@/utils/status'
import { ElMessage } from 'element-plus'
import { computed, onMounted, ref, watch } from 'vue'

const dialogVisible = ref(false)
const currentPage = ref('1')
const pageSize = ref('5')
const searchQuery = ref('')
const total = ref(0)
const currentBorrow = ref<Borrow | null>(null)
let timer: any = null

const stepActiveIndex = computed(() => {
  const status = currentBorrow.value?.status ?? 0

  return Math.max(0, status)
})

const handleCurrentChange = (val: number) => {
  fetchBorrows()
  window.scrollTo(0, 0)
}
const handleSizeChange = (val: string) => {
  pageSize.value = val
  currentPage.value = '1'
  fetchBorrows()
}

const borrows = ref<Borrow[]>([])

const open_borrow = async (borrowId: number) => {
  const BorrowDetail = await getBorrowDetailApi(borrowId)
  if (BorrowDetail.code === 1) {
    const index = borrows.value.findIndex((item) => item.id === borrowId)
    if (index !== -1) {
      borrows.value[index]!.borrow_detail_list = BorrowDetail.data.borrow_detail_list
    }
  } else {
    ElMessage.error('获取借阅详情失败')
    return
  }
  const targetBorrow = borrows.value.find((item) => item.id === borrowId)
  if (targetBorrow) {
    currentBorrow.value = targetBorrow
    dialogVisible.value = true
  } else {
    ElMessage.error('未找到借阅数据')
  }
}
const formatStatus = (status: number) => {
  return BorrowStatusMap[status] || { label: '未知状态', type: 'info' }
}

const fetchBorrows = async () => {
  const params: SendBorrow = {
    page: currentPage.value,
    pageSize: pageSize.value,
    number: searchQuery.value.trim(),
    beginTime: '',
    endTime: '',
    status: '',
  }

  try {
    const res = await getBorrow(params)
    if (res.code === 1) {
      borrows.value = res.data.records
      total.value = res.data.total
    }
  } catch (error) {}
}

watch(searchQuery, () => {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    currentPage.value = '1'
    fetchBorrows()
  }, 500)
})

onMounted(async () => {
  await fetchBorrows()
})

const formatBorrowTime = (timestamp: string | number | Date) => {
  return new Date(timestamp)
    .toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
    .replace(/\//g, '-')
}
</script>

<template>
  <div class="borrow">
    <div class="search-area">
      <el-input
        v-model.trim="searchQuery"
        placeholder="请输入借阅编号进行搜索..."
        clearable
        prefix-icon="Search"
        style="width: 300px; margin-bottom: 20px"
      />
    </div>

    <el-card class="cart-container">
      <!-- 表头 -->
      <template #header>
        <el-row :gutter="24" align="middle">
          <el-col :span="2"></el-col>
          <el-col :span="4">借阅编号</el-col>
          <el-col class="head-label" :span="4">创建时间</el-col>
          <el-col class="head-label" :span="4"></el-col>
          <el-col class="head-label" :span="4">状态</el-col>
          <el-col class="head-label" :span="5">操作</el-col>
          <el-col :span="1"></el-col>
        </el-row>
      </template>

      <div class="borrow-items">
        <el-card
          v-for="borrow in borrows"
          :key="borrow.id"
          class="borrow-item"
          style="margin-bottom: 20px"
        >
          <div class="borrow-id-header">
            <!-- 关键修改：内容行的栅格分布与表头完全一致 -->
            <el-row :gutter="24" align="middle">
              <el-col :span="1"></el-col>

              <el-col :span="5">{{ borrow.number }}</el-col>

              <el-col :span="5"> {{ formatBorrowTime(borrow.borrow_time) }}</el-col>

              <el-col :span="4" style="color: #f56c6c; font-weight: bold"> </el-col>
              <el-col :span="4">
                <el-tag :type="formatStatus(borrow.status).type">
                  {{ formatStatus(borrow.status).label }}
                </el-tag>
              </el-col>
              <el-col :span="4" class="borrow-opera">
                <el-button type="primary" class="button" @click="open_borrow(borrow.id)"
                  >详情</el-button
                >
              </el-col>
              <el-col :span="1"></el-col>
              <!-- 留白与表头对齐 -->
            </el-row>
          </div>
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
    <el-dialog v-model="dialogVisible" title="借阅详情" width="800px" destroy-on-close>
      <div v-if="currentBorrow">
        <div
          v-if="currentBorrow.status === BorrowStatus.OVERDUE"
          style="margin-bottom: 20px; color: #909399; text-align: center"
        >
          <el-steps :active="2" simple style="margin-bottom: 20px">
            <el-step title="借阅提交" status="success" icon="Document" />
            <el-step title="已逾期" status="error" icon="CircleCloseFilled" />
          </el-steps>
        </div>
        <div v-else>
          <el-steps
            :active="stepActiveIndex"
            finish-status="success"
            simple
            style="margin-bottom: 20px"
          >
            <el-step title="借阅中" />
            <el-step title="已归还" />
          </el-steps>
        </div>
        <el-descriptions title="基本信息" :column="2" border>
          <el-descriptions-item label="借阅编号">{{ currentBorrow.number }}</el-descriptions-item>
          <el-descriptions-item label="借阅时间">{{
            formatBorrowTime(currentBorrow.borrow_time)
          }}</el-descriptions-item>
          <el-descriptions-item label="截止归还时间">{{
            formatBorrowTime(currentBorrow.due_date)
          }}</el-descriptions-item>
          <el-descriptions-item label="实际归还时间" v-if="currentBorrow.return_time !== null">{{
            formatBorrowTime(currentBorrow.return_time)
          }}</el-descriptions-item>
          <el-descriptions-item label="借阅人">{{ currentBorrow.user_name }}</el-descriptions-item>
        </el-descriptions>

        <div style="margin-top: 20px">
          <h4 style="margin-bottom: 10px">借阅清单</h4>
          <el-table :data="currentBorrow.borrow_detail_list" border stripe size="small">
            <el-table-column label="图书图片" width="80" align="center">
              <template #default="scope">
                <el-image
                  style="width: 40px; height: 50px"
                  :src="scope.row.image"
                  preview-teleported
                />
              </template>
            </el-table-column>
            <el-table-column prop="name" label="书名" show-overflow-tooltip />
            <el-table-column prop="number" label="数量" width="80" align="center" />
          </el-table>
        </div>

        <div style="margin-top: 20px" v-if="currentBorrow.status >= 3">
          <el-alert title="借阅信息" type="info" :closable="false">
            <template #default>
              <div>借阅时间：{{ currentBorrow.borrow_time || '计算中...' }}</div>
              <div>归还时间：{{ currentBorrow.return_time }}</div>
            </template>
          </el-alert>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关 闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.borrow {
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

.borrow-header {
  margin-bottom: 20px;
}

.borrow-total,
.borrow-staus,
.borrow-time {
  text-align: center;
}

.borrow-id-header {
  font-size: 13px;
  color: #909399;
}

.head-label {
  text-align: center;
  font-weight: bold;
}

.button {
  margin-top: 10px;
  margin-left: 12px;
  margin-right: 15px;
}
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.borrow-opera {
  display: flex;
  flex-direction: column;
}

/* 使用 :deep() 穿透修改 element-plus 内部样式 */
.reverse-collapse {
  /* 开启 flex 布局 */
  display: flex;
  /* 关键属性：垂直反转，让 Header 跑到 Wrap (内容) 的下面 */
  flex-direction: column-reverse;
}
:deep(.el-collapse-item) {
  /* 开启 flex 布局 */
  display: flex;
  /* 关键属性：垂直反转，让 Header 跑到 Wrap (内容) 的下面 */
  flex-direction: column-reverse;
}
/* 优化边框样式（可选） */
/* 因为反转后，标题在下面，原本标题的下边框可能看起来会怪，这里做一下微调 */
.reverse-collapse {
  /* 这里可以根据你的设计需求调整边框，
     例如：因为标题跑下面去了，可能需要把原本底部的边框去掉，或者加一个上边框来分隔内容 */
  border-bottom: none;
  border-top: 1px solid #ebeef5; /* 只有展开时，内容和标题之间才需要分隔线 */
}
:deep(.el-collapse-item__header) {
  border-bottom: none;
  border-top: 1px solid #ebeef5; /* 只有展开时，内容和标题之间才需要分隔线 */
}
/* 如果你希望内容部分没有底边框，可以把这行加上 */
.reverse-collapse {
  border-bottom: none;
}
:deep(.el-collapse-item__wrap) {
  border-bottom: none;
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

.cover-image {
  width: 100px;
  height: 140px;
  display: block;
  object-fit: cover; /* 保持图片比例填充 */
}
</style>
