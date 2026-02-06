/**
 * localStorage utilities with type safety and TTL support
 */

export interface StorageItem<T> {
  data: T;
  timestamp: number;
}

/**
 * Set an item in localStorage with optional TTL
 */
export function setLocalStorage<T>(key: string, value: T, ttl?: number): void {
  try {
    const item: StorageItem<T> = {
      data: value,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(item));
  } catch (error) {
    console.error(`Failed to set localStorage item ${key}:`, error);
  }
}

/**
 * Get an item from localStorage with TTL check
 */
export function getLocalStorage<T>(key: string, ttl?: number): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    
    const item: StorageItem<T> = JSON.parse(raw);
    
    // Check TTL if provided
    if (ttl && Date.now() - item.timestamp > ttl) {
      localStorage.removeItem(key);
      return null;
    }
    
    return item.data;
  } catch (error) {
    console.error(`Failed to get localStorage item ${key}:`, error);
    return null;
  }
}

/**
 * Remove an item from localStorage
 */
export function removeLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove localStorage item ${key}:`, error);
  }
}

/**
 * Clear all localStorage items matching a prefix
 */
export function clearLocalStorageByPrefix(prefix: string): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.error(`Failed to clear localStorage with prefix ${prefix}:`, error);
  }
}
