/**
 * 令牌桶限流器（Token Bucket）
 *
 * 原理：有一个容量为 capacity 的「桶」，系统以恒定速率 tokensPerSecond
 * 往桶里放令牌（最多放满到 capacity，多余丢弃）。每次请求需要取出 1 个令牌：
 *   - 桶里有令牌 -> 放行并扣减 1 个令牌
 *   - 桶里没令牌 -> 拒绝，需等待桶被补充
 *
 * 与固定窗口相比，令牌桶允许「攒令牌」来应对短时突发流量，
 * 同时在长期上仍然把平均速率限制在 tokensPerSecond，更加平滑。
 */

class TokenBucketRateLimiter {
  /**
   * @param {number} capacity 桶容量（最多可攒多少个令牌，必须为 > 0 的整数）
   * @param {number} tokensPerSecond 每秒补充的令牌数（必须为 > 0）
   * @param {object} [options]
   * @param {number} [options.initialTokens] 初始令牌数，默认等于 capacity（即桶满）
   */
  constructor(capacity, tokensPerSecond, options = {}) {
    if (!Number.isInteger(capacity) || capacity <= 0) {
      throw new Error('capacity 必须是大于 0 的整数')
    }
    if (!Number.isFinite(tokensPerSecond) || tokensPerSecond <= 0) {
      throw new Error('tokensPerSecond 必须是大于 0 的数字')
    }
    this.capacity = capacity
    this.ratePerMs = tokensPerSecond / 1000
    const initial = options.initialTokens
    this.initialTokens = initial === undefined ? capacity : initial
    // 每个 key 维护一个独立桶：{ tokens, lastRefill }
    this.buckets = new Map()
  }

  /** 根据流逝时间给桶补充令牌（内部使用） */
  _refill(bucket, now) {
    const elapsed = now - bucket.lastRefill
    if (elapsed > 0) {
      const added = elapsed * this.ratePerMs
      bucket.tokens = Math.min(this.capacity, bucket.tokens + added)
      bucket.lastRefill = now
    }
  }

  /**
   * 尝试取出令牌（即判断本次请求是否被允许）。
   * @param {string} [key='__default__'] 资源标识，不同 key 独立计数
   * @param {number} [tokens=1] 本次请求需要的令牌数（不能超过 capacity）
   * @returns {{ allowed: boolean, remaining: number, retryAfterMs: number }}
   *          allowed：是否允许通过
   *          remaining：当前桶内剩余令牌（可被未来的请求使用）
   *          retryAfterMs：若被拒绝，需等待多少毫秒桶里才会有足够令牌
   */
  tryAcquire(key = '__default__', tokens = 1) {
    if (!Number.isInteger(tokens) || tokens <= 0) {
      throw new Error('tokens 必须是大于 0 的整数')
    }
    if (tokens > this.capacity) {
      // 单次请求的令牌需求超过桶容量，永远无法被满足
      throw new Error('单次请求令牌数不能超过桶容量 capacity')
    }

    const now = Date.now()
    let bucket = this.buckets.get(key)

    if (!bucket) {
      bucket = { tokens: this.initialTokens, lastRefill: now }
      this.buckets.set(key, bucket)
    }

    this._refill(bucket, now)

    if (bucket.tokens >= tokens) {
      bucket.tokens -= tokens
      return {
        allowed: true,
        remaining: bucket.tokens,
        retryAfterMs: 0
      }
    }

    const deficit = tokens - bucket.tokens
    const retryAfterMs = Math.ceil(deficit / this.ratePerMs)
    return {
      allowed: false,
      remaining: bucket.tokens,
      retryAfterMs
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

export default TokenBucketRateLimiter

/**
 * 使用示例：
 *
 * import TokenBucketRateLimiter from '@/utils/token-bucket-limiter'
 *
 * // 桶容量 10，每秒补充 5 个令牌（即长期平均 5 次/秒，但允许短时突发到 10）
 * const limiter = new TokenBucketRateLimiter(10, 5)
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
