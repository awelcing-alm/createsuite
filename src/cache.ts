interface CacheOptions {
  ttlMs?: number;
  maxSize?: number;
}

interface CacheItem<T> {
  value: T;
  expiresAt: number;
}

export class Cache<T> {
  private store = new Map<string, CacheItem<T>>();
  private ttlMs: number;
  private maxSize: number;

  constructor(options: CacheOptions = {}) {
    this.ttlMs = options.ttlMs || 60000;
    this.maxSize = options.maxSize || 100;
  }

  get(key: string): T | undefined {
    const item = this.store.get(key);
    if (!item) return undefined;

    if (Date.now() >= item.expiresAt) {
      this.store.delete(key);
      return undefined;
    }

    return item.value;
  }

  set(key: string, value: T, ttlMs?: number): void {
    if (this.store.size >= this.maxSize) {
      const firstKey = this.store.keys().next().value as string | undefined;
      if (firstKey) this.store.delete(firstKey);
    }

    this.store.set(key, {
      value,
      expiresAt: Date.now() + (ttlMs || this.ttlMs),
    });
  }

  has(key: string): boolean {
    const item = this.store.get(key);
    if (!item) return false;

    if (Date.now() >= item.expiresAt) {
      this.store.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  size(): number {
    return this.store.size;
  }

  cleanup(): number {
    const now = Date.now();
    let removed = 0;

    for (const [key, item] of this.store.entries()) {
      if (now >= item.expiresAt) {
        this.store.delete(key);
        removed++;
      }
    }

    return removed;
  }
}

export async function withCache<K extends unknown[], T>(
  cache: Cache<T>,
  key: string,
  fn: () => Promise<T>,
  options: { bypass?: boolean; ttlMs?: number } = {}
): Promise<T> {
  if (!options.bypass) {
    const cached = cache.get(key);
    if (cached !== undefined) {
      return cached;
    }
  }

  const value = await fn();
  cache.set(key, value, options.ttlMs);
  return value;
}