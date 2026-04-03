"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useToast } from "@/components/admin/Toast";
import {
  getVendorBookings,
  acceptBooking,
  rejectBooking,
  startBooking,
  completeBooking,
  collectPayment,
} from "@/lib/vendor-api";
import type { Booking, BookingStatus } from "@/types";
import { usePolling } from "@/hooks/usePolling";

const TABS: { label: string; value: BookingStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "In Progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  assigned: "bg-indigo-100 text-indigo-700",
  in_progress: "bg-primary-100 text-primary-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  refunded: "bg-gray-100 text-gray-700",
};

export default function VendorBookingsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status") || "all";

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<{
    total: number;
    page: number;
    per_page: number;
    pages: number;
  } | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page,
        per_page: 10,
      };
      if (statusParam !== "all") params.status = statusParam;
      const res = await getVendorBookings(params as any);
      setBookings(res.data.bookings || []);
      setPagination(res.data.pagination);
    } catch {
      toast("Failed to load bookings", "error");
    } finally {
      setLoading(false);
    }
  }, [page, statusParam]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Auto-refresh every 10 seconds for new bookings
  const silentRefresh = useCallback(async () => {
    try {
      const params: Record<string, string | number> = { page, per_page: 10 };
      if (statusParam !== "all") params.status = statusParam;
      const res = await getVendorBookings(params as any);
      setBookings(res.data.bookings || []);
      setPagination(res.data.pagination);
    } catch {}
  }, [page, statusParam]);
  usePolling(silentRefresh, 10000);

  const handleAction = async (
    id: number,
    action: "accept" | "reject" | "start" | "complete" | "collect-payment"
  ) => {
    setActionLoading(id);
    try {
      switch (action) {
        case "accept":
          await acceptBooking(id);
          toast("Booking accepted", "success");
          break;
        case "reject":
          await rejectBooking(id);
          toast("Booking rejected", "success");
          break;
        case "start":
          await startBooking(id);
          toast("Booking started", "success");
          break;
        case "complete":
          await completeBooking(id);
          toast("Booking completed", "success");
          break;
        case "collect-payment":
          await collectPayment(id, "cash");
          toast("Payment collected! Marked as paid.", "success");
          break;
      }
      fetchBookings();
    } catch (err) {
      toast(
        `Failed to ${action} booking`,
        "error"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const switchTab = (status: string) => {
    setPage(1);
    if (status === "all") {
      router.push("/vendor/bookings");
    } else {
      router.push(`/vendor/bookings?status=${status}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Bookings</h2>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-4 overflow-x-auto" aria-label="Tabs">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => switchTab(tab.value)}
              className={`whitespace-nowrap pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                statusParam === tab.value
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm">No bookings found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Link
                      href={`/vendor/bookings/${booking.id}`}
                      className="text-sm font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                    >
                      #{booking.booking_number}
                    </Link>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        STATUS_BADGE[booking.status] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {booking.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">
                      {booking.customer_name || "Customer"}
                    </span>
                    {booking.customer_phone && (
                      <span className="text-gray-400 ml-2">
                        {booking.customer_phone}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {booking.scheduled_date} at {booking.scheduled_time}
                    {booking.items && booking.items.length > 0 && (
                      <>
                        {" "}
                        &middot;{" "}
                        {booking.items.map((i) => i.service_name).join(", ")}
                      </>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <p className="text-base font-bold text-gray-900">
                    Rs. {booking.total_amount?.toLocaleString("en-IN")}
                  </p>
                  <div className="flex gap-2">
                    {booking.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleAction(booking.id, "accept")}
                          disabled={actionLoading === booking.id}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleAction(booking.id, "reject")}
                          disabled={actionLoading === booking.id}
                          className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {booking.status === "confirmed" && (
                      <button
                        onClick={() => handleAction(booking.id, "start")}
                        disabled={actionLoading === booking.id}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                      >
                        Start Job
                      </button>
                    )}
                    {booking.status === "in_progress" && (
                      <button
                        onClick={() => handleAction(booking.id, "complete")}
                        disabled={actionLoading === booking.id}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
                      >
                        Complete
                      </button>
                    )}
                    {booking.status === "completed" && booking.payment_status !== "paid" && (
                      <button
                        onClick={() => handleAction(booking.id, "collect-payment")}
                        disabled={actionLoading === booking.id}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75" /></svg>
                        Collect Payment
                      </button>
                    )}
                    {booking.status === "completed" && booking.payment_status === "paid" && (
                      <span className="px-3 py-1.5 text-xs font-bold text-green-700 bg-green-100 rounded-lg flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Paid
                      </span>
                    )}
                    <Link
                      href={`/vendor/bookings/${booking.id}`}
                      className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-gray-500">
            Page {pagination.page} of {pagination.pages} ({pagination.total}{" "}
            total)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={page >= pagination.pages}
              className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
