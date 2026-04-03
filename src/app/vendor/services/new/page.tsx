"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/admin/Toast";
import {
  createVendorService,
  updateVendorService,
  getVendorServices,
} from "@/lib/vendor-api";
import type { Service, ServiceVariant } from "@/types";

interface VariantInput {
  name: string;
  price: string;
}

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  children?: CategoryItem[];
}

const PRICE_UNITS = [
  { value: "fixed", label: "Fixed Price" },
  { value: "per_hour", label: "Per Hour" },
  { value: "per_sqft", label: "Per Sq.Ft" },
  { value: "per_unit", label: "Per Unit" },
];

export default function VendorServiceFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const presetCatId = searchParams.get("cat") || "";
  const isEdit = !!editId;
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [fetchingEdit, setFetchingEdit] = useState(isEdit);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [allCategories, setAllCategories] = useState<CategoryItem[]>([]);

  // Form fields
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState(presetCatId);
  const [basePrice, setBasePrice] = useState("");
  const [discountedPrice, setDiscountedPrice] = useState("");
  const [priceUnit, setPriceUnit] = useState("fixed");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [variants, setVariants] = useState<VariantInput[]>([]);

  // Fetch vendor's categories first, fallback to all categories
  useEffect(() => {
    (async () => {
      try {
        // Try vendor's own categories first
        const { getVendorCategories } = await import("@/lib/vendor-api");
        const vendorRes = await getVendorCategories();
        const vendorCats = Array.isArray(vendorRes.data) ? vendorRes.data : [];

        if (vendorCats.length > 0) {
          setCategories(vendorCats.map((c) => ({ id: c.id, name: c.name, slug: c.slug })));
          // Also fetch all categories for template suggestions
          try {
            const res = await fetch("/proxy-api/categories").then((r) => r.json());
            const catList = res.data?.categories || res.data || [];
            if (Array.isArray(catList)) setAllCategories(catList);
          } catch {}
          return;
        }
      } catch {}

      // Fallback: show all categories
      try {
        const res = await fetch("/proxy-api/categories").then((r) => r.json());
        const catList = res.data?.categories || res.data || [];
        if (Array.isArray(catList)) {
          setCategories(catList);
          setAllCategories(catList);
        }
      } catch {}
    })();
  }, []);

  // Load existing service for edit
  useEffect(() => {
    if (!editId) return;
    (async () => {
      try {
        const res = await getVendorServices();
        const list = Array.isArray(res.data)
          ? res.data
          : (res.data as any)?.services || [];
        const svc = list.find(
          (s: Service) => String(s.id) === String(editId)
        );
        if (svc) {
          setName(svc.name);
          setCategoryId(String(svc.category_id));
          setBasePrice(String(svc.base_price));
          setDiscountedPrice(
            svc.discounted_price ? String(svc.discounted_price) : ""
          );
          setPriceUnit(svc.price_unit || "fixed");
          setDuration(String(svc.duration_minutes || ""));
          setDescription(svc.description || "");
          setImage(svc.image || "");
          if (svc.variants && svc.variants.length > 0) {
            setVariants(
              svc.variants.map((v: ServiceVariant) => ({
                name: v.name,
                price: String(v.price),
              }))
            );
          }
        }
      } catch {
        toast("Failed to load service", "error");
      } finally {
        setFetchingEdit(false);
      }
    })();
  }, [editId]);

  // Flatten categories for select
  const flatCategories: { id: number; name: string; isChild?: boolean }[] = [];
  categories.forEach((cat) => {
    flatCategories.push({ id: cat.id, name: cat.name });
    if (cat.children) {
      cat.children.forEach((child) => {
        flatCategories.push({ id: child.id, name: child.name, isChild: true });
      });
    }
  });

  const addVariant = () => {
    setVariants([...variants, { name: "", price: "" }]);
  };

  const removeVariant = (idx: number) => {
    setVariants(variants.filter((_, i) => i !== idx));
  };

  const updateVariant = (idx: number, field: "name" | "price", value: string) => {
    const updated = [...variants];
    updated[idx][field] = value;
    setVariants(updated);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast("Service name is required", "warning");
      return;
    }
    if (!basePrice || Number(basePrice) <= 0) {
      toast("Base price must be greater than 0", "warning");
      return;
    }

    setLoading(true);
    try {
      const data: any = {
        name: name.trim(),
        category_id: categoryId ? Number(categoryId) : undefined,
        base_price: Number(basePrice),
        discounted_price: discountedPrice ? Number(discountedPrice) : undefined,
        price_unit: priceUnit,
        duration_minutes: duration ? Number(duration) : 0,
        description: description.trim() || undefined,
        image: image.trim() || undefined,
        variants: variants
          .filter((v) => v.name.trim() && v.price)
          .map((v) => ({ name: v.name.trim(), price: Number(v.price) })),
      };

      if (isEdit) {
        await updateVendorService(editId!, data);
        toast("Service updated", "success");
      } else {
        await createVendorService(data);
        toast("Service created", "success");
      }
      router.push("/vendor/services");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to save service", "error");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none";

  if (fetchingEdit) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header with back */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <h2 className="text-xl font-bold text-gray-900">
          {isEdit ? "Edit Service" : "Add New Service"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
          <h3 className="text-base font-semibold text-gray-900">Service Details</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={`${inputCls} bg-white`}>
              <option value="">Select category</option>
              {flatCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.isChild ? `  \u2014 ${c.name}` : c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Service template suggestions */}
          {categoryId && (() => {
            const selectedCat = allCategories.find((c) => String(c.id) === categoryId);
            const templates = selectedCat?.children || [];
            if (templates.length === 0) return null;
            return (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Quick pick a service template:</label>
                <div className="flex flex-wrap gap-2">
                  {templates.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setName(t.name)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
                        name === t.name
                          ? "bg-primary-50 border-primary-300 text-primary-700"
                          : "bg-white border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-600"
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Name <span className="text-red-500">*</span>
            </label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. AC Deep Cleaning, or pick from templates above" className={inputCls} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Describe your service..." className={`${inputCls} resize-none`} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input type="url" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://example.com/image.jpg" className={inputCls} />
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
          <h3 className="text-base font-semibold text-gray-900">Pricing & Duration</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base Price (Rs.) <span className="text-red-500">*</span>
              </label>
              <input type="number" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} min="0" step="1" placeholder="500" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discounted Price</label>
              <input type="number" value={discountedPrice} onChange={(e) => setDiscountedPrice(e.target.value)} min="0" step="1" placeholder="Optional" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price Unit</label>
              <select value={priceUnit} onChange={(e) => setPriceUnit(e.target.value)} className={`${inputCls} bg-white`}>
                {PRICE_UNITS.map((u) => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
            <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} min="0" placeholder="e.g. 60" className={inputCls} />
          </div>
        </div>

        {/* Variants */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Service Variants</h3>
              <p className="text-xs text-gray-500 mt-0.5">Optional — add different options with custom pricing</p>
            </div>
            <button
              type="button"
              onClick={addVariant}
              className="px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Variant
            </button>
          </div>

          {variants.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              No variants. E.g. &quot;1 Ton AC&quot; Rs.500, &quot;1.5 Ton AC&quot; Rs.700
            </p>
          ) : (
            <div className="space-y-3">
              {variants.map((variant, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <input type="text" value={variant.name} onChange={(e) => updateVariant(idx, "name", e.target.value)} placeholder="Variant name" className={`flex-1 ${inputCls}`} />
                  <input type="number" value={variant.price} onChange={(e) => updateVariant(idx, "price", e.target.value)} placeholder="Price" min="0" className={`w-28 ${inputCls}`} />
                  <button type="button" onClick={() => removeVariant(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pb-6">
          <button type="button" onClick={() => router.back()} className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors">
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {loading ? "Saving..." : isEdit ? "Update Service" : "Create Service"}
          </button>
        </div>
      </form>
    </div>
  );
}
