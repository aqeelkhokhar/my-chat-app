import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'chatapp:userId';

function generateUserId() {
  return `USER_${Math.random().toString(16).slice(2, 8).toUpperCase()}`;
}

export function useUserId() {
  const [userId, setUserIdState] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const existing = await AsyncStorage.getItem(STORAGE_KEY);
      if (existing && existing.trim()) {
        setUserIdState(existing);
        return;
      }

      const next = generateUserId();
      await AsyncStorage.setItem(STORAGE_KEY, next);
      setUserIdState(next);
    };

    load();
  }, []);

  const setUserId = useCallback(async (next: string) => {
    const normalized = next.trim();
    if (!normalized) {
      return;
    }

    await AsyncStorage.setItem(STORAGE_KEY, normalized);
    setUserIdState(normalized);
  }, []);

  return { userId, setUserId };
}
