<script setup lang="ts">
import type { LoginToken } from '@/api/types'
import { Theme, setTheme as applyTheme } from '@/api/meta'
import { onBeforeUnmount, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { logoutApi } from '@/api/login'
import { useWebSocket } from '@/utils/websocket'

// 当前登录的管理员
const { connect, close } = useWebSocket()
const login_user = ref<LoginToken | null>(null)
const router = useRouter()

// 下拉菜单逻辑
const isDropdownOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isDropdownOpen.value = false
  }
}

const switchUser = () => {
  window.location.href = `${import.meta.env.VITE_SWITCH_API}/login`
}

const handleStorageChange = (event: StorageEvent) => {
  if (event.key === 'theme') {
    currentTheme.value = (event.newValue as Theme) || Theme.SYSTEM
  }
}

onMounted(() => {
  login_user.value = JSON.parse(localStorage.getItem('login_user')!) as LoginToken
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('storage', handleStorageChange)
  connect(login_user.value.id)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('storage', handleStorageChange)
})
onBeforeUnmount(() => {
  // 组件销毁前断开连接，防止内存泄漏
  close()
})
// 退出登录
const logout = async () => {
  localStorage.removeItem('login_user')
  await logoutApi()
  router.push('/login')
}

// 外观子菜单逻辑
const isAppearanceOpen = ref(false)
const currentTheme = ref<Theme>((localStorage.getItem('theme') as Theme) || Theme.SYSTEM)

const handleSetTheme = (theme: Theme) => {
  currentTheme.value = theme
  applyTheme(theme)
  isAppearanceOpen.value = false
  isDropdownOpen.value = false
}
</script>

<template>
  <el-container>
    <!-- 左侧菜单 -->
    <el-aside class="aside">
      <el-menu router="true">
        <!-- 首页菜单 -->
        <div class="title">
          <span>图书馆</span>
        </div>
        <div class="menu_item">
          <el-menu-item index="/admin">
            <el-icon><Promotion /></el-icon> 首页
          </el-menu-item>
          <el-menu-item index="/admin/book-management">
            <el-icon><Document /></el-icon> 图书管理
          </el-menu-item>
          <el-menu-item index="/admin/user-management">
            <el-icon><UserFilled /></el-icon> 用户管理
          </el-menu-item>
          <el-menu-item index="/admin/order">
            <el-icon><ChatDotRound /></el-icon> 借阅管理
          </el-menu-item>
        </div>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <span class="left_title">{{ router.currentRoute.value.meta.title }}</span>

        <div class="user-dropdown" ref="dropdownRef" v-if="login_user != null">
          <img :src="login_user?.avatar" class="icon" @click="toggleDropdown" />

          <Transition name="dropdown">
            <div v-show="isDropdownOpen" class="dropdown-menu">
              <div class="dropdown-item">
                <div class="user-info">
                  <img :src="login_user?.avatar" class="icon-small" />
                  <span>{{ login_user?.username }}</span>
                </div>
              </div>
              <div class="dropdown-item" @click="switchUser">切换到用户端</div>
              <div
                class="dropdown-item appearance-item"
                @mouseenter="isAppearanceOpen = true"
                @mouseleave="isAppearanceOpen = false"
              >
                <span>外观</span>
                <el-icon class="arrow-icon"><ArrowRight /></el-icon>
                <Transition name="dropdown">
                  <div v-show="isAppearanceOpen" class="submenu">
                    <div
                      class="dropdown-item theme-item"
                      @click.stop="handleSetTheme(Theme.SYSTEM)"
                    >
                      <el-icon
                        class="check-icon"
                        :style="{ opacity: currentTheme === Theme.SYSTEM ? 1 : 0 }"
                      >
                        <Check />
                      </el-icon>
                      <span>跟随系统</span>
                    </div>
                    <div class="dropdown-item theme-item" @click.stop="handleSetTheme(Theme.LIGHT)">
                      <el-icon
                        class="check-icon"
                        :style="{ opacity: currentTheme === Theme.LIGHT ? 1 : 0 }"
                      >
                        <Check />
                      </el-icon>
                      <span>浅色</span>
                    </div>
                    <div class="dropdown-item theme-item" @click.stop="handleSetTheme(Theme.DARK)">
                      <el-icon
                        class="check-icon"
                        :style="{ opacity: currentTheme === Theme.DARK ? 1 : 0 }"
                      >
                        <Check />
                      </el-icon>
                      <span>深色</span>
                    </div>
                  </div>
                </Transition>
              </div>
              <div class="dropdown-item" @click="logout">退出登录</div>
            </div>
          </Transition>
        </div>

        <el-button v-else type="primary" @click="router.push('/login')">登录</el-button>
      </el-header>

      <el-main class="main-content">
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.main-content {
  background-color: rgba(248, 228, 228, 0.2);
  height: calc(100vh - 60px);
  overflow-y: auto;
  padding: 0%;
}

.header {
  background-image: linear-gradient(
    to right,
    rgba(20, 19, 19, 0.9),
    rgba(20, 19, 19, 0.9),
    rgba(241, 218, 218, 0.7),
    rgba(241, 218, 218, 0.8),
    rgba(20, 19, 19, 0.7),
    rgba(20, 19, 19, 0.8),
    rgba(20, 19, 19, 1)
  );
  justify-content: space-between;
  align-items: center;
  display: flex;
}

.title {
  background-color: rgba(241, 218, 218, 0.1);
  font-size: 40px;
  font-family: 楷体;
  line-height: 60px;
  font-weight: bolder;
  width: 100%;
  text-align: center;
}

.left_title {
  color: rgb(236, 192, 192);
  font-size: 30px;
  font-weight: bolder;
  line-height: 50px;
}

a {
  color: rgb(230, 218, 218);
  text-decoration: none;
}

.aside {
  width: 200px;
  background-color: rgba(241, 218, 218, 0.1);
  height: 100vh;
}

.menu_item {
  display: flex;
  flex-direction: column;
  background-color: rgba(241, 218, 218, 0.1);
}

.icon {
  width: 32px;
  height: 32px;
  cursor: pointer;
  border-radius: 50%;
  margin: 5px;
}

.user-dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  background-color: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-light);
  border-radius: 10px;
  box-shadow: var(--el-box-shadow-light);
  z-index: 2000;
  min-width: 160px;
  padding: 10px;
  transform-origin: top right;
}

.dropdown-item {
  padding: 0 20px;
  line-height: 36px;
  cursor: pointer;
  color: var(--el-text-color-regular);
  font-size: 14px;
}

.dropdown-item:hover {
  background-color: var(--el-fill-color-light);
  border-radius: 5px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-small {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.9);
}

.appearance-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.submenu {
  position: absolute;
  right: 100%;
  top: 0;
  background-color: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-light);
  border-radius: 10px;
  box-shadow: var(--el-box-shadow-light);
  z-index: 2001;
  min-width: 120px;
  padding: 10px;
  margin-right: 5px;
}

.theme-item {
  display: flex;
  align-items: center;
}

.check-icon {
  margin-right: 5px;
}
</style>
