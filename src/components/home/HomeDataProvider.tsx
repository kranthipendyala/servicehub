"use client";

import { useEffect, useState } from "react";

interface Props {
  serverCities: any[];
  serverCategories: any[];
  serverFeatured: any[];
  children: (data: {
    cities: any[];
    categories: any[];
    featured: any[];
  }) => React.ReactNode;
}

/**
 * Client-side data hydration for homepage.
 * If server-side data is empty (Cloudflare blocked), fetches from browser.
 */
export default function HomeDataProvider({
  serverCities,
  serverCategories,
  serverFeatured,
  children,
}: Props) {
  const [cities, setCities] = useState(serverCities);
  const [categories, setCategories] = useState(serverCategories);
  const [featured, setFeatured] = useState(serverFeatured);

  // Check if server data has real business_count (not fallback)
  const hasRealCityData = cities.some((c: any) => Number(c.business_count) > 0);
  const needsRefetch = !hasRealCityData || featured.length === 0;

  useEffect(() => {
    if (!needsRefetch) return;

    const fetchFromBrowser = async () => {
      try {
        const [citiesRes, catsRes, featRes] = await Promise.allSettled([
          fetch("/proxy-api/cities?stats=1").then((r) => r.json()),
          fetch("/proxy-api/categories").then((r) => r.json()),
          fetch("/proxy-api/businesses?featured=1&per_page=8").then((r) => r.json()),
        ]);

        if (citiesRes.status === "fulfilled" && citiesRes.value.status) {
          const cityData = citiesRes.value.data?.cities || citiesRes.value.data || [];
          if (Array.isArray(cityData) && cityData.length > 0) {
            setCities(cityData.map((c: any) => ({ ...c, business_count: Number(c.business_count) || 0 })));
          }
        }

        if (catsRes.status === "fulfilled" && catsRes.value.status) {
          const catData = catsRes.value.data?.categories || catsRes.value.data || [];
          if (Array.isArray(catData) && catData.length > 0) {
            setCategories(catData);
          }
        }

        if (featRes.status === "fulfilled" && featRes.value.status) {
          const featData = featRes.value.data?.businesses || featRes.value.data || [];
          if (Array.isArray(featData) && featData.length > 0) {
            setFeatured(featData);
          }
        }
      } catch {}
    };

    fetchFromBrowser();
  }, [needsRefetch]);

  return <>{children({ cities, categories, featured })}</>;
}
