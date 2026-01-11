import request from '@/utils/request'
import type { ApiResponse, GetOrders, Order, SendOrder } from './types'

export const getOrder = (data: SendOrder): Promise<ApiResponse<GetOrders>> => {
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
  console.log('传入参数' + params.toString())
  return request.get(`/admin/borrow/conditionSearch?${params.toString()}`)
}
export const GetOrderDetailApi = (order_id: number): Promise<ApiResponse<Order>> => {
  return request.get(`/admin/borrow/detail/${order_id}`)
}
