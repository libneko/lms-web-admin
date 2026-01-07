import { ref } from 'vue'
import type { Ref } from 'vue' // 引入 Ref 类型
import { ElNotification } from 'element-plus'
import router from '@/router'

// 1. 定义后端推送的消息格式契约
// 这样在代码里使用 data.xxx 时会有自动提示
export interface NotificationPayload {
  type: 'new_order' | 'urge' // 限制 type 只能是这几个字符串
  title: string
  content: string
  orderId?: string | number // 加上 ? 表示该字段可能不存在，防止报错
}

export function useWebSocket() {
  // 2. 明确 ws 的类型是 WebSocket 对象或者 null
  const ws: Ref<WebSocket | null> = ref(null)

  // 3. 为参数 userId 添加类型
  const connect = (userId: string | number) => {
    // 建议：实际项目中通常使用环境变量配置 WebSocket 地址
    const url = `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws/${userId}`
    // 简单检查浏览器支持情况
    if (typeof WebSocket === 'undefined') {
      console.error('您的浏览器不支持 WebSocket')
      return
    }

    ws.value = new WebSocket(url)
    ws.value.onopen = () => {
      console.log('🔗 WebSocket 连接成功')
    }

    // 4. 为 event 指定 MessageEvent 类型
    ws.value.onmessage = (event: MessageEvent) => {
      try {
        // 解析数据并断言为我们定义的接口类型
        const data = JSON.parse(event.data) as NotificationPayload
        handleMessage(data)
      } catch (error) {
        console.error('消息解析失败:', error)
      }
    }

    ws.value.onclose = (event: CloseEvent) => {
      console.log('🔌 WebSocket 连接断开', event.code, event.reason)
      // 可以在这里添加重连逻辑
    }

    ws.value.onerror = (event: Event) => {
      console.error('❌ WebSocket 错误', event)
    }
  }

  // 5. 为处理函数的参数指定类型
  const handleMessage = (data: NotificationPayload) => {
    // 播放提示音
    const audio = new Audio('/sound.mp3')
    audio.play().catch(() => {
      // 忽略自动播放受限的错误，或者提示用户
      console.warn('提示音播放失败(可能是浏览器策略限制)')
    })

    // Element Plus 弹窗
    ElNotification({
      title: data.title || '新通知',
      message: `您有一条新订单或催单提醒，请及时查看，${data.content}`,
      // 根据类型动态设置弹窗样式
      type: data.type === 'urge' ? 'warning' : 'success',
      duration: 0, // 不自动关闭
      position: 'top-right',
      onClick: () => {
        if (data.orderId) {
          console.log(`跳转到订单: ${data.orderId}`)
          router.push(`/admin/order`)
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
