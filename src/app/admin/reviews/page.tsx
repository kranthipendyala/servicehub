"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getAdminReviews,
  approveReview,
  deleteReview,
  AdminReview,
  AdminPagination,
} from "@/lib/admin-api";
import { useToast } from "@/components/admin/Toast";
import DataTable, { Column } from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";

export default function AdminReviewsPage() {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [pagination, setPagination] = useState<AdminPagination>({
    total: 0,
    page: 1,
    per_page: 20,
    pages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AdminReview | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const load = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const res = await getAdminReviews({
          page,
          per_page: 20,
          status: statusFilter || undefined,
        });
        setReviews(res.data.reviews || []);
        setPagination(
          res.data.pagination || { total: 0, page: 1, per_page: 20, pages: 1 }
        );
      } catch (err) {
        toast(err instanceof Error ? err.message : "Failed to load reviews", "error");
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, toast]
  );

  useEffect(() => {
    load(1);
  }, [load]);

  const handleApprove = async (id: number) => {
    try {
      await approveReview(id);
      toast("Review approved", "success");
      load(pagination.page);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to approve", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteReview(deleteTarget.id);
      toast("Review deleted", "success");
      setDeleteTarget(null);
      load(pagination.page);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to delete", "error");
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.size === 0) return;
    try {
      await Promise.all(Array.from(selectedIds).map((id) => approveReview(id)));
      toast(`${selectedIds.size} reviews approved`, "success");
      setSelectedIds(new Set());
      load(pagination.page);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Bulk action failed", "error");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    try {
      await Promise.all(Array.from(selectedIds).map((id) => deleteReview(id)));
      toast(`${selectedIds.size} reviews deleted`, "success");
      setSelectedIds(new Set());
      load(pagination.page);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Bulk action failed", "error");
    }
  };

  const columns: Column<AdminReview>[] = [
    {
      key: "business_name",
      label: "Business",
      render: (row) => (
        <span className="font-medium text-gray-900">
          {row.business_name || `#${row.business_id}`}
        </span>
      ),
    },
    {
      key: "user_name",
      label: "User",
      render: (row) => (
        <div>
          <p className="text-sm text-gray-900">{row.user_name}</p>
          {row.user_email && (
            <p className="text-xs text-gray-400">{row.user_email}</p>
          )}
        </div>
      ),
    },
    {
      key: "rating",
      label: "Rating",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg
              key={i}
              className={`w-4 h-4 ${i < row.rating ? "text-amber-400" : "text-gray-200"}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      ),
    },
    {
      key: "comment",
      label: "Comment",
      className: "max-w-xs",
      render: (row) => (
        <p className="text-sm text-gray-600 truncate max-w-xs">{row.comment}</p>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const colors: Record<string, string> = {
          approved: "bg-green-100 text-green-700",
          pending: "bg-amber-100 text-amber-700",
          rejected: "bg-red-100 text-red-700",
        };
        const status = row.status || "pending";
        return (
          <span
            className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
              colors[status] || "bg-gray-100 text-gray-600"
            }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      key: "created_at",
      label: "Date",
      sortable: true,
      render: (row) => (
        <span className="text-xs text-gray-500">
          {row.created_at
            ? new Date(row.created_at).toLocaleDateString()
            : "-"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <DataTable<AdminReview>
        columns={columns}
        data={reviews}
        loading={loading}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        pagination={{
          page: pagination.page,
          totalPages: pagination.pages,
          total: pagination.total,
          perPage: pagination.per_page,
        }}
        onPageChange={(p) => load(p)}
        toolbar={
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            {selectedIds.size > 0 && (
              <>
                <button
                  onClick={handleBulkApprove}
                  className="px-3 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700"
                >
                  Approve ({selectedIds.size})
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700"
                >
                  Delete ({selectedIds.size})
                </button>
              </>
            )}
          </div>
        }
        actions={(row) => (
          <div className="flex items-center justify-end gap-1">
            {(row.status === "pending" || !row.status) && (
              <button
                onClick={() => handleApprove(row.id)}
                className="p-1.5 rounded-md hover:bg-green-50 text-green-600"
                title="Approve"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </button>
            )}
            <button
              onClick={() => setDeleteTarget(row)}
              className="p-1.5 rounded-md hover:bg-red-50 text-red-500"
              title="Delete"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          </div>
        )}
      />

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Review">
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to delete this review by{" "}
          <strong>{deleteTarget?.user_name}</strong>?
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
