import type { BreadcrumbItem } from "@/types";
import { SITE_URL } from "@/lib/seo";
import SchemaMarkup from "./SchemaMarkup";

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

export default function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: item.isCurrentPage
        ? undefined
        : item.href.startsWith("http")
          ? item.href
          : `${SITE_URL}${item.href}`,
    })),
  };

  return <SchemaMarkup data={schema} />;
}
