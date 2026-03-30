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

const CATEGORIES = [
  { id: 1, name: "AC Repair & Service" },
  { id: 2, name: "Plumbing" },
  { id: 3, name: "Electrical" },
  { id: 4, name: "Carpentry" },
  { id: 5, name: "Painting" },
  { id: 6, name: "Cleaning" },
  { id: 7, name: "Pest Control" },
  { id: 8, name: "Appliance Repair" },
  { id: 9, name: "Home Renovation" },
  { id: 10, name: "Other" },
];

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
  const isEdit = !!editId;
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [fetchingEdit, setFetchingEdit] = useState(isEdit);

  // Form fields
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [discountedPrice, setDiscountedPrice] = useState("");
  const [priceUnit, setPriceUnit] = useState("fixed");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [variants, setVariants] = useState<VariantInput[]>([]);

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
          setPriceUnit(svc.price_unit);
          setDuration(String(svc.duration_minutes));
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

  const addVariant = () => {
    setVariants([...variants, { name: "", price: "" }]);
  };

  const removeVariant = (idx: number) => {
    setVariants(variants.filter((_, i) => i !== idx));
  };

  const updateVariant = (
    idx: number,
    field: "name" | "price",
    value: string
  ) => {
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
        discounted_price: discountedPrice
          ? Number(discountedPrice)
          : undefined,
        price_unit: priceUnit,
        duration_minutes: duration ? Number(duration) : 0,
        description: description.trim() || undefined,
        image: image.trim() || undefined,
        variants: variants
          .filter((v) => v.name.trim() && v.price)
          .map((v) => ({
            name: v.name.trim(),
            price: Number(v.price),
          })),
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
      toast(
        err instanceof Error ? err.message : "Failed to save service",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetchingEdit) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href="/vendor/services"
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to Services
        </Link>
        <h2 className="text-xl font-bold text-gray-900">
          {isEdit ? "Edit Service" : "Add New Service"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. AC Deep Cleaning"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            >
              <option value="">Select category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base Price (Rs.) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discounted Price (Rs.)
              </label>
              <input
                type="number"
                value={discountedPrice}
                onChange={(e) => setDiscountedPrice(e.target.value)}
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price Unit
              </label>
              <select
                value={priceUnit}
                onChange={(e) => setPriceUnit(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              >
                {PRICE_UNITS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              min="0"
              placeholder="e.g. 60"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe your service..."
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image URL
            </label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>
        </div>

        {/* Variants */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">
              Service Variants
            </h3>
            <button
              type="button"
              onClick={addVariant}
              className="px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Variant
            </button>
          </div>

          {variants.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              No variants added. Variants allow different pricing options.
            </p>
          ) : (
            <div className="space-y-3">
              {variants.map((variant, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={variant.name}
                    onChange={(e) =>
                      updateVariant(idx, "name", e.target.value)
                    }
                    placeholder="Variant name"
                    className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                  <input
                    type="number"
                    value={variant.price}
                    onChange={(e) =>
                      updateVariant(idx, "price", e.target.value)
                    }
                    placeholder="Price"
                    min="0"
                    step="0.01"
                    className="w-32 px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => removeVariant(idx)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Link
            href="/vendor/services"
            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {loading
              ? "Saving..."
              : isEdit
              ? "Update Service"
              : "Create Service"}
          </button>
        </div>
      </form>
    </div>
  );
}
