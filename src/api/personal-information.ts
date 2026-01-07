import request from '@/utils/request'
import type { ApiResponse, ReceivePerson, SendPersonId } from './types'

export const informationApi = (id: number): Promise<ApiResponse<ReceivePerson>> => {
  return request.get(`/users/${id}`)
}
