"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getCommissionRules,
  saveCommissionRule,
  updateCommissionRule,
  deleteCommissionRule,
  getAdminCategories,
  AdminCommissionRule,
  AdminCategory,
} from "@/lib/admin-api";
import { useToast } from "@/components/admin/Toast";
import DataTable, { Column } from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";

interface RuleFormData {
  category_id?: number;
  commission_percentage: number;
  min_commission: number;
  is_active: boolean;
}

const emptyForm: RuleFormData = {
  category_id: undefined,
  commission_percentage: 10,
  min_commission: 0,
  is_active: true,
};

export default function AdminCommissionsPage() {
  const { toast } = useToast();
  const [rules, setRules] = useState<AdminCommissionRule[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AdminCommissionRule | null>(null);
  const [form, setForm] = useState<RuleFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState<AdminCommissionRule | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [rulesRes, catRes] = await Promise.all([
        getCommissionRules(),
        getAdminCategories(),
      ]);
      // Sort: default rule (no category) first, then by category name
      const sorted = [...(rulesRes.data || [])].sort((a, b) => {
        if (!a.category_id) return -1;
        if (!b.category_id) return 1;
        return (a.category_name || "").localeCompare(b.category_name || "");
      });
      setRules(sorted);
      setCategories(catRes.data || []);
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Failed to load commission rules",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const openAddModal = () => {
    setEditingRule(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (rule: AdminCommissionRule) => {
    setEditingRule(rule);
    setForm({
      category_id: rule.category_id || undefined,
      commission_percentage: rule.commission_percentage,
      min_commission: rule.min_commission,
      is_active: rule.is_active,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingRule) {
        await updateCommissionRule(editingRule.id, form);
        toast("Commission rule updated", "success");
      } else {
        await saveCommissionRule(form);
        toast("Commission rule created", "success");
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Failed to save rule",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      await deleteCommissionRule(deleteModal.id);
      toast("Commission rule deleted", "success");
      setDeleteModal(null);
      load();
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Failed to delete rule",
        "error"
      );
    }
  };

  const handleToggleActive = async (rule: AdminCommissionRule) => {
    try {
      await updateCommissionRule(rule.id, { is_active: !rule.is_active });
      toast(
        `Rule ${rule.is_active ? "deactivated" : "activated"}`,
        "success"
      );
      load();
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Failed to update rule",
        "error"
      );
    }
  };

  const columns: Column<AdminCommissionRule>[] = [
    {
      key: "category_name",
      label: "Category",
      sortable: true,
      render: (row) => (
        <span className="font-medium text-gray-900">
          {row.category_id ? row.category_name || `Category #${row.category_id}` : "All (Default)"}
        </span>
      ),
    },
    {
      key: "commission_percentage",
      label: "Commission %",
      sortable: true,
      render: (row) => (
        <span className="text-gray-900 font-medium">
          {row.commission_percentage}%
        </span>
      ),
    },
    {
      key: "min_commission",
      label: "Min Commission",
      sortable: true,
      render: (row) => (
        <span className="text-gray-900">
          ₹{Number(row.min_commission).toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      key: "is_active",
      label: "Status",
      render: (row) => (
        <button
          onClick={() => handleToggleActive(row)}
          className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full cursor-pointer transition-colors ${
            row.is_active
              ? "bg-green-100 text-green-700 hover:bg-green-200"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {row.is_active ? "Active" : "Inactive"}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <DataTable<AdminCommissionRule>
        columns={columns}
        data={rules}
        loading={loading}
        emptyMessage="No commission rules found"
        toolbar={
          <button
            onClick={openAddModal}
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
            Add Rule
          </button>
        }
        actions={(row) => (
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={() => openEditModal(row)}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600"
              title="Edit"
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
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                />
              </svg>
            </button>
            <button
              onClick={() => setDeleteModal(row)}
              className="p-1.5 rounded-md hover:bg-red-50 text-red-500"
              title="Delete"
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
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                />
              </svg>
            </button>
          </div>
        )}
      />

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingRule ? "Edit Commission Rule" : "Add Commission Rule"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={form.category_id ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  category_id: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="w-full text-sm rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            >
              <option value="">All Categories (Default)</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Commission Percentage (%)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={form.commission_percentage}
              onChange={(e) =>
                setForm({
                  ...form,
                  commission_percentage: Number(e.target.value),
                })
              }
              className="w-full text-sm rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Commission Amount (INR)
            </label>
            <input
              type="number"
              min={0}
              step={1}
              value={form.min_commission}
              onChange={(e) =>
                setForm({ ...form, min_commission: Number(e.target.value) })
              }
              className="w-full text-sm rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="is_active"
              type="checkbox"
              checked={form.is_active}
              onChange={(e) =>
                setForm({ ...form, is_active: e.target.checked })
              }
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="is_active" className="text-sm text-gray-700">
              Active
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : editingRule ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete Commission Rule"
      >
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to delete the commission rule for{" "}
          <strong>
            {deleteModal?.category_id
              ? deleteModal.category_name || `Category #${deleteModal.category_id}`
              : "All Categories (Default)"}
          </strong>
          ? This action cannot be undone.
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
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
