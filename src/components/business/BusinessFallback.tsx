"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import BusinessAvatar from "@/components/business/BusinessAvatar";
import CategoryIcon from "@/components/ui/CategoryIcon";

export default function BusinessFallback({ slug: propSlug }: { slug?: string }) {
  const params = useParams();
  const slug = propSlug || (params.slug as string);
  const [biz, setBiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/proxy-api/businesses/${slug}`)
      .then((r) => r.json())
      .then((res) => { if (res.status && res.data) setBiz(res.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!biz) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Business Not Found</h1>
        <Link href="/" className="text-teal-600 hover:underline">Go Home</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-200">
              <BusinessAvatar name={biz.name} categoryIcon={biz.categories?.[0]?.icon} size="lg" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{biz.name}</h1>
              {biz.categories?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {biz.categories.map((cat: any) => (
                    <span key={cat.id} className="inline-flex items-center gap-1 text-xs font-medium text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                      <CategoryIcon icon={cat.icon} className="w-3 h-3" />
                      {cat.name}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-sm text-gray-500 mt-2">{biz.city_name}{biz.state_name ? `, ${biz.state_name}` : ""}</p>
              <div className="flex gap-3 mt-4">
                {biz.phone && <a href={`tel:${biz.phone}`} className="px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg">Call Now</a>}
                <Link href={`/book/${slug}`} className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg">Book Now</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {biz.description && (
          <div className="bg-white rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">About</h2>
            <p className="text-gray-600 text-sm">{biz.description}</p>
          </div>
        )}

        {biz.services_by_category?.length > 0 && (
          <div className="bg-white rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Services</h2>
            {biz.services_by_category.map((g: any) => (
              <div key={g.category_id} className="mb-4">
                <h3 className="text-sm font-semibold text-teal-600 uppercase mb-2">{g.category_name}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {g.services.map((s: any) => (
                    <div key={s.id} className="flex justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{s.name}</p>
                        {s.duration_minutes > 0 && <p className="text-xs text-gray-400">{s.duration_minutes} min</p>}
                      </div>
                      {Number(s.base_price) > 0 && <span className="text-sm font-bold">₹{Number(s.base_price).toLocaleString("en-IN")}</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {biz.service_areas?.length > 0 && (
          <div className="bg-white rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Service Areas</h2>
            <div className="flex flex-wrap gap-2">
              {biz.service_areas.map((a: any) => (
                <Link key={a.city_id} href={`/${a.city_slug}`} className="px-3 py-1.5 bg-teal-50 text-teal-700 text-sm rounded-full">{a.city_name}</Link>
              ))}
            </div>
          </div>
        )}

        {biz.reviews?.length > 0 && (
          <div className="bg-white rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Reviews</h2>
            {biz.reviews.map((r: any) => (
              <div key={r.id} className="border-b py-3 last:border-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">{r.reviewer_name || "User"}</span>
                  <span className="text-amber-500">{"★".repeat(Number(r.rating))}</span>
                </div>
                {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}

        {(biz.phone || biz.email || biz.address) && (
          <div className="bg-white rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Contact</h2>
            <div className="space-y-1 text-sm text-gray-600">
              {biz.phone && <p>Phone: <a href={`tel:${biz.phone}`} className="text-teal-600">{biz.phone}</a></p>}
              {biz.email && <p>Email: {biz.email}</p>}
              {biz.address && <p>Address: {biz.address}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
