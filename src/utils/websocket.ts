import { ref } from 'vue'
import type { Ref } from 'vue' // 引入 Ref 类型
import { ElNotification } from 'element-plus'
import router from '@/router'

export interface NotificationPayload {
  type: number
  borrowRecordId: string | number
  borrowNumber: string
  userName: string
  content: string
}

export function useWebSocket() {
  const ws: Ref<WebSocket | null> = ref(null)

  const connect = (userId: string | number) => {
    const url = `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws/${userId}`

    ws.value = new WebSocket(url)
    ws.value.onopen = () => {
      console.log('🔗 WebSocket 连接成功')
    }

    ws.value.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as NotificationPayload
        handleMessage(data)
      } catch (error) {
        console.error('消息解析失败:', error)
      }
    }

    ws.value.onclose = (event: CloseEvent) => {
      console.log('🔌 WebSocket 连接断开', event.code, event.reason)
    }

    ws.value.onerror = (event: Event) => {
      console.error('❌ WebSocket 错误', event)
    }
  }

  const handleMessage = (data: NotificationPayload) => {
    ElNotification({
      title: '借阅通知',
      message: data.content,
      type: 'success',
      duration: 0,
      position: 'top-right',
      onClick: () => {
        if (data.borrowRecordId) {
          router.push(`/admin/borrow`)
        }
      },
    })
  }

  // 手动关闭连接的方法（可选）
  const close = () => {
    ws.value?.close()
  }

  return {
    ws,
    connect,
    close,
  }
}
