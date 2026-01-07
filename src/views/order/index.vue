<script setup lang="ts">
import {
  CompleteOrderApi,
  DeliveryOrderApi,
  getOrder,
  GetOrderDetailApi,
  SendOrderApi,
} from '@/api/order'
import type { Order, SendOrder } from '@/api/types'
import { OrderStatus, OrderStatusMap } from '@/utils/status'
import { ElMessage, ElMessageBox, type CollapseModelValue } from 'element-plus'
import type { el } from 'element-plus/es/locales.mjs'
import { computed, onMounted, reactive, ref, watch } from 'vue'

const dialogVisible = ref(false)
const currentPage = ref('1') // 当前页码
const pageSize = ref('5') // 每页显示数量 (设小一点方便看效果)
const searchQuery = ref('')
const total = ref(0)
const currentOrder = ref<Order | null>(null) // 存储当前点击的订单数据
let timer: any = null

const handleChange = (val: CollapseModelValue) => {
  console.log(val)
}

const stepActiveIndex = computed(() => {
  const status = currentOrder.value?.status ?? 0

  // 这里的逻辑是：active 代表"完成"了多少步
  // 状态 1 (待付款): 完成 0 步 -> active = 0 (第1步高亮为进行中)
  // 状态 2 (已付款): 完成 1 步 -> active = 1 (第1步变绿，第2步高亮)
  // 状态 3 (已发货): 完成 2 步 -> active = 2 (前2步变绿，第3步高亮)
  // 状态 4 (已送达): 完成 3 步 -> active = 3
  // 状态 5 (已完成): 完成 5 步 -> active = 5 (全部变绿)
  if (status === 0) return 0

  if (status === OrderStatus.COMPLETED) {
    return 5 // 全部完成
  }

  // 对于 1-4 的状态，active 应该是 status - 1
  // 例如 status=1(待付款)，active应该为0
  return Math.max(0, status - 1)
})

const handleCurrentChange = (val: number) => {
  console.log(`当前页: ${val}`)
  // 可以在这里加一行代码让页面滚动回顶部
  fetchOrders() // 重新向后端拿数据
  window.scrollTo(0, 0)
}
const handleSizeChange = (val: string) => {
  console.log(`每页 ${val} 条`)
  pageSize.value = val
  currentPage.value = '1' // 改变每页大小时，建议重置回第一页
  fetchOrders()
}

const orders = ref<Order[]>([])

const open_order = async (orderId: number) => {
  const OrderDetail = await GetOrderDetailApi(orderId)
  console.log('OrderDetail:', OrderDetail)
  if (OrderDetail.code === 1) {
    const index = orders.value.findIndex((item) => item.id === orderId)
    if (index !== -1) {
      orders.value[index]!.order_detail_list = OrderDetail.data.order_detail_list
    }
  } else {
    ElMessage.error('获取订单详情失败')
    return
  }
  const targetOrder = orders.value.find((item) => item.id === orderId)
  if (targetOrder) {
    currentOrder.value = targetOrder // 设置当前订单
    dialogVisible.value = true // 打开弹窗
  } else {
    ElMessage.error('未找到订单数据')
  }
}
const formatStatus = (status: number) => {
  // 尝试从 Map 中获取，如果获取不到（比如后端传了个 999），则返回默认对象
  return OrderStatusMap[status] || { label: '未知状态', type: 'info' }
}
const updateOrderStatus = (order: Order, targetStatus: number) => {
  const isDelivery = targetStatus === 3
  const actionName = isDelivery ? '发货' : '派送'

  // 1. 二次确认弹窗
  ElMessageBox.confirm(
    `确认将订单 "${order.number}" 标记为【已${actionName}】吗？`,
    `${actionName}确认`,
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: isDelivery ? 'primary' : 'success', // 发货用primary，完成用success
    },
  )
    .then(async () => {
      const res = ref()
      if (isDelivery) {
        // 发货接口
        res.value = await SendOrderApi(order.id)
      } else {
        // 完成订单接口
        res.value = await DeliveryOrderApi(order.id)
      }
      console.log(res)
      if (res.value.code === 1) {
        setTimeout(async () => {
          await fetchOrders()
          ElMessage.success(`订单已成功${actionName}`)
        }, 1000)
      } else {
        ElMessage.error('操作失败')
      }
    })
    .catch(() => {
      ElMessage.info('已取消操作')
    })
}
const fetchOrders = async () => {
  const phoneRegex = /^1[3-9]\d{9}$/
  // 2. 判断输入值是否为手机号
  const isPhoneNumber = phoneRegex.test(searchQuery.value)

  const params: SendOrder = {
    page: currentPage.value,
    pageSize: pageSize.value,
    number: isPhoneNumber ? '' : searchQuery.value,
    beginTime: '',
    endTime: '',
    phone: isPhoneNumber ? searchQuery.value : '',
    status: '',
  }

  try {
    const res = await getOrder(params)
    console.log('获取订单数据:', res)
    if (res.code === 1) {
      console.log('res.data.records:', res.data.records)
      orders.value = res.data.records
      console.log('orders.value:', orders.value)
      total.value = res.data.total
    }
  } catch (error) {}
}

watch(searchQuery, () => {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    currentPage.value = '1'
    fetchOrders()
  }, 500) // 用户停止输入 500ms 后才发请求
})

onMounted(async () => {
  await fetchOrders()
})

const formatOrderTime = (timestamp: string | number | Date) => {
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
  <div class="order">
    <div class="search-area">
      <el-input
        v-model="searchQuery"
        placeholder="请输入订单号、手机号进行搜索..."
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
          <el-col :span="4">订单号</el-col>
          <el-col class="head-label" :span="4">创建时间</el-col>
          <el-col class="head-label" :span="4">金额</el-col>
          <el-col class="head-label" :span="4">状态</el-col>
          <el-col class="head-label" :span="5">操作</el-col>
          <el-col :span="1"></el-col>
        </el-row>
      </template>

      <div class="order-items">
        <el-card
          v-for="order in orders"
          :key="order.id"
          class="order-item"
          style="margin-bottom: 20px"
        >
          <div class="order-id-header">
            <!-- 关键修改：内容行的栅格分布与表头完全一致 -->
            <el-row :gutter="24" align="middle">
              <el-col :span="1"></el-col>
              <!-- 留白与表头对齐 -->
              <el-col :span="5">{{ order.number }}</el-col>
              <!-- 订单号 -->
              <!-- <el-col :span="6">{{ order.order_time }}</el-col> -->
              <el-col :span="5"> {{ formatOrderTime(order.order_time) }}</el-col>
              <!-- 创建时间（调整为4） -->
              <el-col :span="4" style="color: #f56c6c; font-weight: bold">
                <!-- 金额（调整为4） -->
                ¥{{ order.amount.toFixed(2) }}
              </el-col>
              <el-col :span="4">
                <!-- 状态（调整为4） -->
                <el-tag :type="formatStatus(order.status).type">
                  {{ formatStatus(order.status).label }}
                </el-tag>
              </el-col>
              <el-col :span="4" class="order-opera">
                <!-- 操作（调整为5） -->
                <el-button type="primary" class="button" @click="open_order(order.id)"
                  >订单详情</el-button
                >
                <el-button
                  v-if="formatStatus(order.status).type === 'primary'"
                  type="primary"
                  :disabled="
                    order.status >= OrderStatus.SHIPPED || order.status === OrderStatus.COMPLETED
                  "
                  @click="updateOrderStatus(order, OrderStatus.SHIPPED)"
                  class="button"
                  >订单发货</el-button
                >
                <el-button
                  v-else-if="formatStatus(order.status).type === 'success'"
                  type="success"
                  :disabled="
                    order.status === OrderStatus.DELIVERED || order.status === OrderStatus.COMPLETED
                  "
                  @click="updateOrderStatus(order, OrderStatus.DELIVERED)"
                  class="button"
                  >订单派送</el-button
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
    <el-dialog v-model="dialogVisible" title="订单详情" width="800px" destroy-on-close>
      <div v-if="currentOrder">
        <div
          v-if="currentOrder.status === OrderStatus.CANCELLED"
          style="margin-bottom: 20px; color: #909399; text-align: center"
        >
          <el-steps :active="2" simple style="margin-bottom: 20px">
            <el-step title="订单提交" status="success" icon="Document" />
            <el-step title="已取消" status="error" icon="CircleCloseFilled" />
          </el-steps>
        </div>
        <div v-else>
          <el-steps
            :active="stepActiveIndex"
            finish-status="success"
            simple
            style="margin-bottom: 20px"
          >
            <el-step title="待付款" />
            <el-step title="待发货" />
            <el-step title="已发货" />
            <el-step title="已送达" />
            <el-step title="已完成" />
          </el-steps>
        </div>
        <el-descriptions title="基本信息" :column="2" border>
          <el-descriptions-item label="订单编号">{{ currentOrder.number }}</el-descriptions-item>
          <el-descriptions-item label="下单时间">{{
            currentOrder.order_time
          }}</el-descriptions-item>
          <el-descriptions-item label="收货人">{{ currentOrder.consignee }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ currentOrder.phone }}</el-descriptions-item>
          <el-descriptions-item label="支付方式">
            {{ currentOrder.pay_method === 1 ? '微信支付' : '支付宝' }}
          </el-descriptions-item>
          <el-descriptions-item label="订单金额">
            <span style="color: #f56c6c; font-weight: bold"
              >¥{{ currentOrder.amount.toFixed(2) }}</span
            >
          </el-descriptions-item>
        </el-descriptions>

        <div style="margin-top: 20px">
          <h4 style="margin-bottom: 10px">商品清单</h4>
          <el-table :data="currentOrder.order_detail_list" border stripe size="small">
            <el-table-column label="商品图片" width="80" align="center">
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
            <el-table-column prop="amount" label="单价" width="100" align="right">
              <template #default="scope">¥{{ scope.row.amount }}</template>
            </el-table-column>
            <el-table-column label="小计" width="100" align="right">
              <template #default="scope">
                ¥{{ (scope.row.amount * scope.row.number).toFixed(2) }}
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div style="margin-top: 20px" v-if="currentOrder.status >= 3">
          <el-alert title="配送信息" type="info" :closable="false">
            <template #default>
              <div>预计送达：{{ currentOrder.estimated_delivery_time || '计算中...' }}</div>
              <div>实际发货：{{ currentOrder.deliver_time }}</div>
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
.order {
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

.order-header {
  margin-bottom: 20px;
}

.order-total,
.order-staus,
.order-time {
  text-align: center;
}

.order-id-header {
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

.order-opera {
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
