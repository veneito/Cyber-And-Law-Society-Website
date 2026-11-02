import { useEffect, useReducer } from 'react';

// Locks depend on puzzle modules that don't emit events, so poll lightly as well as listening.
export function useCaseRefresh() {
  const [, refresh] = useReducer((value: number) => value + 1, 0);
  useEffect(() => {
    const timer = window.setInterval(refresh, 1000);
    for (const name of ['case-progress', 'rescue-chapter']) window.addEventListener(name, refresh);
    return () => { window.clearInterval(timer); for (const name of ['case-progress', 'rescue-chapter']) window.removeEventListener(name, refresh); };
  }, []);
}
