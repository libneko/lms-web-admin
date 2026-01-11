import request from '@/utils/request'
import type { ApiResponse, GetBorrows, Borrow, SendBorrow } from './types'

export const getBorrow = (data: SendBorrow): Promise<ApiResponse<GetBorrows>> => {
  const params = new URLSearchParams()
  params.append('page', data.page.toString())
  params.append('pageSize', data.pageSize.toString())
  if (data.beginTime) {
    params.append('beginTime', data.beginTime)
  }
  if (data.endTime) {
    params.append('endTime', data.endTime)
  }
  if (data.number) {
    params.append('number', data.number)
  }

  if (data.status) {
    params.append('status', data.status)
  }
  return request.get(`/admin/borrow/conditionSearch?${params.toString()}`)
}
export const getBorrowDetailApi = (borrow_id: number): Promise<ApiResponse<Borrow>> => {
  return request.get(`/admin/borrow/detail/${borrow_id}`)
}
