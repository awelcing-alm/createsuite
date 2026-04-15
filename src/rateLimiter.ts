interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  cacheTtlMs: number;
}

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export class RateLimiter {
  private cache = new Map<string, CacheEntry<unknown>>();
  private requestCounts = new Map<string, RateLimitEntry>();
  private config: RateLimitConfig;

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = {
      maxRequests: config.maxRequests || 10,
      windowMs: config.windowMs || 60000,
      cacheTtlMs: config.cacheTtlMs || 300000,
    };
  }

  async execute<T>(
    key: string,
    fn: () => Promise<T>,
    options: { bypassCache?: boolean; bypassRateLimit?: boolean } = {}
  ): Promise<T> {
    if (!options.bypassCache) {
      const cached = this.getCached<T>(key);
      if (cached !== undefined) {
        return cached;
      }
    }

    if (!options.bypassRateLimit) {
      if (!this.checkRateLimit(key)) {
        throw new Error(`Rate limit exceeded for ${key}. Try again later.`);
      }
    }

    const result = await fn();
    this.setCached(key, result);
    return result;
  }

  private checkRateLimit(key: string): boolean {
    const now = Date.now();
    const entry = this.requestCounts.get(key);

    if (!entry || now >= entry.resetAt) {
      this.requestCounts.set(key, {
        count: 1,
        resetAt: now + this.config.windowMs,
      });
      return true;
    }

    if (entry.count >= this.config.maxRequests) {
      return false;
    }

    entry.count++;
    return true;
  }

  private getCached<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (Date.now() >= entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value as T;
  }

  private setCached<T>(key: string, value: T): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + this.config.cacheTtlMs,
    });
  }

  clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  clearRateLimits(key?: string): void {
    if (key) {
      this.requestCounts.delete(key);
    } else {
      this.requestCounts.clear();
    }
  }

  getRateLimitStatus(key: string): { remaining: number; resetAt: Date } | null {
    const entry = this.requestCounts.get(key);
    if (!entry) return null;

    return {
      remaining: Math.max(0, this.config.maxRequests - entry.count),
      resetAt: new Date(entry.resetAt),
    };
  }
}