import router from '@/router'
import axios, { AxiosError } from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: '/api',
  timeout: 600000,
})

request.interceptors.request.use(
  (config) => {
    const login_user = JSON.parse(localStorage.getItem('login_user')!)
    if (login_user && login_user.token) {
      config.headers.authentication = login_user.token
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

request.interceptors.response.use(
  (respose) => {
    return respose.data
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // 提示
      ElMessage.error('登录超时，请重新登录')
      // 跳转到登录界面
      router.push('/login')
    } else {
      ElMessage.error('接口访问异常')
    }
    return Promise.reject(error)
  },
)

export default request
