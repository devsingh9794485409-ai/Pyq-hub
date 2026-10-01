// src/hooks/useApi.js
/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useRef, useState } from 'react';
import { getErrorMessage } from '../api/client.js';

export const useApi = (fn, deps = [], { skip = false } = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState(null);

  const fnRef = useRef(fn);

  // Always keep the ref pointing at the latest version of fn.
  useEffect(() => {
    fnRef.current = fn;
  });

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fnRef.current();
      setData(result);
      return result;
    } catch (err) {
      setError(getErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // When skip is true, do nothing — loading is already false from initial state.
    if (skip) return;
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, refetch: run, setData };
};

export default useApi;