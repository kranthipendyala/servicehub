import { Metadata } from "next";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import CategoryIcon from "@/components/ui/CategoryIcon";
import { SITE_NAME } from "@/lib/seo";
import type { Category } from "@/types";

export const metadata: Metadata = {
  title: `All Services | ${SITE_NAME}`,
  description:
    "Browse all home services — plumbing, electrical, AC repair, cleaning, painting and more. Find verified professionals for every need.",
};

async function getAllCategories(): Promise<Category[]> {
  try {
    const res = await fetchApi<any>("/categories", { revalidate: 3600, params: { tree: "1" } });
    if (res.success && res.data) {
      const cats = res.data.categories || res.data || [];
      return Array.isArray(cats) ? cats : [];
    }
  } catch {}
  return [];
}

export default async function ServicesIndexPage() {
  const categories = await getAllCategories();
  const parentCategories = categories.filter((c: any) => !c.parent_id);

  return (
    <div className="min-h-screen bg-accent-200">
      {/* Hero */}
      <div className="bg-primary-800 text-white relative overflow-hidden">
        <div className="absolute top-[-30%] right-[-10%] w-[400px] h-[400px] rounded-full bg-white/[0.03]" />
        <div className="absolute bottom-[-40%] left-[-5%] w-[300px] h-[300px] rounded-full bg-white/[0.02]" />

        <div className="max-w-7xl mx-auto px-4 py-10 md:py-14 relative">
          <nav className="flex items-center gap-2 text-sm text-white/50 mb-5">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white/80 font-medium">All Services</span>
          </nav>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold tracking-tight leading-tight">
            All Services
          </h1>
          <p className="mt-3 text-white/70 max-w-2xl text-lg leading-relaxed">
            Browse our complete catalog of home and professional services.
            Verified providers, transparent pricing, instant booking.
          </p>

          <div className="flex items-center gap-3 mt-5 text-sm">
            <span className="flex items-center gap-1.5 bg-white/10 text-white/70 px-3 py-1.5 rounded-full font-medium">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {parentCategories.length} Service Categories
            </span>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 py-10 md:py-14">
        {parentCategories.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">Loading services...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {parentCategories.map((cat: any) => (
              <Link
                key={cat.id}
                href={`/services/${cat.slug}`}
                className="group bg-white rounded-card p-6 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 ease-advia border border-gray-100"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-primary-50 border border-primary-100 rounded-2xl flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all duration-200 ease-advia flex-shrink-0">
                    {cat.icon ? (
                      <CategoryIcon icon={cat.icon} className="w-7 h-7" />
                    ) : (
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-heading font-bold text-primary-800 group-hover:text-primary-600 transition-colors">
                      {cat.name}
                    </h2>
                    {cat.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{cat.description}</p>
                    )}
                  </div>
                </div>

                {cat.children && cat.children.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-2">
                      Popular
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.children.slice(0, 4).map((child: any) => (
                        <span
                          key={child.id}
                          className="text-xs px-2 py-1 bg-accent-100 text-gray-700 rounded-md font-medium"
                        >
                          {child.name}
                        </span>
                      ))}
                      {cat.children.length > 4 && (
                        <span className="text-xs px-2 py-1 text-primary-600 font-semibold">
                          +{cat.children.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 bg-primary-50 border border-primary-100 rounded-card p-8 text-center">
          <h3 className="text-xl font-heading font-bold text-primary-800 mb-2">
            Can&apos;t find what you&apos;re looking for?
          </h3>
          <p className="text-gray-600 mb-5">
            Search for any service or browse by city to find the right professional.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-bold hover:bg-primary-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search Services
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
