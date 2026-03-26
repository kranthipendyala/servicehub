import type { Business } from "@/types";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import SchemaMarkup from "./SchemaMarkup";

interface LocalBusinessSchemaProps {
  business: Business;
}

export default function LocalBusinessSchema({
  business,
}: LocalBusinessSchemaProps) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/business/${business.slug}#business`,
    name: business.name,
    description: business.short_description || business.description || "",
    url: `${SITE_URL}/business/${business.slug}`,
    telephone: business.phone || business.mobile || undefined,
    email: business.email || undefined,
    image: business.cover_image_url || business.logo_url || undefined,
    logo: business.logo_url || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address || "",
      addressLocality: business.locality_name || business.city_name || "",
      addressRegion: business.state_name || "",
      postalCode: business.pincode || "",
      addressCountry: "IN",
    },
    geo:
      business.latitude && business.longitude
        ? {
            "@type": "GeoCoordinates",
            latitude: business.latitude,
            longitude: business.longitude,
          }
        : undefined,
    aggregateRating:
      business.rating && business.review_count && business.review_count > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: business.rating,
            reviewCount: business.review_count,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
    review: business.reviews?.slice(0, 5).map((review) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: review.user_name,
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1,
      },
      reviewBody: review.comment,
      datePublished: review.created_at,
    })),
    openingHours: business.opening_hours || undefined,
    foundingDate: business.established_year
      ? String(business.established_year)
      : undefined,
    priceRange: "$$",
    isAccessibleForFree: true,
    sameAs: business.website ? [business.website] : undefined,
    parentOrganization: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };

  // Remove undefined values
  const cleanSchema = JSON.parse(JSON.stringify(schema));

  return <SchemaMarkup data={cleanSchema} />;
}
