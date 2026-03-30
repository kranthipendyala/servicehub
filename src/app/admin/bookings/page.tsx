"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getAdminBookings,
  AdminBooking,
  AdminPagination,
} from "@/lib/admin-api";
import { useToast } from "@/components/admin/Toast";
import DataTable, { Column } from "@/components/admin/DataTable";

const STATUS_TABS = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "In Progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
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

export default function AdminBookingsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [pagination, setPagination] = useState<AdminPagination>({
    total: 0,
    page: 1,
    per_page: 20,
    pages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const load = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const res = await getAdminBookings({
          page,
          per_page: 20,
          status: statusFilter || undefined,
          search: search || undefined,
        });
        setBookings(res.data.bookings || []);
        setPagination(
          res.data.pagination || {
            total: 0,
            page: 1,
            per_page: 20,
            pages: 1,
          }
        );
      } catch (err) {
        toast(
          err instanceof Error ? err.message : "Failed to load bookings",
          "error"
        );
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, search, toast]
  );

  useEffect(() => {
    load(1);
  }, [load]);

  const columns: Column<AdminBooking>[] = [
    {
      key: "booking_number",
      label: "Booking #",
      sortable: true,
      render: (row) => (
        <span className="font-medium text-gray-900">
          {row.booking_number}
        </span>
      ),
    },
    {
      key: "customer_name",
      label: "Customer",
      sortable: true,
      render: (row) => (
        <div>
          <p className="text-gray-900">{row.customer_name || "-"}</p>
          {row.customer_phone && (
            <p className="text-xs text-gray-500">{row.customer_phone}</p>
          )}
        </div>
      ),
    },
    {
      key: "business_name",
      label: "Vendor / Business",
      sortable: true,
      render: (row) => (
        <div>
          <p className="text-gray-900">{row.business_name || "-"}</p>
          {row.vendor_name && (
            <p className="text-xs text-gray-500">{row.vendor_name}</p>
          )}
        </div>
      ),
    },
    {
      key: "scheduled_date",
      label: "Date",
      sortable: true,
      render: (row) => (
        <div>
          <p className="text-gray-900">{row.scheduled_date}</p>
          {row.scheduled_time && (
            <p className="text-xs text-gray-500">{row.scheduled_time}</p>
          )}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span
          className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
            statusColors[row.status] || "bg-gray-100 text-gray-600"
          }`}
        >
          {row.status.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      key: "payment_status",
      label: "Payment",
      render: (row) => (
        <span
          className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
            paymentColors[row.payment_status] || "bg-gray-100 text-gray-600"
          }`}
        >
          {row.payment_status.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      key: "total_amount",
      label: "Amount",
      sortable: true,
      render: (row) => (
        <span className="font-medium text-gray-900">
          ₹{Number(row.total_amount).toLocaleString("en-IN")}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Status tabs */}
      <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-200 p-1.5 overflow-x-auto">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              statusFilter === tab.value
                ? "bg-primary-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <DataTable<AdminBooking>
        columns={columns}
        data={bookings}
        loading={loading}
        searchPlaceholder="Search by booking number..."
        onSearch={setSearch}
        searchValue={search}
        pagination={{
          page: pagination.page,
          totalPages: pagination.pages,
          total: pagination.total,
          perPage: pagination.per_page,
        }}
        onPageChange={(p) => load(p)}
        emptyMessage="No bookings found"
        actions={(row) => (
          <button
            onClick={() => router.push(`/admin/bookings/${row.id}`)}
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600"
            title="View details"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        )}
      />
    </div>
  );
}
