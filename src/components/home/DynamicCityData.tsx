"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BusinessCard from "@/components/business/BusinessCard";
import CategoryIcon from "@/components/ui/CategoryIcon";
import type { Business, Category } from "@/types";

interface Props {
  citySlug: string;
  cityName: string;
  serverCategories: any[];
  serverFeatured: any[];
}

export default function DynamicCityData({ citySlug, cityName, serverCategories, serverFeatured }: Props) {
  const [categories, setCategories] = useState(serverCategories);
  const [featured, setFeatured] = useState(serverFeatured);

  useEffect(() => {
    (async () => {
      try {
        const [catRes, featRes] = await Promise.allSettled([
          fetch(`/proxy-api/categories/city/${citySlug}`).then((r) => r.json()).catch(() => null),
          fetch(`/proxy-api/businesses?city=${citySlug}&featured=1&per_page=8`).then((r) => r.json()).catch(() => null),
        ]);

        // Try city-specific categories, fallback to all categories
        if (catRes.status === "fulfilled" && catRes.value?.status) {
          const d = catRes.value.data?.categories || catRes.value.data || [];
          if (Array.isArray(d) && d.length > 0) setCategories(d);
        }
        if ((!categories || categories.length === 0) || (catRes.status !== "fulfilled")) {
          const allCats = await fetch("/proxy-api/categories").then((r) => r.json()).catch(() => null);
          if (allCats?.status) {
            const d = allCats.data?.categories || allCats.data || [];
            if (Array.isArray(d) && d.length > 0) setCategories(d.filter((c: any) => !c.parent_id));
          }
        }

        if (featRes.status === "fulfilled" && featRes.value?.status) {
          const d = featRes.value.data?.businesses || featRes.value.data || [];
          if (Array.isArray(d) && d.length > 0) setFeatured(d);
        }
      } catch {}
    })();
  }, [citySlug]);

  return (
    <>
      {/* Categories */}
      {categories.length > 0 && (
        <section className="section-padding bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
              Service Categories in {cityName}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {categories.filter((c: any) => !c.parent_id).map((cat: any) => (
                <Link
                  key={cat.id}
                  href={`/${citySlug}/${cat.slug}`}
                  className="group p-5 rounded-xl border border-surface-200 hover:border-primary-200 hover:shadow-card-hover transition-all duration-300 bg-white"
                >
                  <div className="flex items-center gap-2.5 mb-1">
                    {cat.icon && (
                      <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-500 flex-shrink-0">
                        <CategoryIcon icon={cat.icon} className="w-4 h-4" />
                      </div>
                    )}
                    <h3 className="font-heading font-semibold text-gray-800 group-hover:text-primary-500 transition-colors text-sm">
                      {cat.name}
                    </h3>
                  </div>
                  {cat.business_count !== undefined && (
                    <p className="text-xs text-gray-400 mt-1">
                      {Number(cat.business_count) > 0 ? `${cat.business_count} providers` : "Browse"}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured */}
      {featured.length > 0 && (
        <section className="section-padding bg-surface-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
              Top Service Providers in {cityName}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {featured.map((biz: any) => (
                <BusinessCard key={biz.id} business={biz} layout="grid" />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
