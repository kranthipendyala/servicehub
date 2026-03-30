"use client";

import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/components/admin/Toast";
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  AdminCoupon,
  AdminPagination,
} from "@/lib/admin-api";
import DataTable, { Column } from "@/components/admin/DataTable";

const emptyCoupon: Partial<AdminCoupon> = {
  code: "",
  type: "percentage",
  value: 0,
  min_order_amount: 0,
  max_discount: 0,
  usage_limit: 0,
  valid_from: "",
  valid_until: "",
  is_active: true,
};

export default function AdminCouponsPage() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [pagination, setPagination] = useState<AdminPagination>({
    total: 0,
    page: 1,
    per_page: 20,
    pages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<AdminCoupon>>(emptyCoupon);
  const [saving, setSaving] = useState(false);

  const load = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const res = await getCoupons({ page, per_page: 20 });
        setCoupons(res.data.coupons || []);
        setPagination(
          res.data.pagination || { total: 0, page: 1, per_page: 20, pages: 1 }
        );
      } catch {
        toast("Failed to load coupons", "error");
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    load(1);
  }, [load]);

  const openAdd = () => {
    setEditing(emptyCoupon);
    setModalOpen(true);
  };

  const openEdit = (coupon: AdminCoupon) => {
    setEditing({ ...coupon });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!editing.code) {
      toast("Coupon code is required", "error");
      return;
    }
    setSaving(true);
    try {
      if (editing.id) {
        await updateCoupon(editing.id, editing);
        toast("Coupon updated", "success");
      } else {
        await createCoupon(editing);
        toast("Coupon created", "success");
      }
      setModalOpen(false);
      load(pagination.page);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to save coupon", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this coupon?")) return;
    try {
      await deleteCoupon(id);
      toast("Coupon deleted", "success");
      load(pagination.page);
    } catch {
      toast("Failed to delete coupon", "error");
    }
  };

  const columns: Column<AdminCoupon>[] = [
    {
      key: "code",
      label: "Code",
      sortable: true,
      render: (row) => (
        <span className="font-mono font-medium text-gray-900">{row.code}</span>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (row) => (
        <span className="text-gray-700 capitalize">{row.type}</span>
      ),
    },
    {
      key: "value",
      label: "Value",
      sortable: true,
      render: (row) => (
        <span className="font-medium text-gray-900">
          {row.type === "percentage" ? `${row.value}%` : `Rs. ${row.value}`}
        </span>
      ),
    },
    {
      key: "used_count",
      label: "Usage",
      render: (row) => (
        <span className="text-gray-700">
          {row.used_count}{row.usage_limit ? ` / ${row.usage_limit}` : ""}
        </span>
      ),
    },
    {
      key: "valid_from",
      label: "Valid From",
      render: (row) => <span className="text-gray-700">{row.valid_from}</span>,
    },
    {
      key: "valid_until",
      label: "Valid Until",
      render: (row) => <span className="text-gray-700">{row.valid_until}</span>,
    },
    {
      key: "is_active",
      label: "Status",
      render: (row) => (
        <span
          className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
            row.is_active
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {row.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
        <button
          onClick={openAdd}
          className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
        >
          + Add Coupon
        </button>
      </div>

      <DataTable<AdminCoupon>
        columns={columns}
        data={coupons}
        loading={loading}
        pagination={{
          page: pagination.page,
          totalPages: pagination.pages,
          total: pagination.total,
          perPage: pagination.per_page,
        }}
        onPageChange={(p) => load(p)}
        emptyMessage="No coupons found"
        actions={(row) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => openEdit(row)}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600"
              title="Edit"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
              </svg>
            </button>
            <button
              onClick={() => handleDelete(row.id)}
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

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">
              {editing.id ? "Edit Coupon" : "Add Coupon"}
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
              <input
                type="text"
                value={editing.code || ""}
                onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 font-mono"
                placeholder="e.g. SAVE20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={editing.type || "percentage"}
                  onChange={(e) =>
                    setEditing({ ...editing, type: e.target.value as "percentage" | "fixed" })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                <input
                  type="number"
                  value={editing.value ?? 0}
                  onChange={(e) => setEditing({ ...editing, value: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Amount</label>
                <input
                  type="number"
                  value={editing.min_order_amount ?? 0}
                  onChange={(e) => setEditing({ ...editing, min_order_amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount</label>
                <input
                  type="number"
                  value={editing.max_discount ?? 0}
                  onChange={(e) => setEditing({ ...editing, max_discount: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit (0 = unlimited)</label>
              <input
                type="number"
                value={editing.usage_limit ?? 0}
                onChange={(e) => setEditing({ ...editing, usage_limit: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valid From</label>
                <input
                  type="date"
                  value={editing.valid_from || ""}
                  onChange={(e) => setEditing({ ...editing, valid_from: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
                <input
                  type="date"
                  value={editing.valid_until || ""}
                  onChange={(e) => setEditing({ ...editing, valid_until: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editing.is_active !== false}
                onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
                className="rounded border-gray-300 text-primary-600"
              />
              Active
            </label>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : editing.id ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
