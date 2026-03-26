import type { Business } from "@/types";
import BusinessCard from "./BusinessCard";
import Pagination from "@/components/common/Pagination";

interface BusinessListProps {
  businesses: Business[];
  currentPage: number;
  totalPages: number;
  basePath: string;
  queryParams?: Record<string, string>;
  emptyMessage?: string;
  layout?: "grid" | "list";
  totalItems?: number;
}

export default function BusinessList({
  businesses,
  currentPage,
  totalPages,
  basePath,
  queryParams = {},
  emptyMessage = "No businesses found matching your criteria.",
  layout = "list",
  totalItems,
}: BusinessListProps) {
  if (!businesses || businesses.length === 0) {
    return (
      <div className="text-center py-20 px-4">
        <div className="w-20 h-20 mx-auto mb-6 bg-surface-100 rounded-full flex items-center justify-center">
          <svg
            className="w-10 h-10 text-surface-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <p className="text-gray-600 text-lg font-medium">{emptyMessage}</p>
        <p className="text-gray-400 text-sm mt-2">
          Try adjusting your filters or search terms
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Results count */}
      {totalItems !== undefined && totalItems > 0 && (
        <p className="text-sm text-gray-500 mb-4">
          Showing{" "}
          <span className="font-semibold text-gray-800">
            {(currentPage - 1) * businesses.length + 1}-
            {Math.min(currentPage * businesses.length, totalItems)}
          </span>{" "}
          of <span className="font-semibold text-gray-800">{totalItems}</span>{" "}
          results
        </p>
      )}

      {layout === "list" ? (
        <div className="space-y-4">
          {businesses.map((business) => (
            <BusinessCard key={business.id} business={business} layout="list" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {businesses.map((business) => (
            <BusinessCard key={business.id} business={business} layout="grid" />
          ))}
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={basePath}
        queryParams={queryParams}
      />
    </div>
  );
}
