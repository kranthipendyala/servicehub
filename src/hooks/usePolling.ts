import { useEffect, useRef, useCallback } from "react";

/**
 * Poll a function at intervals. Pauses when tab is hidden.
 * @param callback - async function to call
 * @param interval - ms between calls (default 5000)
 * @param enabled - whether polling is active
 */
export function usePolling(
  callback: () => Promise<void> | void,
  interval = 5000,
  enabled = true
) {
  const savedCallback = useRef(callback);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    const tick = () => savedCallback.current();

    // Poll on interval
    timerRef.current = setInterval(tick, interval);

    // Pause when tab hidden, resume when visible
    const onVisibility = () => {
      if (document.hidden) {
        if (timerRef.current) clearInterval(timerRef.current);
      } else {
        tick(); // Immediate fetch on return
        timerRef.current = setInterval(tick, interval);
      }
    };

    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [interval, enabled]);
}

/**
 * Hook for real-time data with auto-refresh.
 * Returns a refetch function that can also be called manually.
 */
export function useAutoRefresh(
  fetchFn: () => Promise<void>,
  intervalMs = 5000,
  enabled = true
) {
  const stableFetch = useCallback(fetchFn, [fetchFn]);
  usePolling(stableFetch, intervalMs, enabled);
  return stableFetch;
}
