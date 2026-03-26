import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  queryParams?: Record<string, string>;
}

export default function Pagination({
  currentPage,
  totalPages,
  basePath,
  queryParams = {},
}: PaginationProps) {
  if (totalPages <= 1) return null;

  function buildUrl(page: number): string {
    const params = new URLSearchParams(queryParams);
    if (page > 1) {
      params.set("page", String(page));
    } else {
      params.delete("page");
    }
    const queryString = params.toString();
    return queryString ? `${basePath}?${queryString}` : basePath;
  }

  const pages: (number | "ellipsis")[] = [];
  const delta = 2;

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - delta && i <= currentPage + delta)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "ellipsis") {
      pages.push("ellipsis");
    }
  }

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10 pt-6 border-t border-surface-200"
    >
      {/* Results info */}
      <p className="text-sm text-gray-500">
        Page <span className="font-semibold text-gray-800">{currentPage}</span>{" "}
        of <span className="font-semibold text-gray-800">{totalPages}</span>
      </p>

      <div className="flex items-center gap-1">
        {/* Previous */}
        {currentPage > 1 ? (
          <Link
            href={buildUrl(currentPage - 1)}
            rel="prev"
            className="inline-flex items-center px-3.5 py-2 text-sm font-medium text-gray-700 bg-white border border-surface-200 rounded-lg hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 transition-all"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Previous
          </Link>
        ) : (
          <span className="inline-flex items-center px-3.5 py-2 text-sm font-medium text-gray-300 bg-surface-50 border border-surface-200 rounded-lg cursor-not-allowed">
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Previous
          </span>
        )}

        {/* Page Numbers */}
        <div className="hidden sm:flex items-center gap-1">
          {pages.map((page, idx) =>
            page === "ellipsis" ? (
              <span
                key={`ellipsis-${idx}`}
                className="px-2 py-2 text-sm text-gray-400"
              >
                ...
              </span>
            ) : page === currentPage ? (
              <span
                key={page}
                className="inline-flex items-center justify-center w-10 h-10 text-sm font-bold text-white bg-primary-500 rounded-lg shadow-sm"
                aria-current="page"
              >
                {page}
              </span>
            ) : (
              <Link
                key={page}
                href={buildUrl(page)}
                className="inline-flex items-center justify-center w-10 h-10 text-sm font-medium text-gray-700 bg-white border border-surface-200 rounded-lg hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 transition-all"
              >
                {page}
              </Link>
            )
          )}
        </div>

        {/* Next */}
        {currentPage < totalPages ? (
          <Link
            href={buildUrl(currentPage + 1)}
            rel="next"
            className="inline-flex items-center px-3.5 py-2 text-sm font-medium text-gray-700 bg-white border border-surface-200 rounded-lg hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 transition-all"
          >
            Next
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        ) : (
          <span className="inline-flex items-center px-3.5 py-2 text-sm font-medium text-gray-300 bg-surface-50 border border-surface-200 rounded-lg cursor-not-allowed">
            Next
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </span>
        )}
      </div>
    </nav>
  );
}
