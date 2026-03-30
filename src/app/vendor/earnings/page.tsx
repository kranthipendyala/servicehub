"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/admin/Toast";
import { getVendorStats, getVendorBookings } from "@/lib/vendor-api";
import type { VendorStats, Booking } from "@/types";

export default function VendorEarningsPage() {
  const { toast } = useToast();
  const [stats, setStats] = useState<VendorStats | null>(null);
  const [completedBookings, setCompletedBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [statsRes, bookingsRes] = await Promise.all([
          getVendorStats(),
          getVendorBookings({ status: "completed", per_page: 20 }),
        ]);
        setStats(statsRes.data);
        setCompletedBookings(bookingsRes.data.bookings || []);
      } catch {
        toast("Failed to load earnings data", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalRevenue = completedBookings.reduce(
    (sum, b) => sum + (b.total_amount || 0),
    0
  );
  const totalCommission = completedBookings.reduce(
    (sum, b) => sum + (b.commission_amount || 0),
    0
  );
  const netPayout = completedBookings.reduce(
    (sum, b) => sum + (b.vendor_payout_amount || 0),
    0
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Earnings</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
          <p className="text-sm text-emerald-700">Total Earnings</p>
          <p className="text-2xl font-bold text-emerald-900 mt-1">
            Rs. {(stats?.total_earnings ?? 0).toLocaleString("en-IN")}
          </p>
        </div>
        <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
          <p className="text-sm text-blue-700">Completed Jobs</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">
            {stats?.completed ?? completedBookings.length}
          </p>
        </div>
        <div className="bg-purple-50 rounded-xl p-5 border border-purple-100">
          <p className="text-sm text-purple-700">Total Revenue</p>
          <p className="text-2xl font-bold text-purple-900 mt-1">
            Rs. {totalRevenue.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
          <p className="text-sm text-amber-700">Commission Deducted</p>
          <p className="text-2xl font-bold text-amber-900 mt-1">
            Rs. {totalCommission.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Net Payout Highlight */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">Net Payout (after commission)</p>
            <p className="text-3xl font-bold text-emerald-600 mt-1">
              Rs. {netPayout.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>
              Revenue: Rs. {totalRevenue.toLocaleString("en-IN")}
            </p>
            <p>
              Commission: - Rs. {totalCommission.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Completed Bookings */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">
            Recent Completed Bookings
          </h3>
        </div>
        {completedBookings.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-400">
            No completed bookings yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commission
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payout
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {completedBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      #{booking.booking_number}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {booking.customer_name || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {booking.completed_at
                        ? new Date(booking.completed_at).toLocaleDateString()
                        : booking.scheduled_date}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-900 font-medium">
                      Rs. {booking.total_amount?.toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4 text-right text-amber-600">
                      - Rs.{" "}
                      {booking.commission_amount?.toLocaleString("en-IN")}
                      <span className="text-xs text-gray-400 ml-1">
                        ({booking.commission_rate}%)
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-emerald-600 font-semibold">
                      Rs.{" "}
                      {booking.vendor_payout_amount?.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
