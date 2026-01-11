import request from '@/utils/request'
import type { ApiResponse, GetUsers, SendSearch, User } from './types'

export const getUserApi = (data: SendSearch): Promise<ApiResponse<GetUsers>> => {
  const params = new URLSearchParams()
  params.append('page', data.page.toString())
  params.append('pageSize', data.pageSize.toString())
  if (data.name) {
    params.append('username', data.name.toString())
  }
  return request.get(`/admin/user/page?${params.toString()}`)
}

export const deleteUserApi = (ids: string): Promise<ApiResponse<object>> => {
  return request.delete(`/admin/user?ids=${ids}`)
}



export const changeStatusApi = (id: number, status: number): Promise<ApiResponse<object>> => {
  return request.post(`/admin/user/status/${status}`, null, {
    params: {
      id: id,
    },
  })
}
