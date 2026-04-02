"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getBusinessById,
  updateBusiness,
  getAdminCategories,
  getAdminCities,
  AdminBusiness,
  AdminCategory,
  AdminCity,
} from "@/lib/admin-api";
import { useToast } from "@/components/admin/Toast";
import FormField from "@/components/admin/FormField";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

interface BusinessHour {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

function parseHours(raw?: string): BusinessHour[] {
  const defaults = DAYS.map((d) => ({
    day: d,
    open: "09:00",
    close: "18:00",
    closed: false,
  }));
  if (!raw) return defaults;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return defaults;
  } catch {
    return defaults;
  }
}

export default function EditBusinessPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id as string;

  const [form, setForm] = useState<Partial<AdminBusiness>>({});
  const [hours, setHours] = useState<BusinessHour[]>(parseHours());
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [cities, setCities] = useState<AdminCity[]>([]);
  const [serviceAreaIds, setServiceAreaIds] = useState<Set<number>>(new Set());
  const [categoryIds, setCategoryIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [bizRes, catRes, cityRes] = await Promise.all([
          getBusinessById(id),
          getAdminCategories(),
          getAdminCities(),
        ]);
        const biz = bizRes.data;
        setForm(biz);
        setHours(parseHours(biz.business_hours));
        setCategories(catRes.data || []);
        setCities(cityRes.data || []);
        // Load service areas
        if (biz.service_areas && Array.isArray(biz.service_areas)) {
          setServiceAreaIds(new Set(biz.service_areas.map((a: any) => a.city_id)));
        }
        // Load categories
        if (biz.categories && Array.isArray(biz.categories)) {
          setCategoryIds(new Set(biz.categories.map((c: any) => c.id)));
        }
      } catch (err) {
        toast(
          err instanceof Error ? err.message : "Failed to load business",
          "error"
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, toast]);

  const onChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name: field, value } = e.target;
    const updates: Partial<AdminBusiness> = { [field]: value };

    // Auto-set state_id when city changes
    if (field === "city_id") {
      const city = cities.find((c) => String(c.id) === value);
      if (city?.state_id) {
        updates.state_id = city.state_id;
        updates.state_name = city.state_name;
      }
    }

    setForm({ ...form, ...updates });
  };

  const updateHour = (
    idx: number,
    field: keyof BusinessHour,
    value: string | boolean
  ) => {
    const next = [...hours];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (next[idx] as any)[field] = value;
    setHours(next);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateBusiness(id, {
        ...form,
        business_hours: JSON.stringify(hours),
        service_area_ids: Array.from(serviceAreaIds),
        category_ids: Array.from(categoryIds),
      } as any);
      toast("Business updated successfully", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  // Only parent categories are selectable (children = services under them)
  const parentCategories: { label: string; value: number }[] = [];
  const hasNested = categories.some((c) => c.children && c.children.length > 0);
  if (hasNested) {
    categories.forEach((c) => {
      parentCategories.push({ label: c.name, value: c.id });
    });
  } else {
    categories.filter((c) => !c.parent_id).forEach((c) => {
      parentCategories.push({ label: c.name, value: c.id });
    });
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <h2 className="text-xl font-bold text-gray-900">
          Edit: {form.name}
        </h2>
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            type="text"
            label="Business Name"
            name="name"
            value={form.name || ""}
            onChange={onChange}
            required
          />
          <FormField
            type="text"
            label="Slug"
            name="slug"
            value={form.slug || ""}
            onChange={onChange}
            helpText="URL-friendly identifier"
          />
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {parentCategories.map((c) => {
                const isSelected = categoryIds.has(c.value);
                return (
                  <label
                    key={c.value}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-primary-50 border-primary-300"
                        : "bg-white border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {
                        setCategoryIds((prev) => {
                          const next = new Set(prev);
                          if (next.has(c.value)) next.delete(c.value);
                          else next.add(c.value);
                          return next;
                        });
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className={`text-xs font-medium ${isSelected ? "text-primary-700" : "text-gray-600"}`}>
                      {c.label}
                    </span>
                  </label>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 mt-1">{categoryIds.size} selected. Services are added under these categories.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Owner User ID</label>
            <input
              type="number"
              name="owner_user_id"
              value={form.owner_user_id || ""}
              onChange={onChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              placeholder="Vendor user ID"
            />
          </div>
          <FormField
            type="textarea"
            label="Description"
            name="description"
            value={form.description || ""}
            onChange={onChange}
            className="md:col-span-2"
            rows={4}
          />
          <FormField
            type="textarea"
            label="Short Description"
            name="short_description"
            value={form.short_description || ""}
            onChange={onChange}
            className="md:col-span-2"
            rows={2}
          />
        </div>
      </div>

      {/* Location */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          Location
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            type="textarea"
            label="Address"
            name="address"
            value={form.address || ""}
            onChange={onChange}
            className="md:col-span-2"
            rows={2}
          />
          <FormField
            type="select"
            label="City"
            name="city_id"
            value={form.city_id || ""}
            onChange={onChange}
            options={[
              { label: "-- Select City --", value: "" },
              ...cities.map((c) => ({ label: c.name, value: c.id })),
            ]}
          />
          <FormField
            type="text"
            label="Locality"
            name="locality_name"
            value={form.locality_name || ""}
            onChange={onChange}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <input
              type="text"
              value={form.state_name || ""}
              readOnly
              className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2.5 text-sm text-gray-500"
              placeholder="Auto-set from city"
            />
            <p className="text-xs text-gray-400 mt-1">Auto-updated when city changes</p>
          </div>
          <FormField
            type="text"
            label="PIN Code"
            name="pin_code"
            value={form.pin_code || ""}
            onChange={onChange}
          />
        </div>

        {/* Service Areas */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Service Areas (cities where this business operates)
          </label>
          <div className="flex flex-wrap gap-2">
            {cities.map((city) => {
              const isSelected = serviceAreaIds.has(city.id);
              return (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => {
                    setServiceAreaIds((prev) => {
                      const next = new Set(prev);
                      if (next.has(city.id)) next.delete(city.id);
                      else next.add(city.id);
                      return next;
                    });
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
                    isSelected
                      ? "bg-primary-50 border-primary-300 text-primary-700"
                      : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {city.name}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {serviceAreaIds.size} {serviceAreaIds.size === 1 ? "city" : "cities"} selected
          </p>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          Contact Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            type="tel"
            label="Phone"
            name="phone"
            value={form.phone || ""}
            onChange={onChange}
          />
          <FormField
            type="tel"
            label="Mobile"
            name="mobile"
            value={form.mobile || ""}
            onChange={onChange}
          />
          <FormField
            type="email"
            label="Email"
            name="email"
            value={form.email || ""}
            onChange={onChange}
          />
          <FormField
            type="url"
            label="Website"
            name="website"
            value={form.website || ""}
            onChange={onChange}
          />
        </div>
      </div>

      {/* Status & Approval */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Status & Approval</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Status</label>
            <select
              name="status"
              value={form.status || "pending"}
              onChange={onChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-6 mt-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={!!form.is_verified} onChange={() => setForm({ ...form, is_verified: form.is_verified ? 0 : 1 } as any)} className="w-5 h-5 accent-primary-500 rounded" />
            <span className="text-sm font-medium text-gray-700">Verified</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={!!form.is_featured} onChange={() => setForm({ ...form, is_featured: form.is_featured ? 0 : 1 } as any)} className="w-5 h-5 accent-accent-500 rounded" />
            <span className="text-sm font-medium text-gray-700">Featured</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={!!form.is_active} onChange={() => setForm({ ...form, is_active: form.is_active ? 0 : 1 } as any)} className="w-5 h-5 accent-green-500 rounded" />
            <span className="text-sm font-medium text-gray-700">Active</span>
          </label>
        </div>
      </div>

      {/* Business Hours */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          Business Hours
        </h3>
        <div className="space-y-3">
          {hours.map((h, idx) => (
            <div
              key={h.day}
              className="flex items-center gap-4 flex-wrap"
            >
              <span className="w-24 text-sm font-medium text-gray-700">
                {h.day}
              </span>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={h.closed}
                  onChange={(e) =>
                    updateHour(idx, "closed", e.target.checked)
                  }
                  className="rounded border-gray-300 text-primary-600"
                />
                Closed
              </label>
              {!h.closed && (
                <>
                  <input
                    type="time"
                    value={h.open}
                    onChange={(e) =>
                      updateHour(idx, "open", e.target.value)
                    }
                    className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm"
                  />
                  <span className="text-gray-400">to</span>
                  <input
                    type="time"
                    value={h.close}
                    onChange={(e) =>
                      updateHour(idx, "close", e.target.value)
                    }
                    className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm"
                  />
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* SEO */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          SEO Settings
        </h3>
        <div className="grid grid-cols-1 gap-4">
          <FormField
            type="text"
            label="Meta Title"
            name="meta_title"
            value={form.meta_title || ""}
            onChange={onChange}
            helpText="Leave empty to auto-generate"
          />
          <FormField
            type="textarea"
            label="Meta Description"
            name="meta_description"
            value={form.meta_description || ""}
            onChange={onChange}
            rows={3}
            helpText="Recommended 150-160 characters"
          />
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end gap-3 pb-8">
        <button
          onClick={() => router.back()}
          className="px-5 py-2.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-60 transition-colors"
        >
          {saving && (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
