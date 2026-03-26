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
        setHours(parseHours(biz.opening_hours));
        setCategories(catRes.data || []);
        setCities(cityRes.data || []);
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
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onToggle = (field: string, value: boolean) => {
    setForm({ ...form, [field]: value ? 1 : 0 });
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
        opening_hours: JSON.stringify(hours),
      });
      toast("Business updated successfully", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  // Flatten categories for select
  const flatCats: { label: string; value: number }[] = [];
  const flatten = (cats: AdminCategory[], prefix = "") => {
    cats.forEach((c) => {
      flatCats.push({ label: prefix + c.name, value: c.id });
      if (c.children) flatten(c.children, prefix + "-- ");
    });
  };
  flatten(categories);

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
      <div className="flex items-center justify-between">
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
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-60 transition-colors"
        >
          {saving && (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          {saving ? "Saving..." : "Save Changes"}
        </button>
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
          <FormField
            type="text"
            label="State"
            name="state_name"
            value={form.state_name || ""}
            onChange={onChange}
          />
          <FormField
            type="text"
            label="PIN Code"
            name="pin_code"
            value={form.pin_code || ""}
            onChange={onChange}
          />
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

      {/* Category & Status */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          Category & Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            type="select"
            label="Category"
            name="category_id"
            value={form.category_id || ""}
            onChange={onChange}
            required
            options={[
              { label: "-- Select Category --", value: "" },
              ...flatCats.map((c) => ({ label: c.label, value: c.value })),
            ]}
          />
          <FormField
            type="select"
            label="Status"
            name="status"
            value={form.status || "pending"}
            onChange={onChange}
            options={[
              { label: "Pending", value: "pending" },
              { label: "Approved / Active", value: "active" },
              { label: "Rejected", value: "rejected" },
              { label: "Suspended", value: "suspended" },
            ]}
          />
          <FormField
            type="toggle"
            label="Verified"
            name="is_verified"
            checked={!!form.is_verified}
            onChange={(v) => onToggle("is_verified", v)}
          />
          <FormField
            type="toggle"
            label="Featured"
            name="is_featured"
            checked={!!form.is_featured}
            onChange={(v) => onToggle("is_featured", v)}
          />
          <FormField
            type="toggle"
            label="Active"
            name="is_active"
            checked={form.is_active !== 0 && form.is_active !== false}
            onChange={(v) => onToggle("is_active", v)}
          />
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

      {/* Bottom Save */}
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
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-60 transition-colors"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
