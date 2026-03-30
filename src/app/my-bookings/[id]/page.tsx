"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import type { Booking, BookingStatus } from "@/types";
import { useAuth } from "@/components/auth/AuthProvider";
import { getBookingDetail, cancelBooking } from "@/lib/booking-api";
import BookingStatusBadge from "@/components/booking/BookingStatusBadge";

/* ------------------------------------------------------------------ */
/*  Status timeline configuration                                       */
/* ------------------------------------------------------------------ */

const TIMELINE_STEPS: { status: BookingStatus; label: string }[] = [
  { status: "pending", label: "Pending" },
  { status: "confirmed", label: "Confirmed" },
  { status: "in_progress", label: "In Progress" },
  { status: "completed", label: "Completed" },
];

function getTimelineIndex(status: BookingStatus): number {
  if (status === "cancelled" || status === "refunded") return -1;
  const idx = TIMELINE_STEPS.findIndex((s) => s.status === status);
  return idx >= 0 ? idx : 0;
}

/* ================================================================== */
/*  Page component                                                      */
/* ================================================================== */

export default function BookingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = Number(params.id);

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");

  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      router.push(`/login?redirect=/my-bookings/${bookingId}`);
    }
  }, [user, bookingId, router]);

  useEffect(() => {
    if (!bookingId) return;
    setLoading(true);
    getBookingDetail(bookingId)
      .then((res) => {
        if (res.success) setBooking(res.data);
      })
      .catch(() => setError("Failed to load booking details."))
      .finally(() => setLoading(false));
  }, [bookingId]);

  const handleCancel = async () => {
    if (!cancelReason.trim()) return;
    setCancelling(true);
    try {
      const res = await cancelBooking(bookingId, cancelReason);
      if (res.success) {
        setBooking(res.data);
        setShowCancelModal(false);
        setCancelReason("");
      } else {
        setError(res.message || "Failed to cancel booking.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to cancel booking.");
    } finally {
      setCancelling(false);
    }
  };

  const canCancel =
    booking &&
    (booking.status === "pending" || booking.status === "confirmed");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-[#003366] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Booking not found.</p>
          <Link
            href="/my-bookings"
            className="text-[#FF6600] hover:underline text-sm mt-2 inline-block"
          >
            Back to My Bookings
          </Link>
        </div>
      </div>
    );
  }

  const timelineIdx = getTimelineIndex(booking.status);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#003366] text-white py-6">
        <div className="max-w-3xl mx-auto px-4">
          <Link
            href="/my-bookings"
            className="text-blue-200 hover:text-white text-sm mb-2 inline-flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            My Bookings
          </Link>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-2xl font-bold">
              {booking.booking_number}
            </h1>
            <BookingStatusBadge status={booking.status} />
          </div>
          {booking.business_name && (
            <p className="text-blue-200 mt-1">{booking.business_name}</p>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Status Timeline */}
        {booking.status !== "cancelled" && booking.status !== "refunded" && (
          <div className="bg-white rounded-lg border p-6">
            <h2 className="font-semibold text-gray-900 mb-4">
              Booking Status
            </h2>
            <div className="flex items-center">
              {TIMELINE_STEPS.map((ts, i) => (
                <div key={ts.status} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                        i <= timelineIdx
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      {i <= timelineIdx ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        i + 1
                      )}
                    </div>
                    <span
                      className={`text-xs mt-1 ${
                        i <= timelineIdx
                          ? "text-green-700 font-medium"
                          : "text-gray-400"
                      }`}
                    >
                      {ts.label}
                    </span>
                  </div>
                  {i < TIMELINE_STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 ${
                        i < timelineIdx ? "bg-green-500" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cancelled notice */}
        {(booking.status === "cancelled" || booking.status === "refunded") && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="font-medium text-red-800">
              This booking was{" "}
              {booking.status === "cancelled" ? "cancelled" : "refunded"}.
            </p>
            {booking.cancellation_reason && (
              <p className="text-sm text-red-600 mt-1">
                Reason: {booking.cancellation_reason}
              </p>
            )}
          </div>
        )}

        {/* Service Items */}
        <div className="bg-white rounded-lg border p-4">
          <h2 className="font-semibold text-gray-900 mb-3">
            Service Items
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2 font-medium">Service</th>
                  <th className="pb-2 font-medium text-center">Qty</th>
                  <th className="pb-2 font-medium text-right">Price</th>
                  <th className="pb-2 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {booking.items && booking.items.length > 0 ? (
                  booking.items.map((item, idx) => (
                    <tr key={idx} className="border-b last:border-0">
                      <td className="py-2 text-gray-800">
                        {item.service_name}
                        {item.variant_name && (
                          <span className="text-gray-400 text-xs block">
                            {item.variant_name}
                          </span>
                        )}
                      </td>
                      <td className="py-2 text-center text-gray-600">
                        {item.quantity}
                      </td>
                      <td className="py-2 text-right text-gray-600">
                        ₹{item.unit_price}
                      </td>
                      <td className="py-2 text-right font-medium text-gray-900">
                        ₹{item.total_price}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-3 text-gray-400 text-center">
                      No items
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-white rounded-lg border p-4">
          <h2 className="font-semibold text-gray-900 mb-2">Schedule</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Date</p>
              <p className="font-medium text-gray-900">
                {new Date(booking.scheduled_date + "T00:00:00").toLocaleDateString(
                  "en-IN",
                  {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Time</p>
              <p className="font-medium text-gray-900">
                {booking.scheduled_time}
              </p>
            </div>
          </div>
        </div>

        {/* Address */}
        {booking.address && (
          <div className="bg-white rounded-lg border p-4">
            <h2 className="font-semibold text-gray-900 mb-2">
              Service Address
            </h2>
            <div className="text-sm text-gray-700">
              <p className="font-medium">{booking.address.label}</p>
              <p>
                {booking.address.address_line1}
                {booking.address.address_line2
                  ? `, ${booking.address.address_line2}`
                  : ""}
              </p>
              <p>
                {booking.address.city_name} - {booking.address.pin_code}
              </p>
            </div>
          </div>
        )}

        {booking.service_address && !booking.address && (
          <div className="bg-white rounded-lg border p-4">
            <h2 className="font-semibold text-gray-900 mb-2">
              Service Address
            </h2>
            <p className="text-sm text-gray-700">{booking.service_address}</p>
          </div>
        )}

        {/* Price Breakdown */}
        <div className="bg-white rounded-lg border p-4">
          <h2 className="font-semibold text-gray-900 mb-3">
            Price Breakdown
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{booking.subtotal.toFixed(2)}</span>
            </div>
            {booking.discount_amount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-₹{booking.discount_amount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Tax (GST)</span>
              <span>₹{booking.tax_amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 text-base border-t pt-2">
              <span>Total</span>
              <span>₹{booking.total_amount.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Status */}
          <div className="mt-3 pt-3 border-t">
            {booking.payment_status === "paid" ? (
              <div className="flex items-center gap-2 text-green-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="text-sm font-bold">Payment Confirmed</span>
              </div>
            ) : booking.payment_method === "cod" && booking.status === "completed" ? (
              <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200">
                <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75" /></svg>
                <span className="text-sm font-semibold text-amber-700">Please pay Rs.{booking.total_amount} to the service provider (Cash/UPI)</span>
              </div>
            ) : booking.payment_method === "cod" ? (
              <div className="flex items-center gap-2 text-gray-500">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75" /></svg>
                <span className="text-sm">Pay After Service</span>
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                Payment: <span className={`font-semibold ${booking.payment_status === "failed" ? "text-red-600" : "text-yellow-600"}`}>
                  {(booking.payment_status || "pending").replace("_", " ").toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Customer Notes */}
        {booking.customer_notes && (
          <div className="bg-white rounded-lg border p-4">
            <h2 className="font-semibold text-gray-900 mb-2">Your Notes</h2>
            <p className="text-sm text-gray-700">{booking.customer_notes}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 pt-4">
          {/* Chat with vendor */}
          {booking.status !== "cancelled" && booking.status !== "refunded" && (
            <Link
              href={`/my-bookings/${bookingId}/chat`}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-all shadow-sm hover:shadow-md"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Chat with Vendor
            </Link>
          )}

          {/* Cancel booking */}
          {canCancel && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="inline-flex items-center gap-2 px-6 py-2.5 border border-red-300 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel Booking
            </button>
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Cancel Booking
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Please provide a reason for cancellation. This action cannot be
              undone.
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              placeholder="Reason for cancellation..."
              className="w-full border rounded-lg px-3 py-2 text-sm resize-none mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                }}
                className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancel}
                disabled={!cancelReason.trim() || cancelling}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {cancelling ? "Cancelling..." : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
