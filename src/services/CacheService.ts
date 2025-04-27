
type CacheEntry<T> = {
  data: T;
  timestamp: number;
  expiry: number;
};

class CacheService {
  private static cache: Record<string, CacheEntry<any>> = {};
  
  /**
   * Get an item from cache
   * @param key Cache key
   * @returns The cached data or null if not found or expired
   */
  public static get<T>(key: string): T | null {
    const entry = this.cache[key];
    
    if (!entry) {
      return null;
    }
    
    // Check if entry has expired
    if (Date.now() > entry.expiry) {
      this.remove(key);
      return null;
    }
    
    return entry.data;
  }
  
  /**
   * Set an item in the cache
   * @param key Cache key
   * @param data Data to cache
   * @param ttl Time-to-live in milliseconds (default: 5 minutes)
   */
  public static set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    const timestamp = Date.now();
    this.cache[key] = {
      data,
      timestamp,
      expiry: timestamp + ttl
    };
    
    // Log cache storage event for debugging
    console.debug(`Cached data for key "${key}" for ${ttl/1000}s`);
  }
  
  /**
   * Remove an item from the cache
   * @param key Cache key
   */
  public static remove(key: string): void {
    if (this.cache[key]) {
      delete this.cache[key];
      console.debug(`Removed cache entry for key "${key}"`);
    }
  }
  
  /**
   * Clear all items from the cache
   */
  public static clear(): void {
    this.cache = {};
    console.debug('Cache cleared');
  }
  
  /**
   * Check if an item exists in the cache and is not expired
   * @param key Cache key
   * @returns True if the item exists and is not expired
   */
  public static has(key: string): boolean {
    const entry = this.cache[key];
    if (!entry) return false;
    
    // Check expiration
    if (Date.now() > entry.expiry) {
      this.remove(key);
      return false;
    }
    
    return true;
  }
  
  /**
   * Get info about cache usage
   * @returns Cache statistics
   */
  public static stats() {
    const now = Date.now();
    let activeEntries = 0;
    let expiredEntries = 0;
    
    Object.keys(this.cache).forEach(key => {
      if (now > this.cache[key].expiry) {
        expiredEntries++;
      } else {
        activeEntries++;
      }
    });
    
    return {
      totalEntries: Object.keys(this.cache).length,
      activeEntries,
      expiredEntries
    };
  }
}

export default CacheService;
