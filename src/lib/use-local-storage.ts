import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';

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
 * Avoids N individual getItem calls scattered through component body.
 */
export function useLocalStorageBatch<K extends string>(keys: readonly K[]): Record<K, string | null> {
  const getSnapshot = useCallback(() => {
    const result = {} as Record<K, string | null>;
    for (const key of keys) {
      try { result[key] = localStorage.getItem(key); } catch { result[key] = null; }
    }
    return result;
  }, [keys]);

  const getServerSnapshot = useCallback(() => {
    const result = {} as Record<K, string | null>;
    for (const key of keys) result[key] = null;
    return result;
  }, [keys]);

  // We need stable snapshots for useSyncExternalStore — serialize to compare
  const [cache, setCache] = useState<Record<K, string | null>>(() => {
    if (typeof window === 'undefined') return getServerSnapshot();
    return getSnapshot();
  });

  useEffect(() => {
    const handler = () => {
      const next = getSnapshot();
      setCache(prev => {
        for (const key of keys) {
          if (prev[key] !== next[key]) return next;
        }
        return prev;
      });
    };
    window.addEventListener(STORAGE_EVENT, handler);
    window.addEventListener('storage', handler);
    // Sync on mount in case values changed between SSR and hydration
    handler();
    return () => {
      window.removeEventListener(STORAGE_EVENT, handler);
      window.removeEventListener('storage', handler);
    };
  }, [getSnapshot, keys]);

  return cache;
}
