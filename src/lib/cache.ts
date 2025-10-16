// Simple in-memory cache with TTL support
class Cache {
  private cache = new Map<string, { data: any; expiry: number }>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: any, ttl?: number): void {
    const expiry = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, { data, expiry });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

export const cache = new Cache();

// Auto cleanup every 10 minutes
setInterval(() => cache.cleanup(), 10 * 60 * 1000);

// Cache keys
export const CACHE_KEYS = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  INVENTORY: 'inventory',
  ORDERS: 'orders',
  USER_PROFILE: 'user_profile',
  RESEARCH_PROFILE: 'research_profile',
  SAVED_PRODUCTS: 'saved_products',
  BLOG_POSTS: 'blog_posts',
  RESOURCE_GUIDES: 'resource_guides',
  COA_DATA: 'coa_data',
} as const;