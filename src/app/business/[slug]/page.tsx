import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import LocalBusinessSchema from "@/components/seo/LocalBusinessSchema";
import FAQSchema from "@/components/seo/FAQSchema";
import RatingStars from "@/components/common/RatingStars";
import ReviewSection from "@/components/business/ReviewSection";
import BusinessCard from "@/components/business/BusinessCard";
import ContactButton from "@/components/business/ContactButton";
import { getBusiness, getStaticParams } from "@/lib/api";
import { SITE_NAME, SITE_URL, buildCanonicalUrl } from "@/lib/seo";
import type { BreadcrumbItem } from "@/types";

interface BusinessPageProps {
  params: { slug: string };
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  try {
    const res = await getStaticParams("businesses");
    if (res.success) {
      return res.data.map((item) => ({ slug: item.slug }));
    }
  } catch {}
  return [];
}

export async function generateMetadata({
  params,
}: BusinessPageProps): Promise<Metadata> {
  const { slug } = params;
  try {
    const res = await getBusiness(slug);
    if (res.success) {
      const biz = res.data;
      const location = [biz.locality_name, biz.city_name].filter(Boolean).join(", ");
      const ratingStr = biz.rating ? ` - ${biz.rating}/5 Rating` : "";
      const reviewStr = biz.review_count ? ` (${biz.review_count} Reviews)` : "";
      const title = biz.meta_title || `${biz.name}${location ? ` in ${location}` : ""}${ratingStr}${reviewStr}`;
      const description =
        biz.meta_description ||
        `${biz.name} - ${biz.category_name || "home services"} in ${location}. ${biz.short_description || "View contact details, reviews, ratings, photos and more."}`;

      return {
        title,
        description,
        alternates: { canonical: buildCanonicalUrl(`/business/${slug}`) },
        openGraph: {
          title,
          description,
          type: "website",
          url: buildCanonicalUrl(`/business/${slug}`),
          images: biz.cover_image_url
            ? [{ url: biz.cover_image_url, width: 1200, height: 630 }]
            : undefined,
        },
      };
    }
  } catch {}

  return {
    title: "Business Details",
    description: `View business details, reviews, and contact information on ${SITE_NAME}.`,
  };
}

export default async function BusinessDetailPage({
  params,
}: BusinessPageProps) {
  const { slug } = params;

  let business;
  try {
    const res = await getBusiness(slug);
    if (res.success) {
      business = res.data;
    } else {
      notFound();
    }
  } catch {
    notFound();
  }

  if (!business) notFound();

  const breadcrumbs: BreadcrumbItem[] = [{ label: "Home", href: "/" }];
  if (business.city_slug && business.city_name) {
    breadcrumbs.push({ label: business.city_name, href: `/${business.city_slug}` });
  }
  if (business.city_slug && business.category_slug && business.category_name) {
    breadcrumbs.push({
      label: business.category_name,
      href: `/${business.city_slug}/${business.category_slug}`,
    });
  }
  breadcrumbs.push({
    label: business.name,
    href: `/business/${slug}`,
    isCurrentPage: true,
  });

  const locationParts = [business.address, business.locality_name, business.city_name, business.state_name, business.pincode].filter(Boolean);
  const fullAddress = locationParts.join(", ");

  const shareUrl = `${SITE_URL}/business/${slug}`;
  const shareText = `Check out ${business.name} on ${SITE_NAME}`;

  return (
    <>
      <LocalBusinessSchema business={business} />
      <BreadcrumbSchema items={breadcrumbs} />
      {business.faqs && business.faqs.length > 0 && (
        <FAQSchema faqs={business.faqs} />
      )}

      <div className="container mx-auto px-4">
        <Breadcrumbs items={breadcrumbs} />
      </div>

      {/* ── Business Header ─────────────────────────────────────── */}
      <section className="bg-white border-b border-surface-200">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Logo */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden bg-surface-100 border-2 border-surface-200 shadow-sm">
                {business.logo_url ? (
                  <Image
                    src={business.logo_url}
                    alt={`${business.name} logo`}
                    width={112}
                    height={112}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
                    <span className="text-3xl font-heading font-bold text-primary-300">
                      {business.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 mb-1.5 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-heading font-bold text-gray-900">
                  {business.name}
                </h1>
                {business.is_verified && (
                  <span className="badge-verified mt-1.5">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
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
                  <span className="badge-premium mt-1.5">Featured</span>
                )}
              </div>

              {business.category_name && (
                <p className="text-sm font-semibold text-primary-500 uppercase tracking-wide mb-2">
                  {business.category_name}
                </p>
              )}

              {business.rating ? (
                <div className="mb-3">
                  <RatingStars
                    rating={business.rating}
                    size="md"
                    reviewCount={business.review_count}
                    compact
                  />
                </div>
              ) : null}

              {business.short_description && (
                <p className="text-gray-600 text-sm leading-relaxed mb-3 max-w-2xl">
                  {business.short_description}
                </p>
              )}

              {/* Quick Info */}
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
                {fullAddress && (
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="max-w-xs truncate">{fullAddress}</span>
                  </div>
                )}
                {business.phone && (
                  <a
                    href={`tel:${business.phone}`}
                    className="flex items-center gap-1.5 text-green-600 hover:text-green-700 font-semibold"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {business.phone}
                  </a>
                )}
                {business.established_year && (
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Est. {business.established_year}
                  </div>
                )}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-row md:flex-col items-stretch gap-2.5 flex-shrink-0 md:min-w-[170px]">
              {business.phone && (
                <ContactButton
                  business={{ id: Number(business.id), name: business.name, phone: business.phone, mobile: business.mobile }}
                  variant="both"
                  className="flex-1 md:flex-none"
                />
              )}
              <Link
                href={`/book/${business.slug}`}
                className="flex-1 md:flex-none bg-gradient-to-r from-accent-500 to-accent-600 text-white font-bold flex items-center justify-center gap-2 rounded-xl py-3 px-6 hover:from-accent-600 hover:to-accent-700 transition-all shadow-sm hover:shadow-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Book Now
              </Link>
              {business.website && (
                <a
                  href={business.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 md:flex-none btn-secondary flex items-center justify-center gap-2 rounded-xl py-3 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Website
                </a>
              )}
            </div>
          </div>

          {/* Share buttons */}
          <div className="flex items-center gap-3 mt-5 pt-4 border-t border-surface-200">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Share:</span>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-green-50 hover:bg-green-100 flex items-center justify-center transition-colors"
              aria-label="Share on WhatsApp"
            >
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition-colors"
              aria-label="Share on Facebook"
            >
              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-sky-50 hover:bg-sky-100 flex items-center justify-center transition-colors"
              aria-label="Share on Twitter"
            >
              <svg className="w-4 h-4 text-sky-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* ── Photo Gallery ───────────────────────────────────────── */}
      {business.images && business.images.length > 0 && (
        <section className="bg-white border-b border-surface-200">
          <div className="container mx-auto px-4 py-6">
            <h2 className="text-lg font-heading font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Photos ({business.images.length})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {business.images.slice(0, 8).map((img) => (
                <div
                  key={img.id}
                  className="relative aspect-[4/3] rounded-xl overflow-hidden bg-surface-100 group cursor-pointer"
                >
                  <Image
                    src={img.image_url}
                    alt={img.alt_text || business.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Details Section ─────────────────────────────────────── */}
      <section className="py-8 md:py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="flex-1 min-w-0 space-y-6">
              {/* Description */}
              {business.description && (
                <div className="card p-6">
                  <h2 className="text-lg font-heading font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    About {business.name}
                  </h2>
                  <div
                    className="text-gray-600 text-sm leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: business.description }}
                  />
                </div>
              )}

              {/* Services */}
              {business.services && business.services.length > 0 && (
                <div className="card p-6">
                  <h2 className="text-lg font-heading font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    Services Offered
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {business.services.map((service, idx) => (
                      <span key={idx} className="tag cursor-default hover:bg-surface-100">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Business Hours */}
              {business.opening_hours && (
                <div className="card p-6">
                  <h2 className="text-lg font-heading font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Business Hours
                  </h2>
                  <p className="text-gray-600 text-sm">{business.opening_hours}</p>
                </div>
              )}

              {/* FAQs */}
              {business.faqs && business.faqs.length > 0 && (
                <div className="card p-6">
                  <h2 className="text-lg font-heading font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Frequently Asked Questions
                  </h2>
                  <div className="space-y-4">
                    {business.faqs.map((faq, index) => (
                      <div
                        key={index}
                        className="border-b border-surface-200 last:border-0 pb-4 last:pb-0"
                      >
                        <h3 className="font-semibold text-gray-800 text-sm mb-1.5">
                          {faq.question}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
              <div className="card p-6">
                <ReviewSection
                  reviews={business.reviews || []}
                  averageRating={business.rating}
                  totalReviews={business.review_count}
                />
              </div>
            </div>

            {/* ── Sidebar ───────────────────────────────────────── */}
            <aside className="w-full lg:w-80 flex-shrink-0 space-y-5">
              {/* Contact Card */}
              <div className="card p-6 sticky top-24">
                <h3 className="font-heading font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Contact Information
                </h3>
                <div className="space-y-3.5">
                  {fullAddress && (
                    <div className="flex gap-3">
                      <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="text-sm text-gray-600 leading-relaxed">{fullAddress}</p>
                    </div>
                  )}
                  {business.phone && (
                    <div className="flex gap-3">
                      <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <a href={`tel:${business.phone}`} className="text-sm text-green-600 hover:text-green-700 font-semibold">
                        {business.phone}
                      </a>
                    </div>
                  )}
                  {business.mobile && business.mobile !== business.phone && (
                    <div className="flex gap-3">
                      <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <a href={`tel:${business.mobile}`} className="text-sm text-green-600 hover:text-green-700 font-semibold">
                        {business.mobile}
                      </a>
                    </div>
                  )}
                  {business.email && (
                    <div className="flex gap-3">
                      <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <a href={`mailto:${business.email}`} className="text-sm text-primary-500 hover:text-primary-600 font-medium break-all">
                        {business.email}
                      </a>
                    </div>
                  )}
                  {business.website && (
                    <div className="flex gap-3">
                      <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-500 hover:text-primary-600 font-medium break-all">
                        {business.website.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  )}
                </div>

                {/* Quick action buttons */}
                <div className="mt-5 pt-4 border-t border-surface-200 space-y-2">
                  {business.phone && (
                    <a
                      href={`tel:${business.phone}`}
                      className="btn-call w-full flex items-center justify-center gap-2 py-3 rounded-xl"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Call Now
                    </a>
                  )}
                  <Link
                    href={`/book/${business.slug}`}
                    className="w-full bg-gradient-to-r from-accent-500 to-accent-600 text-white font-bold flex items-center justify-center gap-2 py-3.5 rounded-xl hover:from-accent-600 hover:to-accent-700 transition-all shadow-sm hover:shadow-md text-base"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Book Now
                  </Link>
                </div>
              </div>

              {/* Map Placeholder */}
              {business.latitude && business.longitude && (
                <div className="card overflow-hidden">
                  <div className="aspect-[4/3] bg-surface-100 flex items-center justify-center">
                    <a
                      href={`https://www.google.com/maps?q=${business.latitude},${business.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary-500 hover:text-primary-600 flex flex-col items-center gap-2 transition-colors"
                    >
                      <svg className="w-10 h-10 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      <span className="font-medium">View on Google Maps</span>
                    </a>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>

      {/* ── Related Businesses ──────────────────────────────────── */}
      {business.related_businesses && business.related_businesses.length > 0 && (
        <section className="py-10 bg-surface-50 border-t border-surface-200">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-6">
              <h2 className="text-xl font-heading font-bold text-gray-900">
                Similar {business.category_name || "Services"} in{" "}
                {business.city_name}
              </h2>
              {business.city_slug && business.category_slug && (
                <Link
                  href={`/${business.city_slug}/${business.category_slug}`}
                  className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-primary-500 hover:text-primary-600 transition-colors"
                >
                  View All
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {business.related_businesses.slice(0, 4).map((biz) => (
                <BusinessCard key={biz.id} business={biz} layout="grid" />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
