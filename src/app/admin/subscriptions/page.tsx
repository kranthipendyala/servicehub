"use client";

import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/components/admin/Toast";
import {
  getSubscriptionPlans,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  AdminSubscriptionPlan,
} from "@/lib/admin-api";

const emptyPlan: Partial<AdminSubscriptionPlan> = {
  name: "",
  slug: "",
  monthly_price: 0,
  annual_price: 0,
  features: [],
  max_services: 10,
  commission_discount: 0,
  is_popular: false,
  is_active: true,
};

export default function AdminSubscriptionsPage() {
  const { toast } = useToast();
  const [plans, setPlans] = useState<AdminSubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<AdminSubscriptionPlan>>(emptyPlan);
  const [saving, setSaving] = useState(false);
  const [featuresText, setFeaturesText] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSubscriptionPlans();
      setPlans(res.data || []);
    } catch {
      toast("Failed to load plans", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const openAdd = () => {
    setEditing(emptyPlan);
    setFeaturesText("");
    setModalOpen(true);
  };

  const openEdit = (plan: AdminSubscriptionPlan) => {
    setEditing({ ...plan });
    setFeaturesText((plan.features || []).join("\n"));
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!editing.name) {
      toast("Plan name is required", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...editing,
        features: featuresText
          .split("\n")
          .map((f) => f.trim())
          .filter(Boolean),
      };
      if (editing.id) {
        await updateSubscriptionPlan(editing.id, payload);
        toast("Plan updated", "success");
      } else {
        await createSubscriptionPlan(payload);
        toast("Plan created", "success");
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to save plan", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
        <button
          onClick={openAdd}
          className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
        >
          + Add Plan
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Monthly</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Annual</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Max Services</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Commission Disc.</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Features</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : plans.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                    No subscription plans yet
                  </td>
                </tr>
              ) : (
                plans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {plan.name}
                      {plan.is_popular && (
                        <span className="ml-2 inline-flex px-1.5 py-0.5 text-[10px] font-semibold rounded bg-primary-100 text-primary-700">
                          Popular
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      Rs. {plan.monthly_price.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      Rs. {plan.annual_price.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{plan.max_services}</td>
                    <td className="px-4 py-3 text-gray-700">{plan.commission_discount}%</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {(plan.features || []).length} features
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                          plan.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {plan.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openEdit(plan)}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">
              {editing.id ? "Edit Plan" : "Add Plan"}
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={editing.name || ""}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <input
                type="text"
                value={editing.slug || ""}
                onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Price</label>
                <input
                  type="number"
                  value={editing.monthly_price ?? 0}
                  onChange={(e) => setEditing({ ...editing, monthly_price: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Annual Price</label>
                <input
                  type="number"
                  value={editing.annual_price ?? 0}
                  onChange={(e) => setEditing({ ...editing, annual_price: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Services</label>
                <input
                  type="number"
                  value={editing.max_services ?? 10}
                  onChange={(e) => setEditing({ ...editing, max_services: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Commission Discount %</label>
                <input
                  type="number"
                  value={editing.commission_discount ?? 0}
                  onChange={(e) => setEditing({ ...editing, commission_discount: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Features (one per line)
              </label>
              <textarea
                value={featuresText}
                onChange={(e) => setFeaturesText(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!editing.is_popular}
                  onChange={(e) => setEditing({ ...editing, is_popular: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600"
                />
                Popular
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editing.is_active !== false}
                  onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600"
                />
                Active
              </label>
            </div>

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
