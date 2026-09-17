/**
 * 固定窗口计数器限流器（Fixed Window Counter）
 *
 * 原理：把时间轴切成固定大小的窗口（例如每 1 秒一个窗口）。
 * 每个窗口内最多允许 limit 次请求；窗口结束后计数器清零，进入下一个窗口。
 *
 * 优点：实现简单、内存占用小。
 * 缺点：在窗口边界处可能出现「双倍」突发流量
 *       —— 例如在窗口末尾和下一窗口开头各打满 limit 次请求。
 *       若对边界敏感，可改用「滑动窗口」或「令牌桶」算法。
 */

class FixedWindowRateLimiter {
  /**
   * @param {number} limit 每个窗口允许的最大请求数（必须为 > 0 的整数）
   * @param {number} windowMs 窗口大小（毫秒，必须为 > 0）
   */
  constructor(limit, windowMs) {
    if (!Number.isInteger(limit) || limit <= 0) {
      throw new Error('limit 必须是大于 0 的整数')
    }
    if (!Number.isFinite(windowMs) || windowMs <= 0) {
      throw new Error('windowMs 必须是大于 0 的数字')
    }
    this.limit = limit
    this.windowMs = windowMs
    // 每个 key 维护一个独立窗口：{ count, windowStart }
    this.buckets = new Map()
  }

  /**
   * 尝试获取一次放行机会（即判断本次请求是否被允许）。
   * @param {string} [key='__default__'] 资源标识，不同 key 独立计数
   * @returns {{ allowed: boolean, remaining: number, resetAt: number }}
   *          allowed：是否允许通过
   *          remaining：本窗口剩余可用次数
   *          resetAt：当前窗口重置（下一窗口开始）的时间戳（Date.now() 基准）
   */
  tryAcquire(key = '__default__') {
    const now = Date.now()
    let bucket = this.buckets.get(key)

    // 没有桶，或当前时间已超出该桶所属窗口 -> 开启一个全新窗口
    if (!bucket || now - bucket.windowStart >= this.windowMs) {
      bucket = { count: 0, windowStart: now }
      this.buckets.set(key, bucket)
    }

    if (bucket.count >= this.limit) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: bucket.windowStart + this.windowMs
      }
    }

    bucket.count += 1
    return {
      allowed: true,
      remaining: this.limit - bucket.count,
      resetAt: bucket.windowStart + this.windowMs
    }
  }

  /**
   * 重置计数。
   * @param {string} [key] 不传则清空所有 key 的计数
   */
  reset(key) {
    if (key === undefined) {
      this.buckets.clear()
    } else {
      this.buckets.delete(key)
    }
  }
}

export default FixedWindowRateLimiter

/**
 * 使用示例：
 *
 * import FixedWindowRateLimiter from '@/utils/rate-limiter'
 *
 * // 每秒最多 5 次请求
 * const limiter = new FixedWindowRateLimiter(5, 1000)
 *
 * function callApi() {
 *   const { allowed, remaining } = limiter.tryAcquire('user-list')
 *   if (!allowed) {
 *     console.warn('请求过于频繁，请稍后再试，剩余次数：', remaining)
 *     return
 *   }
 *   // 正常发起请求...
 * }
 */
