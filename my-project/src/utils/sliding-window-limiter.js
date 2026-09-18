/**
 * 滑动窗口限流器（Sliding Window Log）
 *
 * 原理：记录每个 key 在时间窗口内的所有请求时间戳，
 * 判断时先剔除已过期的记录，再看剩余记录数是否达到上限。
 *
 * 相比固定窗口，它解决了窗口边界处「双倍突发」的问题，
 * 因为窗口是跟着当前时间滑动的，而不是固定的时间格子。
 */

class SlidingWindowRateLimiter {
  /**
   * @param {number} limit 窗口内允许的最大请求数
   * @param {number} windowMs 窗口大小（毫秒）
   */
  constructor(limit, windowMs) {
    this.limit = limit
    this.windowMs = windowMs
    // 每个 key 维护一个时间戳数组
    this.records = new Map()
  }

  /**
   * 尝试获取一次放行机会
   * @param {string} [key='__default__'] 资源标识
   * @returns {{ allowed: boolean, remaining: number, retryAfterMs: number }}
   */
  tryAcquire(key = '__default__') {
    const now = Date.now()
    const windowStart = now - this.windowMs

    if (!this.records.has(key)) {
      this.records.set(key, [])
    }
    const timestamps = this.records.get(key)

    // 剔除过期记录
    while (timestamps.length > 0 && timestamps[0] < windowStart) {
      timestamps.shift()
    }

    if (timestamps.length >= this.limit) {
      const oldest = timestamps[0]
      return {
        allowed: false,
        remaining: 0,
        retryAfterMs: oldest + this.windowMs - now
      }
    }

    timestamps.push(now)
    return {
      allowed: true,
      remaining: this.limit - timestamps.length,
      retryAfterMs: 0
    }
  }

  /**
   * 重置计数
   * @param {string} [key] 不传则清空所有
   */
  reset(key) {
    if (key === undefined) {
      this.records.clear()
    } else {
      this.records.delete(key)
    }
  }
}

export default SlidingWindowRateLimiter

/**
 * 使用示例：
 *
 * import SlidingWindowRateLimiter from '@/utils/sliding-window-limiter'
 *
 * // 每秒最多 5 次请求
 * const limiter = new SlidingWindowRateLimiter(5, 1000)
 *
 * function callApi() {
 *   const { allowed, retryAfterMs } = limiter.tryAcquire('user-list')
 *   if (!allowed) {
 *     console.warn(`请求过于频繁，请 ${retryAfterMs}ms 后再试`)
 *     return
 *   }
 *   // 正常发起请求...
 * }
 */
