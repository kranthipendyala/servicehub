"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BusinessCard from "@/components/business/BusinessCard";
import CategoryIcon from "@/components/ui/CategoryIcon";
import type { Business } from "@/types";

interface CityData {
  id: number; name: string; slug: string; business_count?: number;
  state_name?: string;
}

interface CategoryData {
  id: number; name: string; slug: string; icon?: string;
  business_count?: number; children?: CategoryData[];
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

  return (
    <>
      {/* Cities Section */}
      <section className="section-padding bg-surface-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-1.5 bg-primary-50 text-primary-600 text-sm font-semibold rounded-full mb-4">Explore</span>
            <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-gray-900 mb-4">
              Explore Services in {geoScope === "telangana" ? "Telangana & AP" : "India"}
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-lg">
              {geoScope === "telangana" ? "Serving Hyderabad, Warangal & all Telangana/AP cities" : "Available across 500+ cities"}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {cities.filter((c) => Number(c.business_count) > 0 || cities.indexOf(c) < 10).slice(0, 15).map((city) => {
              const count = Number(city.business_count) || 0;
              return (
                <Link
                  key={city.id}
                  href={`/${city.slug}`}
                  className="group p-5 rounded-2xl border border-surface-200 hover:border-primary-200 hover:shadow-card-hover transition-all duration-300 bg-white text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <span className="text-lg font-bold text-primary-600">{city.name.charAt(0)}</span>
                  </div>
                  <h3 className="font-heading font-semibold text-gray-800 group-hover:text-primary-500 transition-colors text-sm">
                    {city.name}
                  </h3>
                  {count > 0 ? (
                    <p className="text-xs text-primary-500 font-medium mt-1">{count}+ providers</p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-1">Coming Soon</p>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {categories.filter((c: any) => !c.parent_id).length > 0 && (
        <section className="section-padding bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <span className="inline-block px-4 py-1.5 bg-primary-50 text-primary-500 text-sm font-semibold rounded-full mb-4">Our Services</span>
              <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-gray-900 mb-4">
                {geoScope === "telangana" ? "Services Available in Telangana" : "Browse by Service Category"}
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto text-lg">
                {geoScope === "telangana"
                  ? "Book verified service providers in Hyderabad & across Telangana"
                  : "Find specialized service providers across all major categories"}
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 md:gap-6">
              {categories.filter((c: any) => !c.parent_id).slice(0, 15).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/services/${cat.slug}`}
                  className="group relative flex flex-col items-center p-7 rounded-2xl border border-surface-200 hover:border-transparent hover:shadow-card-hover transition-all duration-500 bg-white hover:bg-gradient-to-br hover:from-white hover:to-primary-50/60 overflow-hidden"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center mb-5 group-hover:scale-110 transition-all duration-300 group-hover:shadow-lg text-primary-500">
                    <CategoryIcon icon={cat.icon} className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-heading font-bold text-gray-800 group-hover:text-primary-600 text-center transition-colors mb-1">
                    {cat.name}
                  </h3>
                  {Number(cat.business_count) > 0 ? (
                    <p className="text-xs text-gray-400 mb-3">{cat.business_count} providers</p>
                  ) : (
                    <p className="text-xs text-gray-400 mb-3">Browse</p>
                  )}
                  <div className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Businesses */}
      {featured.length > 0 && (
        <section className="section-padding bg-surface-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <span className="inline-block px-4 py-1.5 bg-green-50 text-green-600 text-sm font-semibold rounded-full mb-4">Top Rated</span>
              <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-gray-900 mb-4">
                Featured Service Providers
              </h2>
              <p className="text-gray-500 max-w-xl mx-auto text-lg">
                Top-rated and verified businesses trusted by customers
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {featured.slice(0, 8).map((biz) => (
                <div key={biz.id} className="group relative">
                  <BusinessCard business={biz} layout="grid" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
