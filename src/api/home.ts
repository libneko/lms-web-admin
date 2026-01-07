import request from '@/utils/request'
import type { ApiResponse, Category, Book } from './types'

// 获取分类
export const getCategories = (): Promise<ApiResponse<Category[]>> => {
  return request.get('/user/category/list')
}

// 获取 book
export const getRandomBooks = (number: number): Promise<ApiResponse<Book[]>> => {
  return request.get(`/user/book/random?number=${number}`)
}
