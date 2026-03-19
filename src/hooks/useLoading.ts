import { useCallback, useState } from 'react';

export function useLoading(initialLoading: boolean = false) {
  const [loading, setLoading] = useState<boolean>(initialLoading);

  return {
    loading,
    startLoading: useCallback(() => setLoading(true), []),
    stopLoading: useCallback(() => setLoading(false), []),
  };
}
