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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-[3px] border-accent-200 rounded-full" />
            <div className="absolute inset-0 w-12 h-12 border-[3px] border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-sm text-primary-700/50 font-medium">Loading confirmation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="flex items-center justify-center min-h-screen px-4 py-12">
        <div className="max-w-lg w-full">
          {/* Main confirmation card */}
          <div className="bg-white rounded-card border border-surface-200 overflow-hidden">

            {/* Success header */}
            <div className="px-8 pt-10 pb-8 text-center">
              {/* Check icon */}
              <div className="relative mx-auto w-20 h-20 mb-6 animate-[bounceIn_0.6s_ease-out]">
                <div className="w-20 h-20 bg-primary-600 text-white rounded-card flex items-center justify-center shadow-lg">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                      className="animate-[drawCheck_0.5s_0.3s_ease-out_both]"
                    />
                  </svg>
                </div>
              </div>

              <h1 className="text-2xl font-heading font-medium text-primary-700 mb-2">Booking Confirmed!</h1>
              <p className="text-primary-700/50 text-sm">Your service has been booked successfully. We&apos;ll notify you once the provider confirms.</p>
            </div>

            {booking && (
              <div className="px-8 pb-8 space-y-4">
                {/* Booking number */}
                <div className="text-center py-4 bg-accent-100 rounded-card">
                  <p className="text-xs font-semibold text-primary-700/50 uppercase tracking-widest mb-1.5">Booking Number</p>
                  <p className="text-2xl font-heading font-medium text-primary-600 tracking-wide">
                    {booking.booking_number}
                  </p>
                </div>

                {/* Info grid: Date + Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-card border border-surface-200 p-4 text-center">
                    <div className="w-10 h-10 bg-accent-100 rounded-card flex items-center justify-center mx-auto mb-2.5">
                      <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                    </div>
                    <p className="text-[11px] font-semibold text-primary-700/40 uppercase tracking-wider mb-0.5">Date</p>
                    <p className="text-sm font-semibold text-primary-700">
                      {new Date(booking.scheduled_date + "T00:00:00").toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <div className="bg-white rounded-card border border-surface-200 p-4 text-center">
                    <div className="w-10 h-10 bg-accent-100 rounded-card flex items-center justify-center mx-auto mb-2.5">
                      <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-[11px] font-semibold text-primary-700/40 uppercase tracking-wider mb-0.5">Time</p>
                    <p className="text-sm font-semibold text-primary-700">{booking.scheduled_time}</p>
                  </div>
                </div>

                {/* Business info */}
                {booking.business_name && (
                  <div className="bg-white rounded-card border border-surface-200 p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-600 rounded-card flex items-center justify-center text-white font-heading font-medium text-lg flex-shrink-0">
                      {booking.business_name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-primary-700/40 uppercase tracking-wider">Service Provider</p>
                      <p className="font-semibold text-primary-700 truncate">{booking.business_name}</p>
                    </div>
                  </div>
                )}

                {/* Services list */}
                {booking.items && booking.items.length > 0 && (
                  <div className="bg-white rounded-card border border-surface-200 p-5">
                    <p className="text-[11px] font-semibold text-primary-700/40 uppercase tracking-widest mb-4">Services Booked</p>
                    <div className="space-y-3">
                      {booking.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-7 h-7 bg-accent-100 text-primary-600 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {item.quantity}
                            </span>
                            <span className="text-sm text-primary-700/70 truncate">
                              {item.service_name}
                              {item.variant_name ? <span className="text-primary-700/40 ml-1">({item.variant_name})</span> : ""}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-primary-700 flex-shrink-0 ml-3">&#8377;{item.total_price}</span>
                        </div>
                      ))}
                    </div>
                    {booking.items.length > 1 && (
                      <div className="mt-3 pt-3 border-t border-surface-100" />
                    )}
                  </div>
                )}

                {/* Total amount - dark green card */}
                <div className="bg-primary-800 rounded-card p-5 text-center">
                  <p className="text-white/60 text-sm mb-1">Total Amount</p>
                  <p className="text-3xl font-heading font-medium text-white tracking-tight">&#8377;{Number(booking.total_amount).toFixed(2)}</p>
                  <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 rounded-full">
                    <div className={`w-2 h-2 rounded-full ${booking.payment_status === "paid" ? "bg-green-400" : "bg-amber-400"} animate-pulse`} />
                    <span className="text-xs text-white/80 font-medium">
                      {booking.payment_status === "paid" ? "Payment Successful" : "Payment Pending"}
                    </span>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col gap-3 pt-1">
                  <Link
                    href="/my-bookings"
                    className="btn-primary block w-full text-center min-h-[48px] flex items-center justify-center"
                  >
                    View My Bookings
                  </Link>
                  <Link
                    href="/"
                    className="btn-secondary block w-full text-center min-h-[48px] flex items-center justify-center"
                  >
                    Back to Home
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Help text below card */}
          <p className="text-center text-primary-700/40 text-sm mt-6 px-4">
            You will receive a notification when the vendor confirms your booking. Need help?{" "}
            <Link href="/contact" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
              Contact Support
            </Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounceIn {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.08); }
          70% { transform: scale(0.95); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes drawCheck {
          0% { stroke-dasharray: 40; stroke-dashoffset: 40; }
          100% { stroke-dasharray: 40; stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}
