"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/admin/Toast";
import { getVendorCategories, updateVendorCategories, VendorCategory } from "@/lib/vendor-api";

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  children?: CategoryItem[];
}

export default function VendorCategoriesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [allCategories, setAllCategories] = useState<CategoryItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [primaryId, setPrimaryId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vendorCatsRes, allCatsRes] = await Promise.all([
          getVendorCategories(),
          fetch("/proxy-api/categories").then((r) => r.json()),
        ]);

        // All available categories
        const catList = allCatsRes.data?.categories || allCatsRes.data || [];
        setAllCategories(Array.isArray(catList) ? catList : []);

        // Vendor's selected categories
        const vendorCats = Array.isArray(vendorCatsRes.data) ? vendorCatsRes.data : [];
        setSelectedIds(new Set(vendorCats.map((c) => c.id)));
        const primary = vendorCats.find((c) => c.is_primary);
        if (primary) setPrimaryId(primary.id);
      } catch {
        toast("Failed to load categories", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleCategory = (catId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) {
        next.delete(catId);
        if (primaryId === catId) setPrimaryId(null);
      } else {
        next.add(catId);
        if (!primaryId) setPrimaryId(catId);
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (selectedIds.size === 0) {
      toast("Select at least one category", "error");
      return;
    }

    // Put primary first
    const ids = Array.from(selectedIds);
    if (primaryId && ids.includes(primaryId)) {
      const idx = ids.indexOf(primaryId);
      ids.splice(idx, 1);
      ids.unshift(primaryId);
    }

    setSaving(true);
    try {
      const res = await updateVendorCategories(ids);
      const updated = Array.isArray(res.data) ? res.data : [];
      setSelectedIds(new Set(updated.map((c) => c.id)));
      const prim = updated.find((c) => c.is_primary);
      if (prim) setPrimaryId(prim.id);
      toast("Categories updated", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">My Categories</h2>
          <p className="text-sm text-gray-500">Select all service categories you offer</p>
        </div>
      </div>

      {/* Selected count */}
      <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 flex items-center justify-between">
        <span className="text-sm font-medium text-primary-800">
          {selectedIds.size} {selectedIds.size === 1 ? "category" : "categories"} selected
        </span>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          {saving ? "Saving..." : "Save Categories"}
        </button>
      </div>

      {/* Category selection — only parent categories are selectable */}
      <div className="space-y-3">
        {allCategories.map((cat) => {
          const isSelected = selectedIds.has(cat.id);
          const isPrimary = primaryId === cat.id;
          const hasChildren = cat.children && cat.children.length > 0;

          return (
            <div
              key={cat.id}
              className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${
                isSelected ? "border-primary-300" : "border-gray-200"
              }`}
            >
              <label
                className={`flex items-center justify-between px-5 py-4 cursor-pointer transition-colors ${
                  isSelected ? "bg-primary-50" : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleCategory(cat.id)}
                    className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <span className={`text-sm font-semibold ${isSelected ? "text-primary-800" : "text-gray-700"}`}>
                      {cat.name}
                    </span>
                    {hasChildren && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        Services: {cat.children!.map((c) => c.name).join(", ")}
                      </p>
                    )}
                  </div>
                </div>
                {isSelected && (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); setPrimaryId(cat.id); }}
                    className={`px-2.5 py-1 text-xs rounded-full flex-shrink-0 ${
                      isPrimary
                        ? "bg-primary-600 text-white"
                        : "bg-gray-100 text-gray-500 hover:bg-primary-100 hover:text-primary-700"
                    }`}
                  >
                    {isPrimary ? "Primary" : "Set primary"}
                  </button>
                )}
              </label>
            </div>
          );
        })}
      </div>

      {/* Bottom save */}
      <div className="flex justify-end gap-3 pb-6">
        <button type="button" onClick={() => router.back()} className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors">
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          {saving ? "Saving..." : "Save Categories"}
        </button>
      </div>
    </div>
  );
}
