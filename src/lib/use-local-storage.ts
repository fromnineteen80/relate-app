import { useCallback, useRef, useSyncExternalStore } from 'react';

/**
 * Lightweight localStorage cache that deduplicates reads within the same render cycle.
 * Subscribes to a custom "relate-storage" event so writes from any component
 * are reflected everywhere without polling.
 */

const STORAGE_EVENT = 'relate-storage';

function subscribe(callback: () => void) {
  window.addEventListener(STORAGE_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(STORAGE_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

/** Read a single localStorage key reactively. Re-renders only when the value changes. */
export function useLocalStorageValue(key: string): string | null {
  const getSnapshot = useCallback(() => {
    try { return localStorage.getItem(key); } catch { return null; }
  }, [key]);
  const getServerSnapshot = useCallback(() => null, []);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Notify all useLocalStorageValue consumers that a key changed. */
export function setLocalStorageValue(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch { /* quota exceeded */ }
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

/**
 * Read multiple localStorage keys at once, returned as a Record.
 * Uses useSyncExternalStore with a ref-cached snapshot to avoid
 * creating new object references when values haven't changed.
 */
export function useLocalStorageBatch<K extends string>(keys: readonly K[]): Record<K, string | null> {
  const cacheRef = useRef<Record<K, string | null> | null>(null);

  const getSnapshot = useCallback(() => {
    const prev = cacheRef.current;
    let changed = prev === null;
    if (!changed) {
      for (const key of keys) {
        let val: string | null = null;
        try { val = localStorage.getItem(key); } catch { /* */ }
        if (val !== prev![key]) { changed = true; break; }
      }
    }
    if (!changed) return prev!;
    const next = {} as Record<K, string | null>;
    for (const key of keys) {
      try { next[key] = localStorage.getItem(key); } catch { next[key] = null; }
    }
    cacheRef.current = next;
    return next;
  }, [keys]);

  const getServerSnapshot = useCallback(() => {
    if (cacheRef.current) return cacheRef.current;
    const result = {} as Record<K, string | null>;
    for (const key of keys) result[key] = null;
    cacheRef.current = result;
    return result;
  }, [keys]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
