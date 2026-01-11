export enum OrderStatus {
  /** 已逾期 */
  OVERDUE = 3,
  /** 借阅中 */
  BORROWING = 1,
  /** 已归还 */
  COMPLETED = 2,

}

interface StatusConfig {
  label: string
  type: 'warning' | 'primary' | 'success' | 'info' | 'danger' | '' // Element Plus 的 type 类型
}

// 使用 Record 建立映射关系
export const OrderStatusMap: Record<number, StatusConfig> = {
  [OrderStatus.OVERDUE]: { label: '已逾期', type: 'warning' },
  [OrderStatus.BORROWING]: { label: '借阅中', type: 'success' },
  [OrderStatus.COMPLETED]: { label: '已归还', type: 'info' },

}
