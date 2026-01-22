import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { LRUCache } from "lru-cache"

type RateLimitOptions = {
    uniqueTokenPerInterval?: number
    interval?: number
}

// Fallback in-memory cache
const tokenCache = new LRUCache<string, number[]>({
    max: 500,
    ttl: 60000,
})

export function rateLimit(options?: RateLimitOptions) {
    // Try to initialize Redis if env vars are present
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

    let ratelimit: Ratelimit | null = null

    if (redisUrl && redisToken) {
        try {
            const redis = new Redis({
                url: redisUrl,
                token: redisToken,
            })

            ratelimit = new Ratelimit({
                redis: redis,
                limiter: Ratelimit.slidingWindow(
                    options?.uniqueTokenPerInterval || 10,
                    "60 s"
                ),
            })
        } catch (e) {
            console.warn("Failed to initialize Upstash Redis, falling back to in-memory", e)
        }
    }

    return {
        check: async (limit: number, token: string) => {
            // Use Redis if available
            if (ratelimit) {
                try {
                    const { success, limit: rLimit, remaining, reset } = await ratelimit.limit(token)
                    return {
                        isRateLimited: !success,
                        limit: rLimit,
                        remaining,
                    }
                } catch (e) {
                    console.error("Redis rate limit failed, falling back to in-memory", e)
                }
            }

            // Fallback In-Memory Implementation
            const tokenCount = (tokenCache.get(token) as number[]) || [0]
            if (tokenCount[0] === 0) {
                tokenCache.set(token, tokenCount)
            }
            tokenCount[0] += 1

            const currentUsage = tokenCount[0]
            const isRateLimited = currentUsage >= limit

            return {
                isRateLimited,
                limit,
                remaining: isRateLimited ? 0 : limit - currentUsage,
            }
        },
    }
}
