export enum OrderStatus {
  /** 待付款 */
  PENDING_PAYMENT = 1,
  /** 已付款 */
  PAID = 2,
  /** 已发货 */
  SHIPPED = 3,
  /** 已送达 */
  DELIVERED = 4,
  /** 已完成 */
  COMPLETED = 5,
  /** 已取消 */
  CANCELLED = 6,
}

interface StatusConfig {
  label: string
  type: 'warning' | 'primary' | 'success' | 'info' | 'danger' | '' // Element Plus 的 type 类型
}

// 使用 Record 建立映射关系
export const OrderStatusMap: Record<number, StatusConfig> = {
  [OrderStatus.PENDING_PAYMENT]: { label: '待付款', type: 'warning' },
  [OrderStatus.PAID]: { label: '已付款', type: 'primary' },
  [OrderStatus.SHIPPED]: { label: '已发货', type: 'success' },
  [OrderStatus.COMPLETED]: { label: '已完成', type: 'success' },
  [OrderStatus.DELIVERED]: { label: '已送达', type: 'success' },
  [OrderStatus.CANCELLED]: { label: '已取消', type: 'info' },
}
