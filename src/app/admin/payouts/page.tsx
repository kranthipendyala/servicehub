"use client";

import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/components/admin/Toast";
import {
  getPayouts,
  processPayout,
  AdminPayout,
  AdminPagination,
} from "@/lib/admin-api";
import DataTable, { Column } from "@/components/admin/DataTable";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

export default function AdminPayoutsPage() {
  const { toast } = useToast();
  const [payouts, setPayouts] = useState<AdminPayout[]>([]);
  const [pagination, setPagination] = useState<AdminPagination>({
    total: 0,
    page: 1,
    per_page: 20,
    pages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);

  const load = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const res = await getPayouts({
          page,
          per_page: 20,
          status: statusFilter || undefined,
        });
        setPayouts(res.data.payouts || []);
        setPagination(
          res.data.pagination || { total: 0, page: 1, per_page: 20, pages: 1 }
        );
      } catch {
        toast("Failed to load payouts", "error");
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, toast]
  );

  useEffect(() => {
    load(1);
  }, [load]);

  const handleProcess = async (id: number) => {
    const refId = prompt("Enter reference ID (optional):");
    setProcessingId(id);
    try {
      await processPayout(id, refId || undefined);
      toast("Payout processed successfully", "success");
      load(pagination.page);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to process payout", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const columns: Column<AdminPayout>[] = [
    {
      key: "vendor_name",
      label: "Vendor",
      sortable: true,
      render: (row) => (
        <span className="font-medium text-gray-900">
          {row.vendor_name || `Vendor #${row.vendor_id}`}
        </span>
      ),
    },
    {
      key: "period_start",
      label: "Period",
      render: (row) => (
        <span className="text-gray-700">
          {row.period_start} - {row.period_end}
        </span>
      ),
    },
    {
      key: "bookings_count",
      label: "Bookings",
      sortable: true,
      render: (row) => <span className="text-gray-700">{row.bookings_count}</span>,
    },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      render: (row) => (
        <span className="font-medium text-gray-900">
          Rs. {Number(row.amount).toLocaleString("en-IN")}
        </span>
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
      key: "reference_id",
      label: "Reference",
      render: (row) => (
        <span className="text-xs text-gray-500 font-mono">
          {row.reference_id || "-"}
        </span>
      ),
    },
  ];

  const STATUS_TABS = [
    { label: "All", value: "" },
    { label: "Pending", value: "pending" },
    { label: "Processing", value: "processing" },
    { label: "Completed", value: "completed" },
    { label: "Failed", value: "failed" },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Payouts</h1>

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

      <DataTable<AdminPayout>
        columns={columns}
        data={payouts}
        loading={loading}
        pagination={{
          page: pagination.page,
          totalPages: pagination.pages,
          total: pagination.total,
          perPage: pagination.per_page,
        }}
        onPageChange={(p) => load(p)}
        emptyMessage="No payouts found"
        actions={(row) =>
          row.status === "pending" ? (
            <button
              onClick={() => handleProcess(row.id)}
              disabled={processingId === row.id}
              className="px-3 py-1.5 text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {processingId === row.id ? "Processing..." : "Process"}
            </button>
          ) : null
        }
      />
    </div>
  );
}
