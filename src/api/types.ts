export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface LoginForm {
  username: string
  password: string
}

export interface LoginToken {
  id: number
  username: string
  email: string
  avatar: string
  token: string
}

export interface BookStock {
  id: number
  book_id: number
  stock: number
}

export interface Book {
  id: number
  name: string
  author: string
  category_id: string
  image: string
  description: string
  status: number
  stock: number
  isbn: string
  location: string
  publisher: string
  update_time: string
}

export interface SendBookData {
  id?: number | null
  name: string
  author: string
  category_id: string
  price: number
  image: string
  description: string
  status: number
  stock: number
  isbn: string
  location: string
  publisher: string
}

export interface Category {
  id: number
  name: string
  sort: number
  status: number
}

export interface BookData {
  book_id: number
}

export interface ReceiveSearch {
  total: number
  records: Book[]
}

export interface SendSearch {
  page: number
  pageSize: number
  name: string
  categoryId: number
  status?: number | null
}

export interface GetBooks {
  total: number
  records: Book[]
}

export interface SendPersonId {
  user_id: number
}

export interface ReceivePerson {
  user_id: string
  name: string
  email: string
}

export interface Product extends Book {
  quantity: number
  selected: boolean
  specifications: string[]
  freeShipping: boolean
  guarantee: boolean
  stock: number
}

export interface User {
  id: number
  username: string
  email: string
  phone: string
  sex: number
  avatar: string
  status: number
}

export interface GetUsers {
  total: number
  records: User[]
}

export interface items {
  book_id: number
  title: string
  quantity: number
  price: number
}

export interface Order {
  id: number
  number: string
  status: number
  user_id: number
  borrow_time: string
  renew_count:number
  due_date: string
  user_name: string
  return_time: string
  borrow_books: string
  borrow_detail_list: OrderDetail[]
}

export interface OrderDetail {
  id: number
  name: string
  borrow_record_id: number
  book_id: number
  number: number
  image: string
}

export interface SendOrder {
  beginTime: string
  endTime: string
  number: string
  page: string
  pageSize: string

  status: string
}

export interface GetOrders {
  total: number
  records: Order[]
}

export interface Notice {
  id: string
  content: string
  status: number
  create_time: string
}
