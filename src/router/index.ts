import { createRouter, createWebHistory } from 'vue-router'

import IndexView from '@/views/index/index.vue'
import LayoutView from '@/views/layout/index.vue'
import LoginView from '@/views/login/index.vue'

import BookManagementView from '@/views/book-management/index.vue'
import UserManagementView from '@/views/user-management/index.vue'
import BorrowView from '@/views/borrow/index.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/admin',
      name: 'home',
      component: LayoutView,
      children: [
        {
          path: '',
          name: 'index',
          component: IndexView,
        },
        {
          path: 'book-management',
          name: 'book-management',
          component: BookManagementView,
          meta: { title: '图书管理' },
        },
        {
          path: 'user-management',
          name: 'user-management',
          component: UserManagementView,
          meta: { title: '用户管理' },
        },
        {
          path: 'borrow',
          name: 'borrow',
          component: BorrowView,
          meta: { title: '借阅管理' },
        },
      ],
    },
    { path: '/login', name: 'login', component: LoginView },
  ],
})

function isLoggedIn(): boolean {
  const user = localStorage.getItem('login_user')
  return !!user
}

router.beforeEach((to, _from, next) => {
  if (!isLoggedIn() && to.name !== 'login' && to.name !== 'index') {
    next({ name: 'login' })
  } else {
    next()
  }
})

export default router
