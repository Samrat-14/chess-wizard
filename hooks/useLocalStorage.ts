import { useState } from 'react';

const IS_SERVER = typeof window === 'undefined';

const useLocalStorage = <T>(key: string, defaultValue: T): [T, (value: T) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (IS_SERVER) {
      return defaultValue;
    }
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (err) {
      console.log('Error parsing JSON:' + err);
      return defaultValue;
    }
  });

  const setValue = (value: T): void => {
    try {
      setStoredValue(value);
      if (!IS_SERVER) {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (err) {
      console.log('Error stringifying JSON:' + err);
    }
  };

  return [storedValue, setValue];
};

export default useLocalStorage;
