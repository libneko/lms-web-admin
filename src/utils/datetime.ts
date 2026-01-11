import { Temporal } from '@js-temporal/polyfill'

/**
 * 使用 Temporal 将 ISO 8601 格式的时间字符串转换为友好的相对时间显示
 * @param isoString ISO 8601 格式时间字符串 (如: "2024-01-10T15:30:00.111")
 * @returns 美化后的时间显示
 */
export function formatRelativeTime(isoString: string): string {
  if (!isoString) return ''

  try {
    const timeZone = Temporal.Now.timeZoneId()
    const zonedDateTime = Temporal.PlainDateTime.from(isoString).toZonedDateTime(timeZone)
    const nowZoned = Temporal.Now.zonedDateTimeISO(timeZone)

    // 计算时间差
    const duration = nowZoned.since(zonedDateTime)
    const totalSeconds = duration.total('seconds')

    // 根据时间差返回不同的格式
    if (totalSeconds < 60) {
      return '刚刚'
    } else if (totalSeconds < 3600) {
      // 小于1小时
      const minutes = Math.floor(totalSeconds / 60)
      return `${minutes}分钟前`
    } else if (totalSeconds < 86400) {
      // 小于1天
      const hours = Math.floor(totalSeconds / 3600)
      return `${hours}小时前`
    } else if (totalSeconds < 604800) {
      // 小于7天
      const days = Math.floor(totalSeconds / 86400)
      return `${days}天前`
    } else if (zonedDateTime.year === nowZoned.year) {
      // 同一年，显示月-日 时:分
      return `${zonedDateTime.month}月${zonedDateTime.day}日 ${String(zonedDateTime.hour).padStart(2, '0')}:${String(zonedDateTime.minute).padStart(2, '0')}`
    } else {
      // 不同年，显示完整日期
      return `${zonedDateTime.year}年${zonedDateTime.month}月${zonedDateTime.day}日`
    }
  } catch (error) {
    console.error('时间格式化错误:', error)
    return isoString
  }
}

/**
 * 格式化为标准的日期时间显示
 * @param isoString ISO 8601 格式时间字符串
 * @returns 格式化后的时间 (YYYY-MM-DD HH:mm:ss)
 */
export function formatDateTime(isoString: string): string {
  if (!isoString) return ''

  try {
    const timeZone = Temporal.Now.timeZoneId()
    const zonedDateTime = Temporal.PlainDateTime.from(isoString).toZonedDateTime(timeZone)

    return `${zonedDateTime.year}-${String(zonedDateTime.month).padStart(2, '0')}-${String(zonedDateTime.day).padStart(2, '0')} ${String(zonedDateTime.hour).padStart(2, '0')}:${String(zonedDateTime.minute).padStart(2, '0')}:${String(zonedDateTime.second).padStart(2, '0')}`
  } catch (error) {
    console.error('时间格式化错误:', error)
    return isoString
  }
}
