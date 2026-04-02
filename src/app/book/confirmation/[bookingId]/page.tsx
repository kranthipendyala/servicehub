"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { Booking } from "@/types";
import { getBookingDetail } from "@/lib/booking-api";

export default function BookingConfirmationPage() {
  const params = useParams();
  const bookingId = Number(params.bookingId);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) return;
    getBookingDetail(bookingId)
      .then((res) => {
        if (res.success) setBooking(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="animate-spin h-12 w-12 border-4 border-[#0d9488] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full">
        {/* Celebration card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Green gradient header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-10 text-center relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3" />

            {/* Animated check */}
            <div className="relative mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center mb-5 shadow-lg animate-[bounceIn_0.6s_ease-out]">
              <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-white mb-2">Booking Confirmed!</h1>
            <p className="text-green-100 text-lg">Your service has been booked successfully</p>
          </div>

          {/* Booking details */}
          <div className="px-8 py-8">
            {booking && (
              <>
                {/* Booking number highlight */}
                <div className="text-center mb-6">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Booking Number</p>
                  <p className="text-2xl font-bold text-[#0d9488] tracking-wide">{booking.booking_number}</p>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 text-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-500 mb-0.5">Date</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {new Date(booking.scheduled_date + "T00:00:00").toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 text-center">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-500 mb-0.5">Time</p>
                    <p className="text-sm font-semibold text-gray-800">{booking.scheduled_time}</p>
                  </div>
                </div>

                {/* Business */}
                {booking.business_name && (
                  <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4 mb-4">
                    <div className="w-12 h-12 bg-[#0d9488] rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {booking.business_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Service Provider</p>
                      <p className="font-semibold text-gray-900">{booking.business_name}</p>
                    </div>
                  </div>
                )}

                {/* Services */}
                {booking.items && booking.items.length > 0 && (
                  <div className="border rounded-xl p-4 mb-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Services Booked</p>
                    <div className="space-y-2">
                      {booking.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold">
                              {item.quantity}
                            </span>
                            <span className="text-gray-700">
                              {item.service_name}
                              {item.variant_name ? <span className="text-gray-400"> ({item.variant_name})</span> : ""}
                            </span>
                          </div>
                          <span className="font-semibold text-gray-900">&#8377;{item.total_price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Total */}
                <div className="bg-gradient-to-r from-[#0d9488] to-[#0d9488] rounded-xl p-5 text-center mb-6">
                  <p className="text-blue-200 text-sm mb-1">Total Amount</p>
                  <p className="text-3xl font-bold text-white">&#8377;{Number(booking.total_amount).toFixed(2)}</p>
                  <div className="mt-2 inline-block px-3 py-1 bg-white/20 rounded-full">
                    <span className="text-xs text-green-200 font-medium">
                      {booking.payment_status === "paid" ? "Paid" : "Payment Pending"}
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Action buttons */}
            <div className="flex flex-col gap-3">
              <Link
                href="/my-bookings"
                className="block w-full py-3.5 bg-[#f97316] text-white rounded-xl font-semibold hover:bg-[#ea580c] transition-all hover:shadow-lg hover:shadow-orange-200 text-center"
              >
                View My Bookings
              </Link>
              <Link
                href="/"
                className="block w-full py-3.5 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all text-center"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>

        {/* Help text */}
        <p className="text-center text-gray-400 text-sm mt-6">
          You will receive a notification when the vendor confirms your booking.
        </p>
      </div>

      <style jsx>{`
        @keyframes bounceIn {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
