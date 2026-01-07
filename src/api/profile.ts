import request from '@/utils/request'
import type { ApiResponse, User } from './types'

export const getProfile = (id: number): Promise<ApiResponse<User>> => {
  return request.get('/user/profile', {
    params: { id },
  })
}

export const updateProfile = (data: User): Promise<ApiResponse<boolean>> => {
  return request.put('/user/profile', data)
}
