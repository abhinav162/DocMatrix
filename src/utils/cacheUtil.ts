import NodeCache from 'node-cache';

class CacheUtil {
  private static cache = new NodeCache({ stdTTL: 3600 }); // Cache TTL set to 1 hour

  public static set(key: string, value: any): void {
    this.cache.set(key, value);
  }

  public static get(key: string): any {
    return this.cache.get(key);
  }

  public static del(key: string): void {
    this.cache.del(key);
  }

  public static flush(): void {
    this.cache.flushAll();
  }
}

export { CacheUtil };
