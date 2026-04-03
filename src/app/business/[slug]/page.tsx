import type { Metadata } from "next";
import { getBusiness } from "@/lib/api";
import { SITE_NAME, buildCanonicalUrl } from "@/lib/seo";
import BusinessFallback from "@/components/business/BusinessFallback";

interface BusinessPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: BusinessPageProps): Promise<Metadata> {
  const { slug } = params;
  try {
    const res = await getBusiness(slug);
    if (res.success && res.data) {
      const biz = res.data;
      const title = biz.meta_title || `${biz.name} - ${biz.category_name || "Services"} | ${SITE_NAME}`;
      const description = biz.meta_description || biz.short_description || `${biz.name} - home services provider`;
      return { title, description, alternates: { canonical: buildCanonicalUrl(`/business/${slug}`) } };
    }
  } catch {}
  return { title: `Business Details | ${SITE_NAME}` };
}

export default function BusinessDetailPage({ params }: BusinessPageProps) {
  return <BusinessFallback slug={params.slug} />;
}
