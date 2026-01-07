import request from '@/utils/request'
import type { ApiResponse, SendSearch, ReceiveSearch } from './types'

// 登录
export const searchApi = (data: SendSearch): Promise<ApiResponse<ReceiveSearch>> => {
  const params = new URLSearchParams()
  params.append('page', data.page.toString())
  params.append('pageSize', data.pageSize.toString())
  if (data.name) {
    params.append('name', data.name)
  }
  if (data.categoryId) {
    params.append('categoryId', data.categoryId.toString())
  }
  if (data.status) {
    params.append('status', data.status.toString())
  }
  return request.get(`/user/book/page?${params.toString()}`)
}
