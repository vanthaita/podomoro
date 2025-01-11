'use client';
import { useState, useEffect } from 'react';

type ValueOrFunction<T> = T | ((prevValue: T) => T);

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: ValueOrFunction<T>) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window !== 'undefined') {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : initialValue;
      }
      return initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });


  useEffect(() => {
    try {
      if (typeof window !== 'undefined') { 
        const valueToStore = JSON.stringify(storedValue);
        window.localStorage.setItem(key, valueToStore);
      }
    } catch (error) {
      console.error("Error writing to localStorage:", error)
    }
  }, [key, storedValue]);

  const setValue = (value: ValueOrFunction<T>) => {
    setStoredValue((prevStoredValue) => {
      const newValue = value instanceof Function ? value(prevStoredValue) : value;
        return newValue
    });
  };


  return [storedValue, setValue];
}

export default useLocalStorage;