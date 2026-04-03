"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/admin/Toast";
import {
  getVendorBooking,
  acceptBooking,
  rejectBooking,
  startBooking,
  completeBooking,
} from "@/lib/vendor-api";
import type { Booking } from "@/types";

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  assigned: "bg-indigo-100 text-indigo-700",
  in_progress: "bg-primary-100 text-primary-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  refunded: "bg-gray-100 text-gray-700",
};

export default function VendorBookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [vendorNotes, setVendorNotes] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  const fetchBooking = async () => {
    try {
      const res = await getVendorBooking(id);
      setBooking(res.data);
      setVendorNotes(res.data.vendor_notes || "");
    } catch {
      toast("Failed to load booking", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const handleAction = async (
    action: "accept" | "reject" | "start" | "complete"
  ) => {
    if (!booking) return;
    setActionLoading(true);
    try {
      switch (action) {
        case "accept":
          await acceptBooking(booking.id);
          toast("Booking accepted", "success");
          break;
        case "reject":
          await rejectBooking(booking.id, rejectReason || undefined);
          toast("Booking rejected", "success");
          setShowRejectModal(false);
          break;
        case "start":
          await startBooking(booking.id);
          toast("Job started", "success");
          break;
        case "complete":
          await completeBooking(booking.id, vendorNotes || undefined);
          toast("Job completed", "success");
          break;
      }
      fetchBooking();
    } catch (err) {
      toast(`Failed to ${action} booking`, "error");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <p className="text-gray-400 text-sm">Booking not found</p>
        <Link
          href="/vendor/bookings"
          className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2 inline-block"
        >
          Back to bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/vendor/bookings"
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back to Bookings
          </Link>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-900">
              Booking #{booking.booking_number}
            </h2>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                STATUS_BADGE[booking.status] || "bg-gray-100 text-gray-700"
              }`}
            >
              {booking.status.replace("_", " ")}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {booking.status === "pending" && (
            <>
              <button
                onClick={() => handleAction("accept")}
                disabled={actionLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50"
              >
                Accept Booking
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={actionLoading}
                className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Reject
              </button>
            </>
          )}
          {booking.status === "confirmed" && (
            <button
              onClick={() => handleAction("start")}
              disabled={actionLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            >
              Start Job
            </button>
          )}
          {booking.status === "in_progress" && (
            <button
              onClick={() => handleAction("complete")}
              disabled={actionLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
            >
              Mark Complete
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Items */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">
                Service Items
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {booking.items && booking.items.length > 0 ? (
                booking.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="px-6 py-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {item.service_name}
                      </p>
                      {item.variant_name && (
                        <p className="text-xs text-gray-500">
                          Variant: {item.variant_name}
                        </p>
                      )}
                      <p className="text-xs text-gray-400">
                        Qty: {item.quantity} x Rs.{" "}
                        {item.unit_price?.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      Rs. {item.total_price?.toLocaleString("en-IN")}
                    </p>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center text-sm text-gray-400">
                  No items
                </div>
              )}
            </div>
            {/* Totals */}
            <div className="border-t border-gray-200 px-6 py-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900">
                  Rs. {booking.subtotal?.toLocaleString("en-IN")}
                </span>
              </div>
              {booking.discount_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Discount</span>
                  <span className="text-green-600">
                    - Rs. {booking.discount_amount?.toLocaleString("en-IN")}
                  </span>
                </div>
              )}
              {booking.tax_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax</span>
                  <span className="text-gray-900">
                    Rs. {booking.tax_amount?.toLocaleString("en-IN")}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold border-t border-gray-100 pt-2">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">
                  Rs. {booking.total_amount?.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-sm text-primary-600 font-medium">
                <span>Your Payout</span>
                <span>
                  Rs. {booking.vendor_payout_amount?.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* Vendor Notes */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">
                Vendor Notes
              </h3>
            </div>
            <div className="p-6">
              <textarea
                value={vendorNotes}
                onChange={(e) => setVendorNotes(e.target.value)}
                rows={3}
                placeholder="Add notes about this booking..."
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all resize-none"
              />
              {booking.customer_notes && (
                <div className="mt-4 p-3 bg-amber-50 rounded-lg">
                  <p className="text-xs font-medium text-amber-700 mb-1">
                    Customer Notes:
                  </p>
                  <p className="text-sm text-amber-800">
                    {booking.customer_notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">
                Customer Details
              </h3>
            </div>
            <div className="p-6 space-y-3">
              <div>
                <p className="text-xs text-gray-500">Name</p>
                <p className="text-sm font-medium text-gray-900">
                  {booking.customer_name || "N/A"}
                </p>
              </div>
              {booking.customer_phone && (
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-medium text-gray-900">
                    {booking.customer_phone}
                  </p>
                </div>
              )}
              {booking.customer_email && (
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">
                    {booking.customer_email}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Schedule</h3>
            </div>
            <div className="p-6 space-y-3">
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="text-sm font-medium text-gray-900">
                  {booking.scheduled_date}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Time</p>
                <p className="text-sm font-medium text-gray-900">
                  {booking.scheduled_time}
                </p>
              </div>
              {booking.started_at && (
                <div>
                  <p className="text-xs text-gray-500">Started At</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(booking.started_at).toLocaleString()}
                  </p>
                </div>
              )}
              {booking.completed_at && (
                <div>
                  <p className="text-xs text-gray-500">Completed At</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(booking.completed_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">
                Service Address
              </h3>
            </div>
            <div className="p-6">
              {booking.address ? (
                <div className="text-sm text-gray-700 space-y-1">
                  {booking.address.full_name && (
                    <p className="font-medium">{booking.address.full_name}</p>
                  )}
                  <p>{booking.address.address_line1}</p>
                  {booking.address.address_line2 && (
                    <p>{booking.address.address_line2}</p>
                  )}
                  <p>
                    {[
                      booking.address.locality_name,
                      booking.address.city_name,
                      booking.address.state_name,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  {booking.address.pin_code && (
                    <p>PIN: {booking.address.pin_code}</p>
                  )}
                  {booking.address.phone && (
                    <p className="text-gray-500">
                      Phone: {booking.address.phone}
                    </p>
                  )}
                </div>
              ) : booking.service_address ? (
                <p className="text-sm text-gray-700">
                  {booking.service_address}
                </p>
              ) : (
                <p className="text-sm text-gray-400">No address provided</p>
              )}
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Payment</h3>
            </div>
            <div className="p-6 space-y-3">
              <div>
                <p className="text-xs text-gray-500">Payment Status</p>
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {booking.payment_status?.replace("_", " ")}
                </p>
              </div>
              {booking.payment_method && (
                <div>
                  <p className="text-xs text-gray-500">Method</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {booking.payment_method}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500">Commission</p>
                <p className="text-sm font-medium text-gray-900">
                  {booking.commission_rate}% (Rs.{" "}
                  {booking.commission_amount?.toLocaleString("en-IN")})
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Reject Booking
            </h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Reason for rejection (optional)"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all resize-none mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction("reject")}
                disabled={actionLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              >
                Reject Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
