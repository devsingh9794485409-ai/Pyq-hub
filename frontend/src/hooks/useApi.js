// src/hooks/useApi.js
import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { getErrorMessage } from '../api/client.js';

export const useApi = (fn, deps = [], { skip = false } = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState(null);

  const fnRef = useRef(fn);

  // Ref update render ke baad
  useEffect(() => {
    fnRef.current = fn;
  });

  const execute = useCallback(async () => {
    // Abort previous in-flight request
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    const controller = new AbortController();
    controllerRef.current = controller;
    const currentReqId = ++reqIdRef.current;

    setLoading(true);
    setError(null);

    try {
      const result = await fnRef.current(controller.signal);
      // Only commit if this was the latest initiated request
      if (currentReqId === reqIdRef.current) {
        setData(result);
        setLoading(false);
      }
      return result;
    } catch (err) {
      const isCancelled =
        axios.isCancel?.(err) ||
        err?.name === 'CanceledError' ||
        err?.name === 'AbortError' ||
        err?.code === 'ERR_CANCELED';

      if (isCancelled) {
        // Suppress errors from deliberately aborted requests
        return null;
      }

      if (currentReqId === reqIdRef.current) {
        setError(getErrorMessage(err));
        setLoading(false);
      }
      return null;
    }
  }, []);

  useEffect(() => {
    // skip true hai toh kuch mat karo — loading already false hai initial state se
    if (skip) return;
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, refetch: execute, setData };
};

export default useApi;