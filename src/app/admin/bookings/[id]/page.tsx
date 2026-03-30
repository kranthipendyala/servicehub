"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  getAdminBookingDetail,
  updateBookingStatus,
  AdminBooking,
} from "@/lib/admin-api";
import { useToast } from "@/components/admin/Toast";

const ALL_STATUSES = [
  "pending",
  "confirmed",
  "assigned",
  "in_progress",
  "completed",
  "cancelled",
  "refunded",
];

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  assigned: "bg-indigo-100 text-indigo-700",
  in_progress: "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  refunded: "bg-gray-100 text-gray-600",
};

const paymentColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  paid: "bg-green-100 text-green-700",
  partially_refunded: "bg-orange-100 text-orange-700",
  refunded: "bg-gray-100 text-gray-600",
  failed: "bg-red-100 text-red-700",
};

export default function AdminBookingDetailPage() {
  const params = useParams();
  const { toast } = useToast();
  const [booking, setBooking] = useState<AdminBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const bookingId = params.id as string;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminBookingDetail(bookingId);
      setBooking(res.data);
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Failed to load booking",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [bookingId, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatusChange = async (newStatus: string) => {
    if (!booking) return;
    setUpdating(true);
    try {
      await updateBookingStatus(booking.id, newStatus);
      toast(`Status updated to "${newStatus.replace(/_/g, " ")}"`, "success");
      load();
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Failed to update status",
        "error"
      );
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-5 bg-gray-200 rounded animate-pulse w-3/4" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Booking not found.</p>
        <Link
          href="/admin/bookings"
          className="mt-4 inline-block text-primary-600 hover:underline"
        >
          Back to bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/bookings"
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Booking #{booking.booking_number}
            </h1>
            <p className="text-sm text-gray-500">
              Created {booking.created_at}
            </p>
          </div>
        </div>

        {/* Status override */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">
            Override Status:
          </label>
          <select
            value={booking.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={updating}
            className="text-sm rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 disabled:opacity-50"
          >
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status & Payment badges */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-4 mb-6">
              <span
                className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                  statusColors[booking.status] || "bg-gray-100 text-gray-600"
                }`}
              >
                {booking.status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </span>
              <span
                className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                  paymentColors[booking.payment_status] || "bg-gray-100 text-gray-600"
                }`}
              >
                Payment: {booking.payment_status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </span>
              {booking.payment_method && (
                <span className="text-sm text-gray-500">
                  via {booking.payment_method}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Scheduled Date</p>
                <p className="font-medium text-gray-900">{booking.scheduled_date}</p>
              </div>
              <div>
                <p className="text-gray-500">Scheduled Time</p>
                <p className="font-medium text-gray-900">{booking.scheduled_time}</p>
              </div>
              {booking.service_address && (
                <div className="col-span-2">
                  <p className="text-gray-500">Service Address</p>
                  <p className="font-medium text-gray-900">{booking.service_address}</p>
                </div>
              )}
              {booking.customer_notes && (
                <div className="col-span-2">
                  <p className="text-gray-500">Customer Notes</p>
                  <p className="font-medium text-gray-900">{booking.customer_notes}</p>
                </div>
              )}
              {booking.vendor_notes && (
                <div className="col-span-2">
                  <p className="text-gray-500">Vendor Notes</p>
                  <p className="font-medium text-gray-900">{booking.vendor_notes}</p>
                </div>
              )}
              {booking.cancellation_reason && (
                <div className="col-span-2">
                  <p className="text-gray-500">
                    Cancellation Reason
                    {booking.cancelled_by && ` (by ${booking.cancelled_by})`}
                  </p>
                  <p className="font-medium text-red-700">{booking.cancellation_reason}</p>
                </div>
              )}
            </div>
          </div>

          {/* Service items */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-900">Service Items</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Variant
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Qty
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {booking.items && booking.items.length > 0 ? (
                    booking.items.map((item, idx) => (
                      <tr key={item.id ?? idx} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-gray-900 font-medium">
                          {item.service_name}
                        </td>
                        <td className="px-6 py-3 text-gray-600">
                          {item.variant_name || "-"}
                        </td>
                        <td className="px-6 py-3 text-right text-gray-900">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-3 text-right text-gray-900">
                          ₹{Number(item.unit_price).toLocaleString("en-IN")}
                        </td>
                        <td className="px-6 py-3 text-right font-medium text-gray-900">
                          ₹{Number(item.total_price).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No service items
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right column - customer, vendor, price */}
        <div className="space-y-6">
          {/* Customer info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Customer
            </h3>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-gray-900">{booking.customer_name || "-"}</p>
              {booking.customer_phone && (
                <p className="text-gray-600">{booking.customer_phone}</p>
              )}
              {booking.customer_email && (
                <p className="text-gray-600">{booking.customer_email}</p>
              )}
            </div>
          </div>

          {/* Vendor info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Vendor / Business
            </h3>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-gray-900">{booking.business_name || "-"}</p>
              {booking.vendor_name && (
                <p className="text-gray-600">{booking.vendor_name}</p>
              )}
              {booking.vendor_phone && (
                <p className="text-gray-600">{booking.vendor_phone}</p>
              )}
            </div>
          </div>

          {/* Price breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Price Breakdown
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">
                  ₹{Number(booking.subtotal).toLocaleString("en-IN")}
                </span>
              </div>
              {booking.discount_amount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount</span>
                  <span className="text-green-600">
                    -₹{Number(booking.discount_amount).toLocaleString("en-IN")}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="text-gray-900">
                  ₹{Number(booking.tax_amount).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-200 font-semibold">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">
                  ₹{Number(booking.total_amount).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-200">
                <span className="text-gray-600">
                  Commission ({booking.commission_rate}%)
                </span>
                <span className="text-gray-900">
                  ₹{Number(booking.commission_amount).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-primary-700">
                <span>Vendor Payout</span>
                <span>
                  ₹{Number(booking.vendor_payout_amount).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Timeline
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Created</span>
                <span className="text-gray-900">{booking.created_at}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Updated</span>
                <span className="text-gray-900">{booking.updated_at}</span>
              </div>
              {booking.started_at && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Started</span>
                  <span className="text-gray-900">{booking.started_at}</span>
                </div>
              )}
              {booking.completed_at && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed</span>
                  <span className="text-gray-900">{booking.completed_at}</span>
                </div>
              )}
              {booking.cancelled_at && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Cancelled</span>
                  <span className="text-red-600">{booking.cancelled_at}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
