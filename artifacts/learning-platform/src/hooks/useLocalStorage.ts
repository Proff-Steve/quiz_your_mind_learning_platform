import { useState } from "react";

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  function setValue(value: T | ((prev: T) => T)) {
    try {
      const next = value instanceof Function ? value(storedValue) : value;
      setStoredValue(next);
      window.localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // silent
    }
  }

  return [storedValue, setValue];
}
