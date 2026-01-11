<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'
import type { SendSearch } from '@/api/types'
import { changeStatusApi, deleteUserApi, getUserApi } from '@/api/user-management'

// 定义用户类型 - 所有属性都是必需的
interface UserItem {
  id: number
  username: string
  sex: number
  email: string
  phone: string
  status: number
  avatar: string
  selected?: boolean
}

// 响应式数据
const loading = ref(false)
const userList = ref<UserItem[]>([])
const searchKeyword = ref('')
const showEditUserDialog = ref(false)
const currentEditUser = ref<UserItem | null>(null)

// 分页信息
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0,
})

const editUserForm = ref({
  id: 0,
  username: '',
  sex: 1,
  email: '',
  phone: '',
  status: 0,
  avatar: '',
})

// 计算属性
const selectedCount = computed(() => {
  return userList.value.filter((user) => user.selected).length
})

const selectAll = computed({
  get: () => userList.value.length > 0 && userList.value.every((user) => user.selected),
  set: (value: boolean) => {
    userList.value.forEach((user) => {
      user.selected = value
    })
  },
})

const isIndeterminate = computed(() => {
  const selectedCount = userList.value.filter((user) => user.selected).length
  return selectedCount > 0 && selectedCount < userList.value.length
})

const filteredUsers = computed(() => {
  if (!searchKeyword.value.trim()) {
    return userList.value
  }

  const keyword = searchKeyword.value.toLowerCase()
  return userList.value.filter(
    (user) =>
      user.username.toLowerCase().includes(keyword) ||
      user.email.toLowerCase().includes(keyword) ||
      user.phone.includes(keyword),
  )
})

const activeUserCount = computed(() => {
  return userList.value.filter((user) => user.status === 1).length
})

// 方法定义
const fetchUserData = async () => {
  const params: SendSearch = {
    page: pagination.value.currentPage,
    pageSize: pagination.value.pageSize,
    name: searchKeyword.value,
    categoryId: 0,
    status: null,
  }

  loading.value = true
  try {
    const res = await getUserApi(params)

    console.log(res)

    userList.value = res.data.records
    pagination.value.total = res.data.total
  } catch (error) {
    console.error('获取用户数据失败:', error)
    ElMessage.error('网络错误，请稍后重试')
  } finally {
    loading.value = false
  }
}

const handleSelectAllChange = (value: boolean) => {
  userList.value.forEach((user) => {
    user.selected = value
  })
}

const updateUserStatus = async (user: UserItem) => {
  const newStatus = user.status === 1 ? 0 : 1
  try {
    console.log(user.id, newStatus)
    const res = await changeStatusApi(user.id, newStatus)
    console.log(res)
    if (res.code === 1) {
      setTimeout(async () => {
        await fetchUserData()
        ElMessage.success('状态更新成功')
      }, 1000)
    }
  } catch (error) {
    console.error('更新用户状态失败:', error)
    ElMessage.error('更新失败，请稍后重试')
  }
}

const deleteUser = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这个用户吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const res = await deleteUserApi(String(id))
    if (res.code === 1) {
      setTimeout(async () => {
        await fetchUserData()
        ElMessage.success('用户删除成功')
      }, 1000)
    } else {
      ElMessage.error('删除失败，请查看该用户状态是否设为封禁状态')
    }
  } catch {
    ElMessage.info('已取消删除')
  }
}

const batchDeleteUsers = async () => {
  // 1. 获取所有 selected 为 true 的用户 ID
  const selectedIds = userList.value.filter((user) => user.selected).map((user) => user.id)

  // 2. 校验是否选择了用户
  if (selectedIds.length === 0) {
    ElMessage.warning('请先勾选要删除的用户')
    return
  }

  try {
    // 3. 确认弹窗
    await ElMessageBox.confirm(
      `确定要批量删除这 ${selectedIds.length} 位用户吗？`,
      '批量删除提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    // 4. 调用后端接口

    const res = await deleteUserApi(selectedIds.join(','))

    if (res.code === 1) {
      ElMessage.success('批量删除成功')
      // 刷新列表
      await fetchUserData()
      // 可选：清空选中状态（如果刷新数据后前端没重置的话）
    } else {
      ElMessage.error('批量删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
    }
    ElMessage.info('已取消删除')
  }
}

const handleSizeChange = (newSize: number) => {
  pagination.value.pageSize = newSize
  pagination.value.currentPage = 1
  fetchUserData()
}

const handleCurrentChange = (newPage: number) => {
  pagination.value.currentPage = newPage
  fetchUserData()
}

// 生命周期
onMounted(() => {
  console.log('用户管理组件已加载')
  fetchUserData()
})
</script>

<template>
  <div class="user-management">
    <!-- 顶部标题栏 -->
    <div class="management-header">
      <div class="header-actions">
        <el-button type="danger" :disabled="selectedCount === 0" @click="batchDeleteUsers">
          批量删除 ({{ selectedCount }})
        </el-button>
        <span class="selected-count">已选 {{ selectedCount }} 名用户</span>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <div class="stats">
        <span>总计: {{ userList.length }} 人</span>
        <span>活跃: {{ activeUserCount }} 人</span>
      </div>
    </div>

    <!-- 用户管理内容区域 -->
    <el-card class="management-container">
      <!-- 表头 -->
      <div class="management-head">
        <el-checkbox
          v-model="selectAll"
          :indeterminate="isIndeterminate"
          @change="handleSelectAllChange"
        >
          全选
        </el-checkbox>
        <span class="head-label">用户信息</span>
        <span class="head-label">联系方式</span>
        <span class="head-label">状态</span>
        <span class="head-label">操作</span>
      </div>

      <!-- 用户列表 -->
      <div class="user-list">
        <div
          v-for="user in filteredUsers"
          :key="user.id"
          class="user-item"
          :class="{ selected: user.selected }"
        >
          <div class="user-content">
            <!-- 选择框 -->
            <div class="user-select">
              <el-checkbox v-model="user.selected" />
            </div>

            <!-- 用户信息 -->
            <div class="user-info">
              <el-avatar :size="50" class="user-avatar">
                <img :src="user.avatar" />
              </el-avatar>

              <div class="user-details">
                <h4 class="username">{{ user.username }}</h4>
                <div class="user-meta">
                  <span class="username-id">{{ user.email }}</span>
                  <el-tag :type="user.sex === 1 ? 'primary' : 'danger'" size="small">
                    {{ user.sex === 1 ? '男' : '女' }}
                  </el-tag>
                </div>
              </div>
            </div>

            <!-- 联系方式 -->
            <div class="contact-info">
              <div class="phone">{{ user.phone }}</div>
            </div>

            <!-- 状态 -->
            <div class="status-info">
              <el-tag :type="user.status === 1 ? 'success' : 'warning'" effect="light">
                {{ user.status === 1 ? '正常' : '封禁' }}
              </el-tag>
            </div>

            <!-- 操作按钮 -->
            <div class="user-actions">
              <el-button
                link
                :type="user.status === 1 ? 'warning' : 'success'"
                size="small"
                @click="updateUserStatus(user)"
              >
                {{ user.status === 1 ? '禁用' : '启用' }}
              </el-button>
              <el-button link type="danger" size="small" @click="deleteUser(user.id)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 空数据状态 -->
      <div v-if="userList.length === 0 && !loading" class="empty-data">
        <el-empty description="暂无用户数据"> </el-empty>
      </div>

      <!-- 搜索无结果状态 -->
      <div v-if="searchKeyword && filteredUsers.length === 0" class="no-results">
        <el-empty description="未找到匹配的用户">
          <el-button @click="searchKeyword = ''">清空搜索</el-button>
        </el-empty>
      </div>

      <!-- 分页组件 -->
      <div v-if="userList.length > 0" class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[5, 10, 20, 50]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.user-management {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  position: relative;
  min-height: 100vh;
}

.management-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e8e8e8;
}

.management-header h2 {
  margin: 0;
  color: #333;
  font-size: 24px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.selected-count {
  color: #666;
  font-size: 14px;
}

.search-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.stats {
  display: flex;
  gap: 20px;
  color: #666;
  font-size: 14px;
}

.management-container {
  margin-bottom: 100px;
  padding-bottom: 20px;
}

.management-head {
  display: grid;
  grid-template-columns: 60px 1fr 200px 150px 100px 150px;
  gap: 15px;
  padding: 15px 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e8e8e8;
  align-items: center;
  font-weight: 500;
  color: #333;
}

.head-label {
  text-align: center;
}

.head-label:first-of-type {
  text-align: left;
}

.user-list {
  background-color: #fff;
}

.user-item {
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.3s ease;
}

.user-item:hover {
  background-color: #fafafa;
}

.user-item.selected {
  background-color: #f0f7ff;
}

.user-content {
  display: grid;
  grid-template-columns: 60px 1fr 200px 150px 100px 150px;
  gap: 15px;
  padding: 20px;
  align-items: center;
}

.user-select {
  display: flex;
  justify-content: center;
}

.user-info {
  display: flex;
  align-items: flex-start;
  gap: 15px;
}

.user-avatar {
  background-color: #409eff;
}

.user-details {
  flex: 1;
}

.username {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.user-meta {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.username-id {
  color: #666;
  font-size: 12px;
}

.create-time {
  font-size: 12px;
  color: #999;
}

.contact-info {
  text-align: left;
}

.email,
.phone {
  margin-bottom: 4px;
  font-size: 14px;
  text-align: center;
}

.id-card-info {
  text-align: center;
}

.id-card {
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

.status-info {
  text-align: center;
}

.user-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.empty-data,
.no-results {
  padding: 60px 0;
  text-align: center;
}

.pagination-container {
  padding: 20px;
  display: flex;
  justify-content: center;
  border-top: 1px solid #f0f0f0;
}

/* 底部悬浮栏样式 */
.management-footer-affix {
  width: 100%;
  background: #fff;
  border-top: 1px solid #e8e8e8;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 30px;
}

.summary {
  text-align: right;
  font-size: 14px;
  color: #666;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-management {
    padding: 10px;
  }

  .management-container {
    margin-bottom: 120px;
  }

  .management-head {
    grid-template-columns: 40px 1fr;
    gap: 10px;
  }

  .head-label:not(:first-child) {
    display: none;
  }

  .user-content {
    grid-template-columns: 40px 1fr;
    gap: 10px;
    position: relative;
    padding: 15px 10px;
  }

  .contact-info,
  .id-card-info,
  .status-info,
  .user-actions {
    grid-column: 2;
    text-align: left;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px 0;
    border-top: 1px solid #f0f0f0;
  }

  .user-actions {
    border: none;
    justify-content: flex-start;
    gap: 15px;
  }

  .footer-content {
    flex-direction: column;
    gap: 15px;
    text-align: center;
    padding: 12px 15px;
  }

  .footer-left {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
    width: 100%;
  }

  .summary {
    text-align: center;
    width: 100%;
  }
}
</style>
