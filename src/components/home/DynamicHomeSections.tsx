"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BusinessCard from "@/components/business/BusinessCard";
import CategoryIcon from "@/components/ui/CategoryIcon";
import type { Business } from "@/types";

interface CityData {
  id: number; name: string; slug: string; business_count?: number;
}

interface CategoryData {
  id: number; name: string; slug: string; icon?: string;
  business_count?: number; parent_id?: number | null; children?: CategoryData[];
}

interface Props {
  serverCities: CityData[];
  serverCategories: CategoryData[];
  serverFeatured: Business[];
  geoScope: string;
}

export default function DynamicHomeSections({ serverCities, serverCategories, serverFeatured, geoScope }: Props) {
  const [cities, setCities] = useState(serverCities);
  const [categories, setCategories] = useState(serverCategories);
  const [featured, setFeatured] = useState(serverFeatured);

  useEffect(() => {
    (async () => {
      try {
        const [citiesRes, catsRes, featRes] = await Promise.allSettled([
          fetch("/proxy-api/cities?stats=1").then((r) => r.json()),
          fetch("/proxy-api/categories").then((r) => r.json()),
          fetch("/proxy-api/businesses?featured=1&per_page=8").then((r) => r.json()),
        ]);

        if (citiesRes.status === "fulfilled" && citiesRes.value.status) {
          const d = citiesRes.value.data?.cities || citiesRes.value.data || [];
          if (Array.isArray(d) && d.length > 0) setCities(d.map((c: any) => ({ ...c, business_count: Number(c.business_count) || 0 })));
        }
        if (catsRes.status === "fulfilled" && catsRes.value.status) {
          const d = catsRes.value.data?.categories || catsRes.value.data || [];
          if (Array.isArray(d) && d.length > 0) setCategories(d);
        }
        if (featRes.status === "fulfilled" && featRes.value.status) {
          const d = featRes.value.data?.businesses || featRes.value.data || [];
          if (Array.isArray(d) && d.length > 0) setFeatured(d);
        }
      } catch {}
    })();
  }, []);

  const parentCategories = categories.filter((c: any) => !c.parent_id);

  return (
    <>
      {/* ── SERVICE CATEGORIES ─────────────────────────────── */}
      {parentCategories.length > 0 && (
        <section className="py-10 md:py-16 bg-white relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-teal-50/40 rounded-full blur-[80px]" />
          <div className="container mx-auto px-4 relative">
            <div className="flex items-end justify-between mb-6 md:mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">
                  {geoScope === "telangana" ? "Services in Telangana & AP" : "Browse services"}
                </h2>
                <p className="text-gray-400 mt-1">Book verified professionals for any home service</p>
              </div>
              <Link href="/search" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-gray-900 hover:text-teal-700 transition-colors group">
                All services
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 lg:gap-4">
              {parentCategories.slice(0, 15).map((cat, idx) => {
                const count = Number(cat.business_count) || 0;
                return (
                  <Link
                    key={cat.id}
                    href={`/services/${cat.slug}`}
                    className="group relative flex items-center gap-3.5 p-4 lg:p-5 rounded-2xl bg-white/80 backdrop-blur-xl border border-gray-100/80 shadow-glass hover:shadow-glass-lg hover:border-teal-200/60 transition-all duration-500 hover:-translate-y-1 overflow-hidden animate-fade-in"
                    style={{ animationDelay: `${idx * 50}ms`, animationFillMode: "both" }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-50/0 to-emerald-50/0 group-hover:from-teal-50/40 group-hover:to-emerald-50/20 transition-all duration-500 rounded-2xl" />
                    <div className="relative w-11 h-11 rounded-xl bg-gray-50 group-hover:bg-teal-50 flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110">
                      <CategoryIcon icon={cat.icon} className="w-5 h-5 text-gray-500 group-hover:text-teal-600 transition-colors duration-300" />
                    </div>
                    <div className="relative min-w-0">
                      <p className="text-sm font-bold text-gray-900 group-hover:text-teal-700 truncate transition-colors duration-300">{cat.name}</p>
                      {count > 0 ? (
                        <p className="text-[11px] text-teal-500 font-medium">{count} providers</p>
                      ) : (
                        <p className="text-[11px] text-gray-400">Browse</p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── FEATURED PROVIDERS ─────────────────────────────── */}
      {featured.length > 0 && (
        <section className="py-10 md:py-16 bg-[#fafafa]">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-6 md:mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-gray-900">Featured providers</h2>
                <p className="text-sm text-gray-400 mt-1">Verified professionals trusted by customers</p>
              </div>
              <Link href="/search" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors group">
                View all
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {featured.slice(0, 8).map((biz) => (
                <div key={biz.id} className="bg-white rounded-2xl border border-gray-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.2)] transition-all duration-500 hover:-translate-y-1.5 overflow-hidden ring-1 ring-gray-100">
                  <BusinessCard business={biz} layout="grid" />
                </div>
              ))}
            </div>

            <div className="flex sm:hidden justify-center mt-6">
              <Link href="/search" className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-all">
                View all providers
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── CITIES ─────────────────────────────────────────── */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-50/30 rounded-full blur-[80px]" />
        <div className="container mx-auto px-4 relative">
          <div className="mb-10">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">
              {geoScope === "telangana" ? "Cities we serve" : "Available cities"}
            </h2>
            <p className="text-gray-400 mt-1">Find trusted professionals near you</p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {cities.filter((c) => Number(c.business_count) > 0 || cities.indexOf(c) < 12).slice(0, 16).map((city, idx) => {
              const count = Number(city.business_count) || 0;
              return (
                <Link
                  key={city.id}
                  href={`/${city.slug}`}
                  className="group text-center p-4 rounded-2xl hover:bg-white hover:shadow-glass transition-all duration-500 animate-fade-in"
                  style={{ animationDelay: `${idx * 40}ms`, animationFillMode: "both" }}
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-teal-50 group-hover:to-emerald-50 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 group-hover:shadow-md transition-all duration-500 border border-gray-100 group-hover:border-teal-200">
                    <span className="text-lg font-black text-gray-400 group-hover:text-teal-600 transition-colors duration-300">{city.name.charAt(0)}</span>
                  </div>
                  <p className="text-xs font-bold text-gray-800 group-hover:text-teal-700 transition-colors duration-300">{city.name}</p>
                  {count > 0 ? (
                    <p className="text-[10px] text-teal-500 font-semibold mt-1">{count}+ pros</p>
                  ) : (
                    <p className="text-[10px] text-gray-400 mt-1">Coming soon</p>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
