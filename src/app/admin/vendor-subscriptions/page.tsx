"use client";

import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/components/admin/Toast";
import {
  getVendorSubscriptions,
  AdminVendorSubscription,
  AdminPagination,
} from "@/lib/admin-api";
import DataTable, { Column } from "@/components/admin/DataTable";

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  expired: "bg-gray-100 text-gray-600",
  cancelled: "bg-red-100 text-red-700",
  pending: "bg-amber-100 text-amber-700",
};

export default function AdminVendorSubscriptionsPage() {
  const { toast } = useToast();
  const [subs, setSubs] = useState<AdminVendorSubscription[]>([]);
  const [pagination, setPagination] = useState<AdminPagination>({
    total: 0,
    page: 1,
    per_page: 20,
    pages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const load = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const res = await getVendorSubscriptions({
          page,
          per_page: 20,
          status: statusFilter || undefined,
        });
        setSubs(res.data.subscriptions || []);
        setPagination(
          res.data.pagination || { total: 0, page: 1, per_page: 20, pages: 1 }
        );
      } catch {
        toast("Failed to load subscriptions", "error");
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, toast]
  );

  useEffect(() => {
    load(1);
  }, [load]);

  const columns: Column<AdminVendorSubscription>[] = [
    {
      key: "vendor_name",
      label: "Vendor",
      sortable: true,
      render: (row) => (
        <span className="font-medium text-gray-900">{row.vendor_name || `Vendor #${row.vendor_id}`}</span>
      ),
    },
    {
      key: "plan_name",
      label: "Plan",
      sortable: true,
      render: (row) => <span className="text-gray-700">{row.plan_name || "-"}</span>,
    },
    {
      key: "billing_cycle",
      label: "Cycle",
      render: (row) => (
        <span className="text-gray-700 capitalize">{row.billing_cycle}</span>
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
          {row.status}
        </span>
      ),
    },
    {
      key: "starts_at",
      label: "Start",
      render: (row) => <span className="text-gray-700">{row.starts_at}</span>,
    },
    {
      key: "ends_at",
      label: "End",
      render: (row) => <span className="text-gray-700">{row.ends_at}</span>,
    },
  ];

  const STATUS_TABS = [
    { label: "All", value: "" },
    { label: "Active", value: "active" },
    { label: "Expired", value: "expired" },
    { label: "Cancelled", value: "cancelled" },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Vendor Subscriptions</h1>

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

      <DataTable<AdminVendorSubscription>
        columns={columns}
        data={subs}
        loading={loading}
        pagination={{
          page: pagination.page,
          totalPages: pagination.pages,
          total: pagination.total,
          perPage: pagination.per_page,
        }}
        onPageChange={(p) => load(p)}
        emptyMessage="No vendor subscriptions found"
      />
    </div>
  );
}
