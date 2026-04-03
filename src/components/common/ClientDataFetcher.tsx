"use client";

import { useEffect, useState } from "react";

interface Props<T> {
  endpoint: string;
  params?: Record<string, string | number | undefined>;
  serverData: T | null;
  children: (data: T | null, loading: boolean) => React.ReactNode;
}

/**
 * Universal client-side data fetcher.
 * If serverData is null/empty (Cloudflare blocked server-side),
 * fetches from /proxy-api on the client side.
 */
export default function ClientDataFetcher<T>({ endpoint, params, serverData, children }: Props<T>) {
  const [data, setData] = useState<T | null>(serverData);
  const [loading, setLoading] = useState(!serverData);

  useEffect(() => {
    if (serverData) return;

    const qs = params
      ? "?" + Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => `${k}=${v}`).join("&")
      : "";

    fetch(`/proxy-api${endpoint}${qs}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.status) setData(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [endpoint, serverData]);

  return <>{children(data, loading)}</>;
}
