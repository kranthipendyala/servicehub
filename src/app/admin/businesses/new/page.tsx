"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  createBusiness,
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

export default function NewBusinessPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [form, setForm] = useState<Partial<AdminBusiness>>({
    name: "",
    slug: "",
    description: "",
    short_description: "",
    address: "",
    phone: "",
    mobile: "",
    email: "",
    website: "",
    status: "pending",
    is_verified: 0,
    is_featured: 0,
    meta_title: "",
    meta_description: "",
  });
  const [hours, setHours] = useState<BusinessHour[]>(
    DAYS.map((d) => ({ day: d, open: "09:00", close: "18:00", closed: false }))
  );
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [cities, setCities] = useState<AdminCity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [catRes, cityRes] = await Promise.all([
          getAdminCategories(),
          getAdminCities(),
        ]);
        setCategories(catRes.data || []);
        setCities(cityRes.data || []);
      } catch (err) {
        toast(
          err instanceof Error ? err.message : "Failed to load data",
          "error"
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [toast]);

  const onChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      // Auto-generate slug from name
      if (name === "name") {
        next.slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      }
      return next;
    });
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
    if (!form.name) {
      toast("Business name is required", "warning");
      return;
    }
    if (!form.category_id) {
      toast("Category is required", "warning");
      return;
    }
    if (!form.city_id) {
      toast("City is required", "warning");
      return;
    }

    setSaving(true);
    try {
      await createBusiness({
        ...form,
        opening_hours: JSON.stringify(hours),
      });
      toast("Business created successfully", "success");
      router.push("/admin/businesses");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to create", "error");
    } finally {
      setSaving(false);
    }
  };

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
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
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
            Add New Business
          </h2>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-60 transition-colors"
        >
          {saving ? "Creating..." : "Create Business"}
        </button>
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField type="text" label="Business Name" name="name" value={form.name || ""} onChange={onChange} required />
          <FormField type="text" label="Slug" name="slug" value={form.slug || ""} onChange={onChange} helpText="Auto-generated from name" />
          <FormField type="textarea" label="Description" name="description" value={form.description || ""} onChange={onChange} className="md:col-span-2" rows={4} />
          <FormField type="textarea" label="Short Description" name="short_description" value={form.short_description || ""} onChange={onChange} className="md:col-span-2" rows={2} />
        </div>
      </div>

      {/* Location */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField type="textarea" label="Address" name="address" value={form.address || ""} onChange={onChange} className="md:col-span-2" rows={2} />
          <FormField
            type="select"
            label="City"
            name="city_id"
            value={form.city_id || ""}
            onChange={onChange}
            required
            options={[
              { label: "-- Select City --", value: "" },
              ...cities.map((c) => ({ label: c.name, value: c.id })),
            ]}
          />
          <FormField type="text" label="PIN Code" name="pin_code" value={form.pin_code || ""} onChange={onChange} />
        </div>
      </div>

      {/* Contact */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Contact Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField type="tel" label="Phone" name="phone" value={form.phone || ""} onChange={onChange} />
          <FormField type="tel" label="Mobile" name="mobile" value={form.mobile || ""} onChange={onChange} />
          <FormField type="email" label="Email" name="email" value={form.email || ""} onChange={onChange} />
          <FormField type="url" label="Website" name="website" value={form.website || ""} onChange={onChange} />
        </div>
      </div>

      {/* Category & Status */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Category & Status</h3>
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
            ]}
          />
          <FormField type="toggle" label="Verified" name="is_verified" checked={!!form.is_verified} onChange={(v) => onToggle("is_verified", v)} />
          <FormField type="toggle" label="Featured" name="is_featured" checked={!!form.is_featured} onChange={(v) => onToggle("is_featured", v)} />
        </div>
      </div>

      {/* Business Hours */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Business Hours</h3>
        <div className="space-y-3">
          {hours.map((h, idx) => (
            <div key={h.day} className="flex items-center gap-4 flex-wrap">
              <span className="w-24 text-sm font-medium text-gray-700">{h.day}</span>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" checked={h.closed} onChange={(e) => updateHour(idx, "closed", e.target.checked)} className="rounded border-gray-300 text-primary-600" />
                Closed
              </label>
              {!h.closed && (
                <>
                  <input type="time" value={h.open} onChange={(e) => updateHour(idx, "open", e.target.value)} className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm" />
                  <span className="text-gray-400">to</span>
                  <input type="time" value={h.close} onChange={(e) => updateHour(idx, "close", e.target.value)} className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm" />
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* SEO */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">SEO Settings</h3>
        <div className="grid grid-cols-1 gap-4">
          <FormField type="text" label="Meta Title" name="meta_title" value={form.meta_title || ""} onChange={onChange} helpText="Leave empty to auto-generate" />
          <FormField type="textarea" label="Meta Description" name="meta_description" value={form.meta_description || ""} onChange={onChange} rows={3} />
        </div>
      </div>

      <div className="flex justify-end gap-3 pb-8">
        <button onClick={() => router.back()} className="px-5 py-2.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50">Cancel</button>
        <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-60">
          {saving ? "Creating..." : "Create Business"}
        </button>
      </div>
    </div>
  );
}
