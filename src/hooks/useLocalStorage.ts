import { useState, useEffect, useCallback, useRef } from "react";

// ─── useLocalStorage ──────────────────────────────────────────────────────────
//
// Type-safe localStorage hook with:
//   • Lazy initialisation (reads storage on first render only)
//   • Automatic JSON serialisation / deserialisation
//   • Graceful error recovery (corrupted data falls back to initialValue)
//   • Cross-tab sync via the native `storage` event
//   • Stable removeValue that resets to initialValue
//
// Usage:
//   const [tasks, setTasks, clearTasks] = useLocalStorage<Task[]>("key", []);
// ─────────────────────────────────────────────────────────────────────────────

function readFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    console.warn(`[useLocalStorage] Could not parse key "${key}". Using fallback.`);
    return fallback;
  }
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {

  // Store initialValue in a ref so removeValue closure is always stable
  // (avoids re-creating the function if the caller passes an object literal).
  const initialRef = useRef(initialValue);

  // ── 1. Lazy init from storage ──
  const [storedValue, setStoredValue] = useState<T>(() =>
    readFromStorage(key, initialRef.current)
  );

  // ── 2. Write to storage on every state change ──
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (err) {
      console.error(`[useLocalStorage] Failed to write key "${key}":`, err);
    }
  }, [key, storedValue]);

  // ── 3. Cross-tab sync ──
  useEffect(() => {
    function onStorageChange(event: StorageEvent) {
      if (event.key !== key || event.newValue === null) return;
      try {
        setStoredValue(JSON.parse(event.newValue) as T);
      } catch {
        // Ignore malformed payloads from other tabs.
      }
    }
    window.addEventListener("storage", onStorageChange);
    return () => window.removeEventListener("storage", onStorageChange);
  }, [key]);

  // ── 4. Stable setter ──
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) =>
        typeof value === "function"
          ? (value as (prev: T) => T)(prev)
          : value
      );
    },
    [] // setStoredValue identity is stable
  );

  // ── 5. Stable remover (uses ref, not closure over initialValue) ──
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // noop
    }
    setStoredValue(initialRef.current);
  }, [key]);

  return [storedValue, setValue, removeValue];
}
