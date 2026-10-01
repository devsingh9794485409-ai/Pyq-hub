// src/hooks/useLocalStorage.js
import { useCallback, useState } from 'react';

/**
 * A drop-in replacement for useState that persists the value in localStorage.
 * Falls back to `initialValue` if the key is not found or JSON parsing fails.
 *
 * @param {string} key - The localStorage key to read/write.
 * @param {*} initialValue - The default value when no stored value exists.
 * @returns {[*, Function]} A stateful value and a setter (same API as useState).
 */
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      setStoredValue((prev) => {
        const next = typeof value === 'function' ? value(prev) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(next));
        } catch {
          // Silently ignore quota errors or private-mode restrictions.
        }
        return next;
      });
    },
    [key]
  );

  return [storedValue, setValue];
};

export default useLocalStorage;
