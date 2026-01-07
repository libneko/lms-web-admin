import request from '@/utils/request'
import type { ApiResponse, LoginForm, LoginToken } from './types'

// 登录
export const loginApi = (data: LoginForm): Promise<ApiResponse<LoginToken>> => {
  return request.post('/admin/login', data)
}

export const logoutApi = (): Promise<ApiResponse<null>> => {
  return request.post('/admin/logout')
}
