"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Booking, BookingStatus } from "@/types";
import { useAuth } from "@/components/auth/AuthProvider";
import { getMyBookings } from "@/lib/booking-api";
import BookingStatusBadge from "@/components/booking/BookingStatusBadge";

const TABS: { label: string; value: string }[] = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "In Progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

export default function MyBookingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tab, setTab] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=/my-bookings");
    }
  }, [user, router]);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyBookings(page, tab || undefined);
      if (res.success) {
        setBookings(res.data);
        setTotalPages(res.pagination.total_pages);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [page, tab]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleTabChange = (value: string) => {
    setTab(value);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#0d9488] text-white py-6">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-2xl font-bold">My Bookings</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Tabs - sticky on mobile */}
        <div className="sticky top-0 z-10 bg-gray-50 pt-2 -mx-4 px-4 pb-3 mb-6 md:static md:mx-0 md:px-0 md:pt-0">
          <div className="flex gap-2 flex-nowrap overflow-x-auto pb-2 scrollbar-hide">
            {TABS.map((t) => (
              <button
                key={t.value}
                onClick={() => handleTabChange(t.value)}
                className={`px-5 py-3 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 min-h-[44px] ${
                  tab === t.value
                    ? "bg-[#f97316] text-white shadow-sm"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-[#0d9488] border-t-transparent rounded-full" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="w-24 h-24 mx-auto mb-6 bg-orange-50 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-[#f97316]/60"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <p className="text-gray-900 text-xl font-bold">No bookings yet</p>
            <p className="text-gray-500 text-sm mt-2 max-w-xs mx-auto">
              Your bookings will appear here once you book a service. Let&apos;s get started!
            </p>
            <Link
              href="/"
              className="inline-block mt-6 px-8 py-3 bg-[#f97316] text-white rounded-2xl text-sm font-bold hover:bg-[#ea580c] transition-all duration-200 shadow-sm hover:shadow-md min-h-[48px]"
            >
              Browse Services
            </Link>
          </div>
        ) : (
          <>
            {/* Booking cards */}
            <div className="space-y-4">
              {bookings.map((b) => (
                <Link
                  key={b.id}
                  href={`/my-bookings/${b.id}`}
                  className="block bg-white rounded-2xl shadow-sm p-5 md:p-6 hover:shadow-md hover:border-[#f97316] border border-transparent transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 font-mono">
                        {b.booking_number}
                      </p>
                      <p className="font-bold text-gray-900 mt-1 text-base">
                        {b.business_name || "Service Booking"}
                      </p>
                      <p className="text-sm text-gray-600 mt-1.5 flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(b.scheduled_date + "T00:00:00").toLocaleDateString(
                          "en-IN",
                          {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}{" "}
                        at {b.scheduled_time}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <BookingStatusBadge status={b.status} />
                      <p className="text-xl font-bold text-[#0d9488] mt-3">
                        ₹{b.total_amount}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-5 py-3 border rounded-2xl text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-all duration-200 min-h-[44px]"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600 font-medium">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-5 py-3 border rounded-2xl text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-all duration-200 min-h-[44px]"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
