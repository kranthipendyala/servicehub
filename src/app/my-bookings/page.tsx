"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Booking, BookingStatus } from "@/types";
import { useAuth } from "@/components/auth/AuthProvider";
import { getMyBookings } from "@/lib/booking-api";
import BookingStatusBadge from "@/components/booking/BookingStatusBadge";
import { usePolling } from "@/hooks/usePolling";

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
    } finally {
      setLoading(false);
    }
  }, [page, tab]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const silentRefresh = useCallback(async () => {
    try {
      const res = await getMyBookings(page, tab || undefined);
      if (res.success) { setBookings(res.data); setTotalPages(res.pagination.total_pages); }
    } catch {}
  }, [page, tab]);
  usePolling(silentRefresh, 15000);

  const handleTabChange = (value: string) => {
    setTab(value);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Header */}
      <div className="bg-primary-800 text-white section-padding py-10 md:py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-heading font-bold">My Bookings</h1>
          <p className="text-primary-200 text-sm mt-1">Track and manage your service bookings</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="sticky top-0 z-10 bg-surface-50 pt-2 -mx-4 px-4 pb-3 mb-6 md:static md:mx-0 md:px-0 md:pt-0 md:bg-transparent">
          <div className="flex gap-2 flex-nowrap overflow-x-auto pb-2 scrollbar-hide">
            {TABS.map((t) => (
              <button
                key={t.value}
                onClick={() => handleTabChange(t.value)}
                className={`px-5 py-2.5 rounded-btn text-sm font-semibold whitespace-nowrap transition-all duration-200 ease-advia min-h-[40px] ${
                  tab === t.value
                    ? "bg-primary-600 text-white"
                    : "bg-white text-primary-700 border border-surface-200 hover:border-surface-300"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin h-8 w-8 border-[3px] border-primary-600 border-t-transparent rounded-full" />
              <p className="text-sm text-surface-400">Loading bookings...</p>
            </div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="w-20 h-20 mx-auto mb-6 bg-accent-200 rounded-card flex items-center justify-center">
              <svg
                className="w-10 h-10 text-primary-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <p className="text-surface-900 text-xl font-heading font-bold">No bookings yet</p>
            <p className="text-surface-500 text-sm mt-2 max-w-xs mx-auto">
              Your bookings will appear here once you book a service. Let&apos;s get started!
            </p>
            <Link
              href="/"
              className="btn-primary inline-flex items-center gap-2 mt-6"
            >
              Browse Services
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </Link>
          </div>
        ) : (
          <>
            {/* Booking cards */}
            <div className="space-y-3">
              {bookings.map((b) => (
                <Link
                  key={b.id}
                  href={`/my-bookings/${b.id}`}
                  className="block bg-white rounded-card p-5 md:p-6 border border-surface-200 hover:-translate-y-[8px] hover:shadow-lg transition-all duration-200 ease-advia group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-surface-400 font-mono">
                        {b.booking_number}
                      </p>
                      <p className="font-heading font-bold text-surface-900 mt-1 text-base group-hover:text-primary-700 transition-colors duration-200 ease-advia">
                        {b.business_name || "Service Booking"}
                      </p>
                      <p className="text-sm text-surface-500 mt-1.5 flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-primary-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(b.scheduled_date + "T00:00:00").toLocaleDateString(
                          "en-IN",
                          { weekday: "short", month: "short", day: "numeric", year: "numeric" }
                        )}{" "}
                        at {b.scheduled_time}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <BookingStatusBadge status={b.status} />
                      <p className="text-xl text-primary-600 font-semibold mt-3">
                        &#8377;{b.total_amount}
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
                  className="px-5 py-2.5 border border-surface-200 rounded-btn text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-50 hover:border-surface-300 transition-all duration-200 ease-advia"
                >
                  Previous
                </button>
                <span className="text-sm text-surface-500 font-medium">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-5 py-2.5 border border-surface-200 rounded-btn text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-50 hover:border-surface-300 transition-all duration-200 ease-advia"
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
