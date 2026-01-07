import request from '@/utils/request'
import type { ApiResponse, Book, BookData, GetBooks, SendBookData, SendSearch } from './types'

export const submitBookApi = (book: SendBookData): Promise<ApiResponse<BookData>> => {
  return request.post('/admin/book', book)
}

export const deleteBookApi = (ids: string): Promise<ApiResponse<object>> => {
  return request.delete(`/admin/book?ids=${ids}`)
}

export const changeStatusApi = (id: number, status: number): Promise<ApiResponse<object>> => {
  return request.post(`/admin/book/status/${status}`, null, {
    params: {
      id: id,
    },
  })
}

export const updateApi = (book: SendBookData): Promise<ApiResponse<object>> => {
  return request.put('/admin/book', book)
}

export const getBooks = (data: SendSearch): Promise<ApiResponse<GetBooks>> => {
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
  return request.get(`/admin/book/page?${params.toString()}`)
}

export const upload = (file: File): Promise<ApiResponse<string>> => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/admin/common/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
