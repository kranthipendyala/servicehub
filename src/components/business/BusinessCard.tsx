"use client";

import Link from "next/link";
import Image from "next/image";
import type { Business } from "@/types";
import BusinessAvatar from "@/components/business/BusinessAvatar";
import RatingStars from "@/components/common/RatingStars";

interface BusinessCardProps {
  business: Business;
  layout?: "grid" | "list";
}

export default function BusinessCard({
  business,
  layout = "grid",
}: BusinessCardProps) {
  const locationParts = [business.locality_name, business.city_name].filter(
    Boolean
  );

  if (layout === "list") {
    return (
      <article className="bg-white rounded-2xl border border-surface-200 shadow-sm hover:shadow-md hover:border-primary-100 transition-all duration-200 overflow-hidden group">
        <div className="flex flex-col sm:flex-row">
          {/* Left: Image */}
          <div className="relative w-full sm:w-48 md:w-56 h-48 sm:h-auto flex-shrink-0">
            <Link href={`/business/${business.slug}`} className="block h-full">
              {business.cover_image_url || business.logo_url ? (
                <Image
                  src={business.cover_image_url || business.logo_url || ""}
                  alt={business.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 640px) 100vw, 224px"
                />
              ) : (
                <BusinessAvatar
                  name={business.name}
                  categoryIcon={business.categories?.[0]?.icon || (business as any).category_icon}
                  size="card"
                />
              )}
            </Link>

            {/* Badges on image */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {business.is_featured && (
                <span className="badge-premium">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Featured
                </span>
              )}
              {business.is_verified && (
                <span className="badge-verified">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Verified
                </span>
              )}
            </div>
          </div>

          {/* Middle: Content */}
          <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
            <div>
              <Link href={`/business/${business.slug}`}>
                <h3 className="text-lg font-heading font-bold text-gray-900 group-hover:text-primary-500 transition-colors line-clamp-1">
                  {business.name}
                </h3>
              </Link>

              {business.categories && business.categories.length > 0 ? (
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {business.categories.map((cat: any) => (
                    <span key={cat.id} className="text-xs font-semibold text-primary-500 uppercase tracking-wide">
                      {cat.name}{business.categories!.indexOf(cat) < business.categories!.length - 1 ? " · " : ""}
                    </span>
                  ))}
                </div>
              ) : business.category_name ? (
                <p className="text-xs font-semibold text-primary-500 mt-0.5 uppercase tracking-wide">
                  {business.category_name}
                </p>
              ) : null}

              {business.rating ? (
                <div className="mt-2">
                  <RatingStars
                    rating={business.rating}
                    size="sm"
                    reviewCount={business.review_count}
                    compact
                  />
                </div>
              ) : null}

              {business.short_description && (
                <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                  {business.short_description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-gray-500">
                {locationParts.length > 0 && (
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="truncate max-w-[200px]">
                      {locationParts.join(", ")}
                    </span>
                  </span>
                )}
                {business.established_year && (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Since {business.established_year}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Contact CTAs */}
          <div className="flex sm:flex-col items-stretch sm:items-end justify-end gap-2.5 p-4 sm:p-5 sm:pl-0 sm:min-w-[160px] border-t sm:border-t-0 sm:border-l border-surface-100">
            {business.phone && (
              <>
                <a
                  href={`tel:${business.phone}`}
                  className="flex-1 sm:flex-none btn-call flex items-center justify-center gap-2 rounded-xl py-3 min-h-[48px] transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Call Now
                </a>
                <p className="hidden sm:block text-center text-xs text-gray-400 font-medium">
                  {business.phone}
                </p>
              </>
            )}
            <Link
              href={`/book/${business.slug}`}
              className="flex-1 sm:flex-none bg-accent-500 hover:bg-accent-600 text-white font-bold flex items-center justify-center gap-2 rounded-xl px-4 py-3 transition-all duration-200 text-sm min-h-[48px]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Book Now
            </Link>
            <Link
              href={`/business/${business.slug}`}
              className="hidden sm:flex items-center justify-center gap-1 text-xs text-primary-500 hover:text-primary-600 font-semibold mt-1 transition-colors"
            >
              View Details
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </article>
    );
  }

  // Grid layout (card) — premium neutral
  return (
    <article className="rounded-2xl overflow-hidden group flex flex-col h-full">
      <Link href={`/business/${business.slug}`} className="block">
        <div className="relative h-40 overflow-hidden">
          {business.cover_image_url || business.logo_url ? (
            <Image
              src={business.cover_image_url || business.logo_url || ""}
              alt={business.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <BusinessAvatar
              name={business.name}
              categoryIcon={business.categories?.[0]?.icon || (business as any).category_icon}
              size="card"
            />
          )}

          {/* Badges overlay */}
          <div className="absolute top-3 left-3 flex gap-1.5">
            {business.is_verified && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-[10px] font-bold text-gray-700 shadow-sm">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Verified
              </span>
            )}
            {business.is_featured && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-[10px] font-bold text-gray-700 shadow-sm">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Featured
              </span>
            )}
          </div>

          {/* Rating badge */}
          {business.rating ? (
            <div className="absolute bottom-3 right-3">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-xs font-bold text-gray-900 shadow-sm">
                {business.rating.toFixed(1)}
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </span>
            </div>
          ) : null}
        </div>
      </Link>

      <div className="p-4 flex-1 flex flex-col">
        <Link href={`/business/${business.slug}`}>
          <h3 className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-teal-700 transition-colors">{business.name}</h3>
        </Link>

        {business.categories && business.categories.length > 0 ? (
          <p className="text-[11px] text-gray-400 mt-0.5 truncate">{business.categories.map((cat: any) => cat.name).join(" · ")}</p>
        ) : business.category_name ? (
          <p className="text-[11px] text-gray-400 mt-0.5">{business.category_name}</p>
        ) : null}

        {locationParts.length > 0 && (
          <p className="text-[11px] text-gray-400 mt-1 truncate">{locationParts.join(", ")}</p>
        )}

        {/* CTA */}
        <div className="flex gap-2 mt-auto pt-3">
          {business.phone && (
            <a href={`tel:${business.phone}`} className="flex-1 text-center rounded-xl text-xs py-2.5 font-semibold border border-gray-200 text-gray-700 hover:border-gray-400 hover:text-gray-900 transition-all min-h-[38px] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              Call
            </a>
          )}
          <Link href={`/book/${business.slug}`} className="flex-1 bg-gray-900 hover:bg-gray-800 text-white text-center rounded-xl text-xs py-2.5 font-semibold transition-all min-h-[38px] flex items-center justify-center">
            Book Now
          </Link>
        </div>
      </div>
    </article>
  );
}
