"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface PlatformConfig {
  phase: string;
  phase_name: string;
  geo_scope: string;
  geo_name: string;
  geo_tagline: string;
  platform_fee: number;
  surge_pricing: boolean;
  commission_enabled: boolean;
  subscription_required: boolean;
  cod_enabled: boolean;
  online_payment_enabled: boolean;
}

const DEFAULT_CONFIG: PlatformConfig = {
  phase: "1",
  phase_name: "Free for All",
  geo_scope: "india",
  geo_name: "All India",
  geo_tagline: "Serving 500+ Cities Across India",
  platform_fee: 0,
  surge_pricing: false,
  commission_enabled: false,
  subscription_required: false,
  cod_enabled: true,
  online_payment_enabled: false,
};

const PlatformContext = createContext<PlatformConfig>(DEFAULT_CONFIG);

export function PlatformProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<PlatformConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    fetch("/proxy-api/platform/config")
      .then((r) => r.json())
      .then((json) => {
        if (json.status && json.data) setConfig(json.data);
      })
      .catch(() => {});
  }, []);

  return (
    <PlatformContext.Provider value={config}>
      {children}
    </PlatformContext.Provider>
  );
}

export function usePlatform() {
  return useContext(PlatformContext);
}
