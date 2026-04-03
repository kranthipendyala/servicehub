"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/admin/Toast";
import {
  getAnalyticsRevenue,
  RevenueAnalytics,
} from "@/lib/admin-api";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  in_progress: "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function AdminAnalyticsPage() {
  const { toast } = useToast();
  const [data, setData] = useState<RevenueAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("all");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getAnalyticsRevenue({ period: period !== "all" ? period : undefined });
        setData(res.data);
      } catch {
        toast("Failed to load analytics", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [period, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16 text-gray-500">No analytics data available</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
        >
          <option value="all">All Time</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
          <option value="12m">Last 12 Months</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-primary-50 rounded-xl p-5 border border-gray-100">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-900">
            Rs. {(data.total_revenue || 0).toLocaleString("en-IN")}
          </p>
        </div>
        <div className="bg-blue-50 rounded-xl p-5 border border-gray-100">
          <p className="text-sm text-gray-500">Total Commission</p>
          <p className="text-2xl font-bold text-gray-900">
            Rs. {(data.total_commission || 0).toLocaleString("en-IN")}
          </p>
        </div>
        <div className="bg-purple-50 rounded-xl p-5 border border-gray-100">
          <p className="text-sm text-gray-500">Total Payouts</p>
          <p className="text-2xl font-bold text-gray-900">
            Rs. {(data.total_payouts || 0).toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Month */}
        {data.revenue_by_month && data.revenue_by_month.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Revenue by Month</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase">Month</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-600 uppercase">Revenue</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-600 uppercase">Commission</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-600 uppercase">Payouts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.revenue_by_month.map((row) => (
                    <tr key={row.month} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 font-medium text-gray-900">{row.month}</td>
                      <td className="px-4 py-2.5 text-right text-gray-700">
                        Rs. {row.revenue.toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-2.5 text-right text-gray-700">
                        Rs. {row.commission.toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-2.5 text-right text-gray-700">
                        Rs. {row.payouts.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bookings by Status */}
        {data.bookings_by_status && data.bookings_by_status.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Bookings by Status</h2>
            </div>
            <div className="p-6 space-y-3">
              {data.bookings_by_status.map((item) => {
                const totalBookings = data.bookings_by_status.reduce(
                  (sum, i) => sum + i.count,
                  0
                );
                const pct = totalBookings > 0 ? (item.count / totalBookings) * 100 : 0;
                return (
                  <div key={item.status}>
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                          statusColors[item.status] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {item.status.replace(/_/g, " ")}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{item.count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Top Vendors */}
      {data.top_vendors && data.top_vendors.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Top Vendors by Revenue</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase">#</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase">Vendor</th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-600 uppercase">Bookings</th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-600 uppercase">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.top_vendors.map((vendor, i) => (
                  <tr key={vendor.vendor_id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-gray-500">{i + 1}</td>
                    <td className="px-4 py-2.5 font-medium text-gray-900">{vendor.vendor_name}</td>
                    <td className="px-4 py-2.5 text-right text-gray-700">{vendor.bookings}</td>
                    <td className="px-4 py-2.5 text-right font-medium text-gray-900">
                      Rs. {vendor.revenue.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Category Performance */}
      {data.category_performance && data.category_performance.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Category Performance</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-600 uppercase">Bookings</th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-600 uppercase">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.category_performance.map((cat) => (
                  <tr key={cat.category_id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-medium text-gray-900">{cat.category_name}</td>
                    <td className="px-4 py-2.5 text-right text-gray-700">{cat.bookings}</td>
                    <td className="px-4 py-2.5 text-right font-medium text-gray-900">
                      Rs. {cat.revenue.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
