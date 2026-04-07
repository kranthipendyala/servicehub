import type { Metadata } from "next";
import { Suspense } from "react";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import SearchClient from "@/components/search/SearchClient";
import { SITE_NAME } from "@/lib/seo";
import type { BreadcrumbItem } from "@/types";

interface SearchPageProps {
  searchParams: { q?: string; city?: string };
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const query = searchParams.q || "";
  const city = searchParams.city || "";
  const titleParts = ["Search Results"];
  if (query) titleParts.push(`for "${query}"`);
  if (city) titleParts.push(`in ${city}`);

  return {
    title: `${titleParts.join(" ")} | ${SITE_NAME}`,
    description: `Search results for home services${query ? ` matching "${query}"` : ""}${city ? ` in ${city}` : ""}. Compare and find the best service providers.`,
    robots: "noindex, follow",
  };
}

export default function SearchPage() {
  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Search Results", href: "/search", isCurrentPage: true },
  ];

  return (
    <>
      <div className="container mx-auto px-4">
        <Breadcrumbs items={breadcrumbs} />
      </div>

      <Suspense fallback={
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      }>
        <SearchClient />
      </Suspense>
    </>
  );
}
