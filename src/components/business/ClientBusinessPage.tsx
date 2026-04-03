"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { Business } from "@/types";
import BusinessAvatar from "@/components/business/BusinessAvatar";
import CategoryIcon from "@/components/ui/CategoryIcon";

/**
 * Client-side fallback for business detail page.
 * Used when server-side fetch fails (Cloudflare blocking Vercel).
 */
export default function ClientBusinessPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/proxy-api/businesses/${slug}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.status && res.data) setBusiness(res.data);
        else setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Business Not Found</h1>
          <p className="text-gray-500 mb-4">The business you're looking for doesn't exist or has been removed.</p>
          <Link href="/" className="text-primary-600 hover:underline">Go Home</Link>
        </div>
      </div>
    );
  }

  const biz = business as any;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-200">
              {biz.logo_url || biz.logo ? (
                <img src={biz.logo_url || biz.logo} alt={biz.name} className="w-full h-full object-cover" />
              ) : (
                <BusinessAvatar name={biz.name} categoryIcon={biz.categories?.[0]?.icon} size="lg" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900">{biz.name}</h1>
              {biz.categories && biz.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {biz.categories.map((cat: any) => (
                    <span key={cat.id} className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                      <CategoryIcon icon={cat.icon} className="w-3 h-3" />
                      {cat.name}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                {biz.city_name && <span>{biz.city_name}{biz.state_name ? `, ${biz.state_name}` : ""}</span>}
                {Number(biz.avg_rating) > 0 && (
                  <span>{Number(biz.avg_rating).toFixed(1)} rating ({biz.total_reviews} reviews)</span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-4">
                {biz.phone && (
                  <a href={`tel:${biz.phone}`} className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700">
                    Call Now
                  </a>
                )}
                <Link href={`/book/${slug}`} className="px-4 py-2 bg-accent-500 text-white text-sm font-medium rounded-lg hover:bg-accent-600">
                  Book Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Description */}
        {biz.description && (
          <div className="bg-white rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">About {biz.name}</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{biz.description}</p>
          </div>
        )}

        {/* Services by Category */}
        {biz.services_by_category && biz.services_by_category.length > 0 && (
          <div className="bg-white rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Services Offered</h2>
            <div className="space-y-5">
              {biz.services_by_category.map((group: any) => (
                <div key={group.category_id}>
                  <h3 className="text-sm font-semibold text-primary-600 uppercase tracking-wide mb-2">{group.category_name}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {group.services.map((svc: any) => (
                      <div key={svc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{svc.name}</p>
                          {svc.duration_minutes > 0 && <p className="text-xs text-gray-400">{svc.duration_minutes} min</p>}
                        </div>
                        {Number(svc.base_price) > 0 && (
                          <span className="text-sm font-bold text-gray-900">₹{Number(svc.base_price).toLocaleString("en-IN")}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Service Areas */}
        {biz.service_areas && biz.service_areas.length > 0 && (
          <div className="bg-white rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Service Areas</h2>
            <div className="flex flex-wrap gap-2">
              {biz.service_areas.map((area: any) => (
                <Link key={area.city_id} href={`/${area.city_slug}`} className="px-3 py-1.5 bg-primary-50 text-primary-700 text-sm font-medium rounded-full hover:bg-primary-100">
                  {area.city_name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        {biz.reviews && biz.reviews.length > 0 && (
          <div className="bg-white rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Reviews</h2>
            {biz.reviews.map((r: any) => (
              <div key={r.id} className="border-b border-gray-100 py-3 last:border-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">{r.reviewer_name || "User"}</span>
                  <span className="text-xs text-amber-500">{"★".repeat(Number(r.rating))}</span>
                </div>
                {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Contact */}
        <div className="bg-white rounded-2xl p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Contact</h2>
          <div className="space-y-2 text-sm text-gray-600">
            {biz.phone && <p>Phone: <a href={`tel:${biz.phone}`} className="text-primary-600">{biz.phone}</a></p>}
            {biz.email && <p>Email: <a href={`mailto:${biz.email}`} className="text-primary-600">{biz.email}</a></p>}
            {biz.address && <p>Address: {biz.address}</p>}
            {biz.website && <p>Website: <a href={biz.website} target="_blank" rel="noopener" className="text-primary-600">{biz.website}</a></p>}
          </div>
        </div>
      </div>
    </div>
  );
}
