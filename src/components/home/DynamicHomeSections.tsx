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
      {/* ── SERVICE CATEGORIES — White bg, Advia card-hover pattern ── */}
      {parentCategories.length > 0 && (
        <section className="bg-white section-padding">
          <div className="container mx-auto px-4">
            {/* Section header */}
            <div className="flex items-end justify-between mb-8 md:mb-10">
              <div>
                <span className="section-label-badge inline-block mb-3 bg-accent-200 text-primary-800">
                  Our Services
                </span>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-medium text-primary-700 leading-tight">
                  {geoScope === "telangana" ? (
                    <>Services in <span className="heading-highlight">Telangana &amp; AP</span></>
                  ) : (
                    <>Browse our <span className="heading-highlight">services</span></>
                  )}
                </h2>
                <p className="text-primary-600/60 mt-2">Book verified professionals for any home service</p>
              </div>
              <Link href="/search" className="hidden sm:flex items-center gap-1.5 btn-primary text-sm">
                All services
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>

            {/* Service cards grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-5">
              {parentCategories.slice(0, 15).map((cat) => {
                const count = Number(cat.business_count) || 0;
                return (
                  <Link
                    key={cat.id}
                    href={`/services/${cat.slug}`}
                    className="card-interactive group p-5 lg:p-6"
                  >
                    {/* Icon container */}
                    <div className="w-14 h-14 rounded-card flex items-center justify-center mb-4 bg-accent-200">
                      <CategoryIcon icon={cat.icon} className="w-6 h-6 text-primary-700" />
                    </div>
                    <h3 className="text-sm font-heading font-medium text-primary-700 group-hover:text-primary-600 transition-colors duration-200 ease-advia">
                      {cat.name}
                    </h3>
                    {count > 0 ? (
                      <p className="text-xs text-primary-600/50 mt-1">{count} providers</p>
                    ) : (
                      <p className="text-xs text-primary-600/40 mt-1">Browse</p>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Mobile view all */}
            <div className="flex sm:hidden justify-center mt-8">
              <Link href="/search" className="btn-primary text-sm">
                View all services
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── FEATURED PROVIDERS — White bg, Advia card grid ─────── */}
      {featured.length > 0 && (
        <section className="bg-white section-padding border-t border-surface-200">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-8 md:mb-10">
              <div>
                <span className="section-label-badge inline-block mb-3 bg-accent-200 text-primary-800">
                  Top Rated
                </span>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-medium text-primary-700">
                  Featured <span className="heading-highlight">providers</span>
                </h2>
                <p className="text-primary-600/60 mt-2">Verified professionals trusted by customers</p>
              </div>
              <Link href="/search" className="hidden sm:flex items-center gap-1.5 text-sm font-heading font-medium text-primary-600 hover:text-primary-800 transition-colors duration-200 ease-advia group">
                View all
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200 ease-advia" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
              {featured.slice(0, 8).map((biz) => (
                <div key={biz.id} className="card-hover overflow-hidden">
                  <BusinessCard business={biz} layout="grid" />
                </div>
              ))}
            </div>

            <div className="flex sm:hidden justify-center mt-8">
              <Link href="/search" className="btn-secondary text-sm">
                View all providers
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── CITIES — Cream bg, Advia style ─────────────────────── */}
      <section className="bg-accent-200 section-padding">
        <div className="container mx-auto px-4">
          <div className="mb-8 md:mb-10">
            <span className="section-label-badge inline-block mb-3 bg-white text-primary-800">
              Locations
            </span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-medium text-primary-700 leading-tight">
              {geoScope === "telangana" ? (
                <>Cities we <span className="heading-highlight">serve</span></>
              ) : (
                <>Available <span className="heading-highlight">cities</span></>
              )}
            </h2>
            <p className="text-primary-600/60 mt-2">Find trusted professionals near you</p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {cities.filter((c) => Number(c.business_count) > 0 || cities.indexOf(c) < 12).slice(0, 16).map((city) => {
              const count = Number(city.business_count) || 0;
              return (
                <Link
                  key={city.id}
                  href={`/${city.slug}`}
                  className="group text-center p-4 rounded-card bg-white hover:shadow-card-hover transition-all duration-200 ease-advia hover:-translate-y-1"
                >
                  <div className="w-12 h-12 rounded-card bg-accent-200 group-hover:bg-primary-50 flex items-center justify-center mx-auto mb-3 transition-colors duration-200 ease-advia">
                    <span className="text-lg font-heading font-medium text-primary-600 group-hover:text-primary-700 transition-colors duration-200">{city.name.charAt(0)}</span>
                  </div>
                  <p className="text-xs font-heading font-medium text-primary-700 group-hover:text-primary-600 transition-colors duration-200">{city.name}</p>
                  {count > 0 ? (
                    <p className="text-[10px] text-primary-600/60 font-medium mt-1">{count}+ pros</p>
                  ) : (
                    <p className="text-[10px] text-primary-600/40 mt-1">Coming soon</p>
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
