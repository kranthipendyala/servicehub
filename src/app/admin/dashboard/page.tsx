"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getDashboardStats,
  getRecentBusinesses,
  getRecentReviews,
  DashboardStats,
  AdminBusiness,
  AdminReview,
} from "@/lib/admin-api";
import { useToast } from "@/components/admin/Toast";
import StatsCard from "@/components/admin/StatsCard";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [businesses, setBusinesses] = useState<AdminBusiness[]>([]);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, bizRes, revRes] = await Promise.allSettled([
          getDashboardStats(),
          getRecentBusinesses(),
          getRecentReviews(),
        ]);

        if (statsRes.status === "fulfilled") {
          setStats(statsRes.value.data);
        } else {
          console.error("Dashboard stats failed:", statsRes.reason);
          toast("Failed to load dashboard stats", "error");
        }

        if (bizRes.status === "fulfilled") {
          setBusinesses(bizRes.value.data.businesses || []);
        } else {
          console.error("Recent businesses failed:", bizRes.reason);
        }

        if (revRes.status === "fulfilled") {
          setReviews(revRes.value.data.reviews || []);
        } else {
          console.error("Recent reviews failed:", revRes.reason);
        }
      } catch (err) {
        toast(
          err instanceof Error ? err.message : "Failed to load dashboard",
          "error"
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [toast]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded w-20 mb-2" />
                  <div className="h-6 bg-gray-200 rounded w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statCards = stats
    ? [
        {
          title: "Total Businesses",
          value: stats.total_businesses,
          icon: "building",
          color: "blue",
        },
        {
          title: "Pending Approvals",
          value: stats.pending_businesses,
          icon: "clock",
          color: "amber",
          subtitle: "Require review",
        },
        {
          title: "Active Businesses",
          value: stats.active_businesses,
          icon: "check",
          color: "green",
        },
        {
          title: "Total Users",
          value: stats.total_users,
          icon: "users",
          color: "purple",
        },
        {
          title: "Total Reviews",
          value: stats.total_reviews,
          icon: "star",
          color: "rose",
        },
        {
          title: "Pending Reviews",
          value: stats.pending_reviews,
          icon: "clock",
          color: "red",
        },
        {
          title: "Categories",
          value: stats.total_categories,
          icon: "folder",
          color: "indigo",
        },
        {
          title: "Cities",
          value: stats.total_cities,
          icon: "map",
          color: "cyan",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <StatsCard key={card.title} {...card} />
        ))}
      </div>

      {/* Two-column content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Businesses */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              Recent Businesses
            </h2>
            <Link
              href="/admin/businesses"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {businesses.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-gray-500">
                No businesses yet
              </p>
            ) : (
              businesses.slice(0, 10).map((biz) => (
                <div
                  key={biz.id}
                  className="flex items-center justify-between px-6 py-3 hover:bg-gray-50"
                >
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/admin/businesses/${biz.id}`}
                      className="text-sm font-medium text-gray-900 hover:text-primary-600 truncate block"
                    >
                      {biz.name}
                    </Link>
                    <p className="text-xs text-gray-500">
                      {biz.city_name || "Unknown city"} &middot;{" "}
                      {biz.category_name || "Uncategorized"}
                    </p>
                  </div>
                  <span
                    className={`ml-3 inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                      biz.status === "active"
                        ? "bg-green-100 text-green-700"
                        : biz.status === "pending"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {biz.status || "unknown"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              Recent Reviews
            </h2>
            <Link
              href="/admin/reviews"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {reviews.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-gray-500">
                No reviews yet
              </p>
            ) : (
              reviews.slice(0, 10).map((rev) => (
                <div
                  key={rev.id}
                  className="px-6 py-3 hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {rev.user_name}
                    </span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating
                              ? "text-amber-400"
                              : "text-gray-200"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {rev.comment}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    on {rev.business_name || `Business #${rev.business_id}`}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
