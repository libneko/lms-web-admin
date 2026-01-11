export enum OrderStatus {
  /** 已逾期 */
  PENDING_PAYMENT = 3,
  /** 借阅中 */
  SHIPPED = 1,
  /** 已归还 */
  COMPLETED = 2,

}

interface StatusConfig {
  label: string
  type: 'warning' | 'primary' | 'success' | 'info' | 'danger' | '' // Element Plus 的 type 类型
}

// 使用 Record 建立映射关系
export const OrderStatusMap: Record<number, StatusConfig> = {
  [OrderStatus.PENDING_PAYMENT]: { label: '已逾期', type: 'danger' },
  [OrderStatus.SHIPPED]: { label: '借阅中', type: 'success' },
  [OrderStatus.COMPLETED]: { label: '已归还', type: 'info' },

}
