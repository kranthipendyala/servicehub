"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import BusinessAvatar from "@/components/business/BusinessAvatar";
import CategoryIcon from "@/components/ui/CategoryIcon";
import ContactModal from "@/components/business/ContactModal";
import ReviewSection from "@/components/business/ReviewSection";

export default function BusinessFallback({ slug: propSlug }: { slug?: string }) {
  const params = useParams();
  const slug = propSlug || (params.slug as string);
  const [biz, setBiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [contactOpen, setContactOpen] = useState(false);

  useEffect(() => {
    fetch(`/proxy-api/businesses/${slug}`)
      .then((r) => r.json())
      .then((res) => { if (res.status && res.data) setBiz(res.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  /* ─── Loading state ─────────────────────────────────────── */
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-accent-200">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 border-[3px] border-primary-500 border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-0 w-12 h-12 border-[3px] border-primary-200 rounded-full opacity-30" />
        </div>
        <p className="text-sm font-medium text-primary-700/70 tracking-wide">Loading business...</p>
      </div>
    </div>
  );

  /* ─── Not found state ───────────────────────────────────── */
  if (!biz) return (
    <div className="min-h-screen flex items-center justify-center bg-accent-200">
      <div className="text-center max-w-sm mx-auto px-4">
        <div className="w-20 h-20 bg-white rounded-card flex items-center justify-center mx-auto mb-6 shadow-card">
          <svg className="w-9 h-9 text-primary-700/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>
        <h1 className="text-2xl font-heading font-medium text-primary-700 mb-2">Business Not Found</h1>
        <p className="text-primary-700/70 text-sm mb-8 leading-relaxed">This business doesn&apos;t exist or has been removed from our directory.</p>
        <Link href="/" className="btn-primary rounded-btn inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-all duration-200 ease-advia">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Home
        </Link>
      </div>
    </div>
  );

  const avgRating = Number(biz.avg_rating) || 0;
  const totalReviews = Number(biz.total_reviews) || 0;

  return (
    <div className="min-h-screen bg-accent-200 pb-24 lg:pb-0">

      {/* ═══════════════════════════════════════════════════════
          HERO SECTION — Cream bg
          ═══════════════════════════════════════════════════════ */}
      <div className="bg-accent-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
          <div className="flex flex-col sm:flex-row items-start gap-5 lg:gap-8">
            {/* Avatar in cream-bordered container */}
            <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-card overflow-hidden flex-shrink-0 bg-white border-2 border-accent-200 shadow-card">
              {biz.logo_url || biz.logo ? (
                <img src={biz.logo_url || biz.logo} alt={biz.name} className="w-full h-full object-cover" />
              ) : (
                <BusinessAvatar name={biz.name} categoryIcon={biz.categories?.[0]?.icon} size="lg" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              {/* Business name */}
              <h1 className="text-2xl md:text-3xl font-heading font-medium text-primary-700">
                {biz.name}
              </h1>

              {/* Category badges — white bg, pill shape */}
              {biz.categories?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {biz.categories.map((cat: any) => (
                    <span key={cat.id} className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-700/70 bg-white px-3 py-1.5 rounded-btn">
                      <CategoryIcon icon={cat.icon} className="w-3.5 h-3.5 text-primary-600" />
                      {cat.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Location + Rating */}
              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
                {biz.city_name && (
                  <span className="inline-flex items-center gap-1.5 text-primary-700/70">
                    <svg className="w-4 h-4 text-primary-700/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                    {biz.city_name}{biz.state_name ? `, ${biz.state_name}` : ""}
                  </span>
                )}
                {avgRating > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 bg-primary-600 text-white font-bold text-xs px-2.5 py-1 rounded-btn">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      {avgRating.toFixed(1)}
                    </span>
                    <span className="text-primary-700/70">({totalReviews} review{totalReviews !== 1 ? "s" : ""})</span>
                  </span>
                )}
              </div>

              {/* CTA buttons — pill shape */}
              <div className="flex items-center gap-3 mt-6">
                <Link
                  href={`/book/${slug}`}
                  className="btn-primary rounded-btn px-7 py-2.5 text-sm font-semibold inline-flex items-center gap-2 transition-all duration-200 ease-advia"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                  Book Now
                </Link>
                {biz.phone && (
                  <button
                    onClick={() => setContactOpen(true)}
                    className="btn-secondary rounded-btn px-5 py-2.5 text-sm font-semibold inline-flex items-center gap-2 transition-all duration-200 ease-advia"
                  >
                    <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    Contact
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          CONTENT: TWO-COLUMN LAYOUT
          ═══════════════════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

          {/* ── Main column (2/3) ──────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* About section */}
            {biz.description && (
              <section className="bg-white rounded-card p-6 lg:p-8 hover:-translate-y-[2px] transition-all duration-200 ease-advia">
                <h2 className="text-xl font-heading font-medium text-primary-700 mb-4 flex items-center gap-2.5">
                  <span className="heading-highlight" />
                  About
                </h2>
                <p className="text-primary-700/70 text-[15px] leading-relaxed">{biz.description}</p>
              </section>
            )}

            {/* Services grouped by category */}
            {biz.services_by_category?.length > 0 && (
              <section className="bg-white rounded-card p-6 lg:p-8 hover:-translate-y-[2px] transition-all duration-200 ease-advia">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-heading font-medium text-primary-700 flex items-center gap-2.5">
                    <span className="heading-highlight" />
                    Services
                  </h2>
                  <Link href={`/book/${slug}`} className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors duration-200 ease-advia inline-flex items-center gap-1 group">
                    Book now
                    <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200 ease-advia" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                  </Link>
                </div>
                <div className="space-y-8">
                  {biz.services_by_category.map((g: any) => (
                    <div key={g.category_id}>
                      <h3 className="section-label-badge mb-3">{g.category_name}</h3>
                      <div className="space-y-2">
                        {g.services.map((s: any) => (
                          <div key={s.id} className="flex items-center justify-between p-4 bg-accent-100 rounded-card border border-transparent hover:border-primary-200 transition-all duration-200 ease-advia group cursor-default">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-primary-700 group-hover:text-primary-600 transition-colors duration-200 ease-advia">{s.name}</p>
                              {s.duration_minutes > 0 && (
                                <p className="text-xs text-primary-700/50 mt-1 flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                  {s.duration_minutes} min
                                </p>
                              )}
                            </div>
                            {Number(s.base_price) > 0 && (
                              <span className="text-sm font-bold text-primary-700 ml-3 flex-shrink-0">
                                &#8377;{Number(s.base_price).toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews section */}
            {biz.reviews?.length > 0 && (
              <section className="bg-white rounded-card p-6 lg:p-8 hover:-translate-y-[2px] transition-all duration-200 ease-advia">
                <ReviewSection
                  reviews={biz.reviews}
                  averageRating={avgRating}
                  totalReviews={totalReviews}
                />
              </section>
            )}
          </div>

          {/* ── Sidebar (1/3) ──────────────────────────────── */}
          <div className="space-y-6">

            {/* Sticky booking CTA card */}
            <div className="lg:sticky lg:top-6">
              <div className="bg-accent-200 rounded-card p-6 space-y-4">
                <div className="text-center">
                  <p className="section-label">Ready to get started?</p>
                  <p className="text-sm text-primary-700/70 mt-1">Book a service in minutes</p>
                </div>
                <Link
                  href={`/book/${slug}`}
                  className="btn-primary rounded-btn block w-full py-3.5 text-center text-sm font-bold transition-all duration-200 ease-advia"
                >
                  Book a Service
                </Link>
                {biz.phone && (
                  <button
                    onClick={() => setContactOpen(true)}
                    className="btn-secondary rounded-btn block w-full py-3 text-center text-sm font-semibold transition-all duration-200 ease-advia"
                  >
                    Contact Business
                  </button>
                )}
              </div>

              {/* Service areas */}
              {biz.service_areas?.length > 0 && (
                <div className="bg-white rounded-card p-6 mt-6">
                  <h2 className="text-lg font-heading font-medium text-primary-700 mb-4 flex items-center gap-2.5">
                    <span className="heading-highlight" />
                    Service Areas
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {biz.service_areas.map((a: any) => (
                      <Link
                        key={a.city_id}
                        href={`/${a.city_slug}`}
                        className="px-3.5 py-1.5 bg-accent-100 text-primary-700/70 text-xs font-medium rounded-btn border border-transparent hover:border-primary-200 hover:text-primary-700 transition-all duration-200 ease-advia"
                      >
                        {a.city_name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact info */}
              {(biz.phone || biz.email || biz.address || biz.website) && (
                <div className="bg-white rounded-card p-6 mt-6">
                  <h2 className="text-lg font-heading font-medium text-primary-700 mb-4 flex items-center gap-2.5">
                    <span className="heading-highlight" />
                    Contact Info
                  </h2>
                  <div className="grid grid-cols-1 gap-3">
                    {biz.phone && (
                      <a href={`tel:${biz.phone}`} className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-card bg-accent-200 flex items-center justify-center flex-shrink-0 transition-colors duration-200 ease-advia">
                          <svg className="w-4.5 h-4.5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        </div>
                        <div>
                          <p className="text-xs text-primary-700/50 font-medium">Phone</p>
                          <p className="text-sm font-semibold text-primary-700 group-hover:text-primary-600 transition-colors duration-200 ease-advia">{biz.phone}</p>
                        </div>
                      </a>
                    )}
                    {biz.email && (
                      <a href={`mailto:${biz.email}`} className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-card bg-accent-200 flex items-center justify-center flex-shrink-0 transition-colors duration-200 ease-advia">
                          <svg className="w-4.5 h-4.5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-primary-700/50 font-medium">Email</p>
                          <p className="text-sm font-semibold text-primary-700 group-hover:text-primary-600 transition-colors duration-200 ease-advia truncate">{biz.email}</p>
                        </div>
                      </a>
                    )}
                    {biz.address && (
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-card bg-accent-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-4.5 h-4.5 text-primary-700/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                        </div>
                        <div>
                          <p className="text-xs text-primary-700/50 font-medium">Address</p>
                          <p className="text-sm text-primary-700/70 leading-relaxed">{biz.address}</p>
                        </div>
                      </div>
                    )}
                    {biz.website && (
                      <a href={biz.website} target="_blank" rel="noopener" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-card bg-accent-200 flex items-center justify-center flex-shrink-0 transition-colors duration-200 ease-advia">
                          <svg className="w-4.5 h-4.5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-primary-700/50 font-medium">Website</p>
                          <p className="text-sm font-semibold text-primary-700 group-hover:text-primary-600 transition-colors duration-200 ease-advia truncate">{biz.website}</p>
                        </div>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          DARK CTA BANNER
          ═══════════════════════════════════════════════════════ */}
      <div className="bg-primary-800 py-12 lg:py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-heading font-medium text-white mb-3">Book a service today</h2>
          <p className="text-white/70 text-sm mb-6">Get expert help from {biz.name}. Schedule in just a few clicks.</p>
          <Link
            href={`/book/${slug}`}
            className="btn-primary rounded-btn inline-flex items-center gap-2 px-8 py-3 text-sm font-semibold transition-all duration-200 ease-advia"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
            Book Now
          </Link>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          MOBILE STICKY CTA BAR
          ═══════════════════════════════════════════════════════ */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-primary-700/10 shadow-2xl p-3 lg:hidden z-50">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          {biz.phone && (
            <button
              onClick={() => setContactOpen(true)}
              className="btn-secondary rounded-btn flex-1 py-3 text-sm font-semibold inline-flex items-center justify-center gap-2 transition-all duration-200 ease-advia"
            >
              <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              Call
            </button>
          )}
          <Link
            href={`/book/${slug}`}
            className="btn-primary rounded-btn flex-[2] py-3 text-center text-sm font-bold inline-flex items-center justify-center gap-2 transition-all duration-200 ease-advia"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
            Book Now
          </Link>
        </div>
      </div>

      {/* ── Contact modal ──────────────────────────────────── */}
      {biz.phone && (
        <ContactModal
          open={contactOpen}
          onClose={() => setContactOpen(false)}
          business={{ id: biz.id, name: biz.name, phone: biz.phone }}
        />
      )}
    </div>
  );
}
