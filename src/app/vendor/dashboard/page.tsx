"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/admin/Toast";
import {
  getVendorStats,
  getVendorBookings,
  acceptBooking,
  rejectBooking,
} from "@/lib/vendor-api";
import type { VendorStats, Booking } from "@/types";

export default function VendorDashboardPage() {
  const { toast } = useToast();
  const [stats, setStats] = useState<VendorStats | null>(null);
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const [statsRes, bookingsRes] = await Promise.all([
        getVendorStats(),
        getVendorBookings({ status: "pending", per_page: 5 }),
      ]);
      setStats(statsRes.data);
      setPendingBookings(bookingsRes.data.bookings || []);
    } catch (err) {
      toast("Failed to load dashboard data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAccept = async (id: number) => {
    setActionLoading(id);
    try {
      await acceptBooking(id);
      toast("Booking accepted", "success");
      fetchData();
    } catch (err) {
      toast("Failed to accept booking", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: number) => {
    setActionLoading(id);
    try {
      await rejectBooking(id);
      toast("Booking rejected", "success");
      fetchData();
    } catch (err) {
      toast("Failed to reject booking", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Bookings",
      value: stats?.total_bookings ?? 0,
      icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5",
      gradient: "from-blue-500 to-blue-600",
      shadowColor: "shadow-blue-500/20",
      lightBg: "bg-blue-500/10",
    },
    {
      label: "Pending",
      value: stats?.pending ?? 0,
      icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
      gradient: "from-amber-500 to-orange-500",
      shadowColor: "shadow-amber-500/20",
      lightBg: "bg-amber-500/10",
    },
    {
      label: "Today's Jobs",
      value: stats?.today ?? 0,
      icon: "M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3l1.5 1.5 3-3.75",
      gradient: "from-emerald-500 to-emerald-600",
      shadowColor: "shadow-emerald-500/20",
      lightBg: "bg-emerald-500/10",
    },
    {
      label: "Total Earnings",
      value: `Rs. ${(stats?.total_earnings ?? 0).toLocaleString("en-IN")}`,
      icon: "M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z",
      gradient: "from-purple-500 to-purple-600",
      shadowColor: "shadow-purple-500/20",
      lightBg: "bg-purple-500/10",
    },
  ];

  const quickActions = [
    {
      label: "Accept Booking",
      desc: "Review pending requests",
      href: "/vendor/bookings?status=pending",
      icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      hoverBg: "hover:bg-emerald-100",
    },
    {
      label: "Add Service",
      desc: "List a new service",
      href: "/vendor/services",
      icon: "M12 4.5v15m7.5-7.5h-15",
      color: "text-blue-600",
      bg: "bg-blue-50",
      hoverBg: "hover:bg-blue-100",
    },
    {
      label: "View Earnings",
      desc: "Track your revenue",
      href: "/vendor/earnings",
      icon: "M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z",
      color: "text-purple-600",
      bg: "bg-purple-50",
      hoverBg: "hover:bg-purple-100",
    },
    {
      label: "Set Availability",
      desc: "Update your hours",
      href: "/vendor/availability",
      icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
      color: "text-amber-600",
      bg: "bg-amber-50",
      hoverBg: "hover:bg-amber-100",
    },
  ];

  const totalEarnings = stats?.total_earnings ?? 0;
  const monthlyTarget = 50000;
  const earningsPercent = Math.min(Math.round((totalEarnings / monthlyTarget) * 100), 100);

  // Relative time helper
  const timeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative z-10">
          <p className="text-emerald-100 text-sm font-medium mb-1">{getGreeting()}!</p>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Here&apos;s your business overview</h1>
          <p className="text-emerald-100 text-sm">
            {stats?.pending ? `You have ${stats.pending} pending booking${stats.pending > 1 ? "s" : ""} to review` : "All caught up! No pending bookings right now."}
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden`}
          >
            <div className={`absolute top-0 right-0 w-20 h-20 ${card.lightBg} rounded-full -translate-y-1/2 translate-x-1/2`} />
            <div className="flex items-center gap-4 relative z-10">
              <div
                className={`bg-gradient-to-br ${card.gradient} w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${card.shadowColor}`}
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={card.icon}
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className={`flex flex-col items-center gap-2.5 p-4 rounded-xl ${action.bg} ${action.hoverBg} transition-all group`}
            >
              <div className={`w-11 h-11 rounded-xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <svg className={`w-5 h-5 ${action.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={action.icon} />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-900">{action.label}</p>
                <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">{action.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Bookings */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-semibold text-gray-900">
                Pending Bookings
              </h2>
              {pendingBookings.length > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold bg-amber-100 text-amber-700 rounded-full">
                  {pendingBookings.length}
                </span>
              )}
            </div>
            <Link
              href="/vendor/bookings?status=pending"
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {pendingBookings.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-50 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-500">No pending bookings</p>
                <p className="text-xs text-gray-400 mt-1">You&apos;re all caught up!</p>
              </div>
            ) : (
              pendingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Customer avatar placeholder */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-slate-600">
                        {(booking.customer_name || "C").charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {booking.customer_name || "Customer"}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-400">#{booking.booking_number}</span>
                        <span className="text-xs text-gray-300">|</span>
                        <span className="text-xs text-gray-400">
                          {booking.scheduled_date} at {booking.scheduled_time}
                        </span>
                        {booking.items && booking.items.length > 0 && (
                          <>
                            <span className="text-xs text-gray-300">|</span>
                            <span className="text-xs text-gray-400">{booking.items.length} service(s)</span>
                          </>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-gray-800 mt-1">
                        Rs. {booking.total_amount?.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleAccept(booking.id)}
                      disabled={actionLoading === booking.id}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleReject(booking.id)}
                      disabled={actionLoading === booking.id}
                      className="px-3.5 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Earnings This Month */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Earnings Progress</h3>
              <Link href="/vendor/earnings" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                Details
              </Link>
            </div>
            <div className="text-center mb-4">
              <p className="text-3xl font-bold text-gray-900">
                Rs. {totalEarnings.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-gray-400 mt-1">of Rs. {monthlyTarget.toLocaleString("en-IN")} monthly target</p>
            </div>
            <div className="relative">
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${earningsPercent}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 text-right mt-1.5">{earningsPercent}% of target</p>
            </div>
          </div>

          {/* Motivational Tip */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100 p-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-900 mb-1">Pro Tip</p>
                <p className="text-sm text-amber-700 leading-relaxed">
                  Vendors who respond within 5 minutes get 3x more bookings. Enable notifications to never miss a lead!
                </p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">
                Quick Links
              </h2>
            </div>
            <div className="p-3 space-y-1">
              <Link
                href="/vendor/services"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                  <svg className="w-4.5 h-4.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.384-3.08A.5.5 0 005.5 12.5v0a.5.5 0 00.536.49l6.293-.54m-.93 2.72l2.08 3.6a.5.5 0 00.836.06l3.327-4.272a.5.5 0 00-.188-.752l-5.126-2.636m-2.929 4l5.08-7.08a.5.5 0 01.768-.077l2.077 1.927a.5.5 0 01.03.745L13.42 15.17a.5.5 0 01-.698.063l-1.302-1.063z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Manage Services</p>
                  <p className="text-xs text-gray-500">Add, edit, or remove</p>
                </div>
              </Link>
              <Link
                href="/vendor/availability"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <svg className="w-4.5 h-4.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Set Availability</p>
                  <p className="text-xs text-gray-500">Update working hours</p>
                </div>
              </Link>
              <Link
                href="/vendor/bookings"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                  <svg className="w-4.5 h-4.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">All Bookings</p>
                  <p className="text-xs text-gray-500">View and manage</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
