"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import type { Booking, BookingStatus } from "@/types";
import { useAuth } from "@/components/auth/AuthProvider";
import { getBookingDetail, cancelBooking, submitBookingReview } from "@/lib/booking-api";
import BookingStatusBadge from "@/components/booking/BookingStatusBadge";
import { usePolling } from "@/hooks/usePolling";

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

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      router.push(`/login?redirect=/my-bookings/${bookingId}`);
    }
  }, [user, bookingId, router]);

  const refreshBooking = useCallback(async () => {
    if (!bookingId) return;
    try {
      const res = await getBookingDetail(bookingId);
      if (res.success) setBooking(res.data);
    } catch {}
  }, [bookingId]);

  usePolling(refreshBooking, 10000, !!booking && booking.status !== "completed" && booking.status !== "cancelled");

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

  const canCancel = booking && (booking.status === "pending" || booking.status === "confirmed");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin h-10 w-10 border-[3px] border-primary-600 border-t-transparent rounded-full" />
          <p className="text-sm text-surface-400">Loading booking...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-accent-200 rounded-card flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          </div>
          <p className="text-surface-700 text-lg font-heading font-bold">Booking not found</p>
          <Link href="/my-bookings" className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 text-sm font-semibold mt-2 transition-colors duration-200 ease-advia">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to My Bookings
          </Link>
        </div>
      </div>
    );
  }

  const timelineIdx = getTimelineIndex(booking.status);

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Header */}
      <div className="bg-primary-800 text-white py-6 md:py-8">
        <div className="max-w-3xl mx-auto px-4">
          <Link href="/my-bookings" className="inline-flex items-center gap-1 text-primary-200 hover:text-white text-sm mb-2 transition-colors duration-200 ease-advia">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            My Bookings
          </Link>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-2xl font-heading font-bold">{booking.booking_number}</h1>
            <BookingStatusBadge status={booking.status} />
          </div>
          {booking.business_name && (
            <p className="text-primary-200 mt-1">{booking.business_name}</p>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-card text-sm font-medium flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
            {error}
          </div>
        )}

        {/* Status Timeline */}
        {booking.status !== "cancelled" && booking.status !== "refunded" && (
          <div className="bg-white rounded-card p-6 border border-surface-200">
            <h2 className="font-heading font-medium text-primary-700 mb-5">Booking Status</h2>
            <div className="flex items-center">
              {TIMELINE_STEPS.map((ts, i) => (
                <div key={ts.status} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ease-advia ${
                      i <= timelineIdx
                        ? "bg-primary-600 text-white"
                        : "bg-accent-200 text-surface-400"
                    }`}>
                      {i <= timelineIdx ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      ) : (
                        i + 1
                      )}
                    </div>
                    <span className={`text-xs mt-1.5 font-semibold ${i <= timelineIdx ? "text-primary-700" : "text-surface-400"}`}>
                      {ts.label}
                    </span>
                  </div>
                  {i < TIMELINE_STEPS.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 rounded-full transition-all duration-200 ease-advia ${
                      i < timelineIdx ? "bg-primary-600" : "bg-accent-200"
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cancelled notice */}
        {(booking.status === "cancelled" || booking.status === "refunded") && (
          <div className="bg-red-50 border border-red-200 rounded-card p-5">
            <p className="font-semibold text-red-800">
              This booking was {booking.status === "cancelled" ? "cancelled" : "refunded"}.
            </p>
            {booking.cancellation_reason && (
              <p className="text-sm text-red-600 mt-1">Reason: {booking.cancellation_reason}</p>
            )}
          </div>
        )}

        {/* Service Items */}
        <div className="bg-white rounded-card p-5 border border-surface-200">
          <h2 className="font-heading font-medium text-primary-700 mb-3">Service Items</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-200 text-left">
                  <th className="pb-2 font-semibold text-surface-500 text-xs uppercase tracking-wider">Service</th>
                  <th className="pb-2 font-semibold text-surface-500 text-xs uppercase tracking-wider text-center">Qty</th>
                  <th className="pb-2 font-semibold text-surface-500 text-xs uppercase tracking-wider text-right">Price</th>
                  <th className="pb-2 font-semibold text-surface-500 text-xs uppercase tracking-wider text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {booking.items && booking.items.length > 0 ? (
                  booking.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-surface-100 last:border-0">
                      <td className="py-3 text-surface-800">
                        {item.service_name}
                        {item.variant_name && <span className="text-surface-400 text-xs block">{item.variant_name}</span>}
                      </td>
                      <td className="py-3 text-center text-surface-600">{item.quantity}</td>
                      <td className="py-3 text-right text-surface-600">&#8377;{item.unit_price}</td>
                      <td className="py-3 text-right font-semibold text-surface-900">&#8377;{item.total_price}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={4} className="py-3 text-surface-400 text-center">No items</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-white rounded-card p-5 border border-surface-200">
          <h2 className="font-heading font-medium text-primary-700 mb-3">Schedule</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-surface-400 text-xs font-semibold uppercase tracking-wider">Date</p>
              <p className="font-semibold text-surface-900 mt-0.5">
                {new Date(booking.scheduled_date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
            <div>
              <p className="text-surface-400 text-xs font-semibold uppercase tracking-wider">Time</p>
              <p className="font-semibold text-surface-900 mt-0.5">{booking.scheduled_time}</p>
            </div>
          </div>
        </div>

        {/* Address */}
        {booking.address && (
          <div className="bg-white rounded-card p-5 border border-surface-200">
            <h2 className="font-heading font-medium text-primary-700 mb-3">Service Address</h2>
            <div className="text-sm text-surface-700">
              <p className="font-semibold">{booking.address.label}</p>
              <p>{booking.address.address_line1}{booking.address.address_line2 ? `, ${booking.address.address_line2}` : ""}</p>
              <p className="text-surface-500">{booking.address.city_name} - {booking.address.pin_code}</p>
            </div>
          </div>
        )}

        {booking.service_address && !booking.address && (
          <div className="bg-white rounded-card p-5 border border-surface-200">
            <h2 className="font-heading font-medium text-primary-700 mb-3">Service Address</h2>
            <p className="text-sm text-surface-700">{booking.service_address}</p>
          </div>
        )}

        {/* Price Breakdown */}
        <div className="bg-white rounded-card p-5 border border-surface-200">
          <h2 className="font-heading font-medium text-primary-700 mb-3">Price Breakdown</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-surface-500">
              <span>Subtotal</span>
              <span>&#8377;{Number(booking.subtotal).toFixed(2)}</span>
            </div>
            {Number(booking.discount_amount) > 0 && (
              <div className="flex justify-between text-primary-600">
                <span>Discount</span>
                <span>-&#8377;{Number(booking.discount_amount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-surface-500">
              <span>Tax (GST)</span>
              <span>&#8377;{Number(booking.tax_amount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-surface-900 text-lg border-t border-surface-200 pt-3 mt-3">
              <span>Total</span>
              <span className="text-primary-600">&#8377;{Number(booking.total_amount).toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Status */}
          <div className="mt-4 pt-4 border-t border-surface-200">
            {booking.payment_status === "paid" ? (
              <div className="flex items-center gap-2 text-primary-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="text-sm font-bold">Payment Confirmed</span>
              </div>
            ) : booking.payment_method === "cod" && booking.status === "completed" ? (
              <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-card border border-amber-200">
                <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75" /></svg>
                <span className="text-sm font-semibold text-amber-700">Please pay &#8377;{booking.total_amount} to the service provider (Cash/UPI)</span>
              </div>
            ) : booking.payment_method === "cod" ? (
              <div className="flex items-center gap-2 text-surface-500">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75" /></svg>
                <span className="text-sm">Pay After Service</span>
              </div>
            ) : (
              <div className="text-sm text-surface-500">
                Payment: <span className={`font-semibold ${booking.payment_status === "failed" ? "text-red-600" : "text-amber-600"}`}>
                  {(booking.payment_status || "pending").replace("_", " ").toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Customer Notes */}
        {booking.customer_notes && (
          <div className="bg-white rounded-card p-5 border border-surface-200">
            <h2 className="font-heading font-medium text-primary-700 mb-2">Your Notes</h2>
            <p className="text-sm text-surface-700">{booking.customer_notes}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {booking.status !== "cancelled" && booking.status !== "refunded" && (
            <Link
              href={`/my-bookings/${bookingId}/chat`}
              className="btn-primary inline-flex items-center justify-center gap-2 flex-1 sm:flex-none"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Chat with Vendor
            </Link>
          )}

          {canCancel && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="btn-outline inline-flex items-center justify-center gap-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 flex-1 sm:flex-none"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              Cancel Booking
            </button>
          )}
        </div>

        {/* Write Review */}
        {booking.status === "completed" && !reviewSubmitted && (
          <div className="bg-white rounded-card p-6 border border-surface-200">
            <h2 className="font-heading font-medium text-primary-700 mb-1">Rate Your Experience</h2>
            <p className="text-sm text-surface-500 mb-4">How was the service? Your review helps other customers.</p>

            <div className="flex items-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  onMouseEnter={() => setReviewHover(star)}
                  onMouseLeave={() => setReviewHover(0)}
                  className="p-0.5 transition-transform duration-200 ease-advia hover:scale-110"
                >
                  <svg
                    className={`w-8 h-8 transition-colors duration-200 ease-advia ${star <= (reviewHover || reviewRating) ? "text-amber-400" : "text-surface-200"}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
              {reviewRating > 0 && (
                <span className="ml-2 text-sm font-semibold text-surface-600">
                  {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][reviewRating]}
                </span>
              )}
            </div>

            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              rows={3}
              placeholder="Tell us about your experience (optional)..."
              className="w-full border border-surface-200 rounded-card px-4 py-3 text-sm resize-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 ease-advia mb-4"
            />

            <button
              onClick={async () => {
                if (!reviewRating) { setError("Please select a rating"); return; }
                setSubmittingReview(true);
                try {
                  await submitBookingReview(bookingId, { rating: reviewRating, comment: reviewComment });
                  setReviewSubmitted(true);
                } catch (err: any) {
                  setError(err.message || "Failed to submit review");
                } finally { setSubmittingReview(false); }
              }}
              disabled={!reviewRating || submittingReview}
              className="btn-primary inline-flex items-center gap-2 disabled:opacity-50"
            >
              {submittingReview && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {submittingReview ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        )}

        {reviewSubmitted && (
          <div className="bg-accent-200 border border-primary-200 rounded-card p-5 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-primary-600 rounded-card flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
            </div>
            <h3 className="font-heading font-bold text-primary-800 mb-1">Thank you for your review!</h3>
            <p className="text-sm text-primary-600">Your feedback helps improve services for everyone.</p>
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-card shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-heading font-bold text-surface-900 mb-2">Cancel Booking</h3>
            <p className="text-sm text-surface-500 mb-4">Please provide a reason for cancellation. This action cannot be undone.</p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              placeholder="Reason for cancellation..."
              className="w-full border border-surface-200 rounded-card px-4 py-3 text-sm resize-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 mb-4 transition-all duration-200 ease-advia"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setShowCancelModal(false); setCancelReason(""); }}
                className="btn-outline text-sm"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancel}
                disabled={!cancelReason.trim() || cancelling}
                className="px-5 py-2.5 bg-red-600 text-white rounded-btn text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-all duration-200 ease-advia"
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
