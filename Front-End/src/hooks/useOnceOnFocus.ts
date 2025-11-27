import { useRef, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';

export function useOnceOnFocus(fn: () => void | (() => void)) {
  const playedRef = useRef(false);

  const cb = useCallback(() => {
    if (playedRef.current) return;
    playedRef.current = true;

    const cleanup = fn();

    return () => {
      playedRef.current = false;
      if (typeof cleanup === 'function') cleanup();
    };
  }, [fn]);

  useFocusEffect(cb);
}