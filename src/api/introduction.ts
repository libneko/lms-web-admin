import request from '@/utils/request'
import type { ApiResponse, Book } from './types'

export const bookApi = (id: number): Promise<ApiResponse<Book>> => {
  return request.get(`/user/book/${id}`)
}
