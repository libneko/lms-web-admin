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
  if (data.phone) {
    params.append('phone', data.phone)
  }
  if (data.status) {
    params.append('status', data.status)
  }
  console.log('传入参数' + params.toString())
  return request.get(`/admin/order/conditionSearch?${params.toString()}`)
}
export const GetOrderDetailApi = (order_id: number): Promise<ApiResponse<Order>> => {
  return request.get(`/admin/order/detail/${order_id}`)
}

// 订单送达接口
export const DeliveryOrderApi = (order_id: number): Promise<ApiResponse<object>> => {
  return request.put(`/admin/order/delivery/${order_id}`)
}
// 完成订单接口
export const CompleteOrderApi = (order_id: number): Promise<ApiResponse<object>> => {
  return request.put(`/admin/order/complete/${order_id}`)
}

//订单派送
export const SendOrderApi = (order_id: number): Promise<ApiResponse<object>> => {
  return request.put(`/admin/order/ship/${order_id}`)
}
