"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  getAdminBusinesses,
  deleteBusiness,
  approveBusiness,
  updateBusiness,
  AdminBusiness,
  AdminPagination,
} from "@/lib/admin-api";
import { useToast } from "@/components/admin/Toast";
import DataTable, { Column } from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";

export default function AdminBusinessesPage() {
  const { toast } = useToast();
  const [businesses, setBusinesses] = useState<AdminBusiness[]>([]);
  const [pagination, setPagination] = useState<AdminPagination>({
    total: 0,
    page: 1,
    per_page: 20,
    pages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteModal, setDeleteModal] = useState<AdminBusiness | null>(null);

  const load = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const res = await getAdminBusinesses({
          page,
          per_page: 20,
          status: statusFilter || undefined,
          search: search || undefined,
        });
        setBusinesses(res.data.businesses || []);
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
          err instanceof Error ? err.message : "Failed to load businesses",
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

  const handleApprove = async (biz: AdminBusiness) => {
    try {
      await updateBusiness(biz.id, {
        status: "approved",
        is_active: 1,
        is_verified: 1,
      } as Partial<AdminBusiness>);
      toast(`"${biz.name}" approved`, "success");
      load(pagination.page);
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Failed to approve",
        "error"
      );
    }
  };

  const handleToggleFeatured = async (biz: AdminBusiness) => {
    try {
      await updateBusiness(biz.id, {
        is_featured: biz.is_featured ? 0 : 1,
      } as Partial<AdminBusiness>);
      toast(
        `"${biz.name}" ${biz.is_featured ? "unfeatured" : "featured"}`,
        "success"
      );
      load(pagination.page);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to update", "error");
    }
  };

  const handleToggleVerified = async (biz: AdminBusiness) => {
    try {
      await updateBusiness(biz.id, {
        is_verified: biz.is_verified ? 0 : 1,
      } as Partial<AdminBusiness>);
      toast(
        `"${biz.name}" ${biz.is_verified ? "unverified" : "verified"}`,
        "success"
      );
      load(pagination.page);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to update", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      await deleteBusiness(deleteModal.id);
      toast(`"${deleteModal.name}" suspended`, "success");
      setDeleteModal(null);
      load(pagination.page);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to delete", "error");
    }
  };

  const columns: Column<AdminBusiness>[] = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (row) => (
        <div className="min-w-[180px]">
          <Link
            href={`/admin/businesses/${row.id}`}
            className="font-medium text-gray-900 hover:text-primary-600"
          >
            {row.name}
          </Link>
        </div>
      ),
    },
    {
      key: "city_name",
      label: "City",
      sortable: true,
      render: (row) => (
        <span className="text-gray-600">{row.city_name || "-"}</span>
      ),
    },
    {
      key: "category_name",
      label: "Category",
      sortable: true,
      render: (row) => (
        <span className="text-gray-600">{row.category_name || "-"}</span>
      ),
    },
    {
      key: "rating",
      label: "Rating",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-1">
          <svg
            className="w-4 h-4 text-amber-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-sm">{row.rating || "0"}</span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const colors: Record<string, string> = {
          approved: "bg-green-100 text-green-700",
          active: "bg-green-100 text-green-700",
          pending: "bg-amber-100 text-amber-700",
          rejected: "bg-red-100 text-red-700",
          suspended: "bg-gray-100 text-gray-600",
        };
        const status = row.status || "pending";
        return (
          <span
            className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${
              colors[status] || "bg-gray-100 text-gray-600"
            }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      key: "is_verified",
      label: "Verified",
      render: (row) =>
        row.is_verified ? (
          <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Yes
          </span>
        ) : (
          <span className="text-xs text-gray-400">No</span>
        ),
    },
    {
      key: "is_featured",
      label: "Featured",
      render: (row) =>
        row.is_featured ? (
          <span className="inline-flex items-center gap-1 text-amber-600 text-xs font-medium">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Yes
          </span>
        ) : (
          <span className="text-xs text-gray-400">No</span>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      <DataTable<AdminBusiness>
        columns={columns}
        data={businesses}
        loading={loading}
        searchPlaceholder="Search businesses..."
        onSearch={setSearch}
        searchValue={search}
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
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="suspended">Suspended</option>
            </select>
            <Link
              href="/admin/businesses/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
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
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              Add Business
            </Link>
          </div>
        }
        actions={(row) => (
          <div className="flex items-center justify-end gap-1">
            {row.status === "pending" && (
              <button
                onClick={() => handleApprove(row)}
                className="p-1.5 rounded-md hover:bg-green-50 text-green-600"
                title="Approve"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </button>
            )}
            <button
              onClick={() => handleToggleVerified(row)}
              className={`p-1.5 rounded-md hover:bg-blue-50 ${
                row.is_verified ? "text-blue-600" : "text-gray-400"
              }`}
              title={row.is_verified ? "Remove verification" : "Verify"}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
            </button>
            <button
              onClick={() => handleToggleFeatured(row)}
              className={`p-1.5 rounded-md hover:bg-amber-50 ${
                row.is_featured ? "text-amber-500" : "text-gray-400"
              }`}
              title={row.is_featured ? "Remove featured" : "Make featured"}
            >
              <svg className="w-4 h-4" fill={row.is_featured ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
            </button>
            <Link
              href={`/admin/businesses/${row.id}`}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600"
              title="Edit"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </Link>
            <button
              onClick={() => setDeleteModal(row)}
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

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Suspend Business"
      >
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to suspend{" "}
          <strong>{deleteModal?.name}</strong>? The business will be deactivated and hidden from customers.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setDeleteModal(null)}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            Suspend
          </button>
        </div>
      </Modal>
    </div>
  );
}
