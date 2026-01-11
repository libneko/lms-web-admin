<script setup lang="ts">
import { loginApi } from '@/api/login'
import type { ApiResponse, LoginToken } from '@/api/types'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import AuthLayout from '@/component/auth-layout.vue'
import { reactive, ref } from 'vue'

const router = useRouter()
const activeTab = ref<'password'>('password')

const pwdForm = reactive({
  username: '',
  password: '',
})

const login = async () => {
  let result: ApiResponse<LoginToken>

  if (!pwdForm.password) {
    ElMessage.warning('请输入密码')
    return
  }

  result = await loginApi({
    username: pwdForm.username,
    password: pwdForm.password,
  })

  if (result.code === 1) {
    ElMessage.success('登录成功')
    localStorage.setItem('login_user', JSON.stringify(result.data))
    router.push('/admin')
  } else {
    ElMessage.error(result.message)
  }
}
</script>

<template>
  <AuthLayout>
    <el-tabs v-model="activeTab" class="login-tabs" stretch="false">
      <el-tab-pane label="密码登录" name="password">
        <el-form>
          <p class="title">欢迎回来</p>

          <el-form-item>
            <el-input v-model="pwdForm.username" placeholder="请输入管理名" maxlength="20" />
          </el-form-item>

          <el-form-item>
            <el-input
              v-model="pwdForm.password"
              type="password"
              placeholder="请输入密码"
              show-password
            />
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>

    <el-button class="button" type="primary" @click="login">登 录</el-button>
  </AuthLayout>
</template>

<style scoped>
:deep(.el-input__suffix) {
  position: absolute;
  right: 10px;
  height: 100%;
  display: flex;
  align-items: center;
}

:deep(.el-input__wrapper) {
  padding-right: 40px !important;
}

/* 使 el-tabs 标签居中 */
.login-tabs :deep(.el-tabs__nav-wrap) {
  display: flex;
  justify-content: center;
}
.login-tabs :deep(.el-tabs__nav-scroll) {
  display: inline-block;
}
.login-tabs :deep(.el-tabs__nav) {
  float: none !important;
  display: inline-flex;
}

.title {
  font-size: 30px;
  font-family: '楷体';
  text-align: center;
  margin-bottom: 30px;
  font-weight: bold;
}

.button {
  margin-top: 30px;
  width: 100%;
}

.auth-hints {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  font-size: 14px;
}

.auth-hints a {
  color: var(--el-color-primary);
  cursor: pointer;
  text-decoration: none;
}
</style>
