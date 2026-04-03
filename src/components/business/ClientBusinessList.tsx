"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BusinessCard from "@/components/business/BusinessCard";
import type { Business } from "@/types";

interface Props {
  serverBusinesses: Business[];
  citySlug?: string;
  categorySlug?: string;
  localitySlug?: string;
  cityName: string;
  categoryName: string;
}

export default function ClientBusinessList({
  serverBusinesses, citySlug, categorySlug, localitySlug, cityName, categoryName,
}: Props) {
  const [businesses, setBusinesses] = useState(serverBusinesses);
  const [loading, setLoading] = useState(serverBusinesses.length === 0);

  useEffect(() => {
    if (serverBusinesses.length > 0) return;

    const params = new URLSearchParams();
    if (citySlug) params.set("city", citySlug);
    if (categorySlug) params.set("category", categorySlug);
    if (localitySlug) params.set("locality", localitySlug);
    params.set("per_page", "20");

    fetch(`/proxy-api/businesses?${params}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.status) {
          const biz = res.data?.businesses || res.data || [];
          if (Array.isArray(biz)) setBusinesses(biz);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [citySlug, categorySlug, localitySlug, serverBusinesses.length]);

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Loading services...</p>
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
        <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <h3 className="text-lg font-bold text-gray-700 mb-1">No businesses found</h3>
        <p className="text-gray-500 text-sm">Try adjusting your filters or search terms</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {businesses.map((biz) => (
        <BusinessCard key={biz.id} business={biz} layout="list" />
      ))}
    </div>
  );
}
