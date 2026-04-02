"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  createBusiness,
  getAdminCategories,
  getAdminCities,
  AdminCategory,
  AdminCity,
} from "@/lib/admin-api";
import { useToast } from "@/components/admin/Toast";
import FormField from "@/components/admin/FormField";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface BusinessHour { day: string; open: string; close: string; closed: boolean; }

export default function NewBusinessPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: "", slug: "", description: "", short_description: "",
    address: "", pin_code: "", phone: "", mobile: "", email: "", website: "",
    status: "pending", owner_user_id: "",
    meta_title: "", meta_description: "",
  });
  const [hours, setHours] = useState<BusinessHour[]>(
    DAYS.map((d) => ({ day: d, open: "09:00", close: "18:00", closed: false }))
  );
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [cities, setCities] = useState<AdminCity[]>([]);
  const [selectedCatIds, setSelectedCatIds] = useState<Set<number>>(new Set());
  const [selectedCityId, setSelectedCityId] = useState("");
  const [serviceAreaIds, setServiceAreaIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [catRes, cityRes] = await Promise.all([getAdminCategories(), getAdminCities()]);
        setCategories(catRes.data || []);
        setCities(cityRes.data || []);
      } catch (err) {
        toast(err instanceof Error ? err.message : "Failed to load data", "error");
      } finally { setLoading(false); }
    }
    load();
  }, [toast]);

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "name") {
        next.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      }
      return next;
    });

    // Auto-set state and add to service areas when city changes
    if (name === "city_id") {
      setSelectedCityId(value);
      if (value) setServiceAreaIds((prev) => new Set(prev).add(Number(value)));
    }
  };

  const updateHour = (idx: number, field: keyof BusinessHour, value: string | boolean) => {
    const next = [...hours];
    (next[idx] as any)[field] = value;
    setHours(next);
  };

  const handleSave = async () => {
    if (!form.name) { toast("Business name is required", "warning"); return; }
    if (selectedCatIds.size === 0) { toast("Select at least one category", "warning"); return; }
    if (!selectedCityId) { toast("Select a home city", "warning"); return; }

    setSaving(true);
    try {
      // Get state_id from selected city
      const city = cities.find((c) => String(c.id) === selectedCityId);

      await createBusiness({
        ...form,
        city_id: Number(selectedCityId),
        state_id: city?.state_id || undefined,
        category_ids: Array.from(selectedCatIds),
        service_area_ids: Array.from(serviceAreaIds),
        business_hours: JSON.stringify(hours),
        is_verified: 0,
        is_featured: 0,
      } as any);
      toast("Business created successfully", "success");
      router.push("/admin/businesses");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to create", "error");
    } finally { setSaving(false); }
  };

  // Parent categories only
  const parentCategories = categories.filter((c) => !c.parent_id);
  // If nested format
  const hasNested = categories.some((c) => c.children && c.children.length > 0);
  const parentCats = hasNested ? categories : parentCategories;

  const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none";

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (<div key={i} className="h-10 bg-gray-100 rounded" />))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <h2 className="text-xl font-bold text-gray-900">Add New Business</h2>
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField type="text" label="Business Name" name="name" value={form.name} onChange={onChange} required />
          <FormField type="text" label="Slug" name="slug" value={form.slug} onChange={onChange} helpText="Auto-generated" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Owner User ID</label>
            <input type="number" name="owner_user_id" value={form.owner_user_id} onChange={onChange} className={inputCls} placeholder="Vendor user ID (optional)" />
          </div>
          <FormField type="select" label="Status" name="status" value={form.status} onChange={onChange} options={[
            { label: "Pending", value: "pending" },
            { label: "Approved", value: "approved" },
            { label: "Rejected", value: "rejected" },
            { label: "Suspended", value: "suspended" },
          ]} />
          <FormField type="textarea" label="Description" name="description" value={form.description} onChange={onChange} className="md:col-span-2" rows={3} />
          <FormField type="textarea" label="Short Description" name="short_description" value={form.short_description} onChange={onChange} className="md:col-span-2" rows={2} />
        </div>
      </div>

      {/* Categories (checkboxes — parents only) */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Categories</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {parentCats.map((c) => {
            const isSelected = selectedCatIds.has(c.id);
            return (
              <label key={c.id} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${isSelected ? "bg-primary-50 border-primary-300" : "bg-white border-gray-200 hover:border-gray-300"}`}>
                <input type="checkbox" checked={isSelected} onChange={() => {
                  setSelectedCatIds((prev) => { const n = new Set(prev); n.has(c.id) ? n.delete(c.id) : n.add(c.id); return n; });
                }} className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <span className={`text-xs font-medium ${isSelected ? "text-primary-700" : "text-gray-600"}`}>{c.name}</span>
              </label>
            );
          })}
        </div>
        <p className="text-xs text-gray-400 mt-2">{selectedCatIds.size} selected (first = primary)</p>
      </div>

      {/* Location & Service Areas */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Location & Service Areas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField type="textarea" label="Address" name="address" value={form.address} onChange={onChange} className="md:col-span-2" rows={2} />
          <FormField type="select" label="Home City" name="city_id" value={selectedCityId} onChange={onChange} required options={[
            { label: "-- Select City --", value: "" },
            ...cities.map((c) => ({ label: `${c.name}${c.state_name ? ` (${c.state_name})` : ""}`, value: c.id })),
          ]} />
          <FormField type="text" label="PIN Code" name="pin_code" value={form.pin_code} onChange={onChange} />
        </div>

        {/* Service Areas */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Service Areas (additional cities)</label>
          <div className="flex flex-wrap gap-2">
            {cities.map((city) => {
              const isSelected = serviceAreaIds.has(city.id);
              return (
                <button key={city.id} type="button" onClick={() => {
                  setServiceAreaIds((prev) => { const n = new Set(prev); n.has(city.id) ? n.delete(city.id) : n.add(city.id); return n; });
                }} className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${isSelected ? "bg-primary-50 border-primary-300 text-primary-700" : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                  {city.name}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 mt-1">{serviceAreaIds.size} cities selected</p>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Contact Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField type="tel" label="Phone" name="phone" value={form.phone} onChange={onChange} />
          <FormField type="tel" label="Mobile" name="mobile" value={form.mobile} onChange={onChange} />
          <FormField type="email" label="Email" name="email" value={form.email} onChange={onChange} />
          <FormField type="url" label="Website" name="website" value={form.website} onChange={onChange} />
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
          <FormField type="text" label="Meta Title" name="meta_title" value={form.meta_title} onChange={onChange} helpText="Leave empty to auto-generate" />
          <FormField type="textarea" label="Meta Description" name="meta_description" value={form.meta_description} onChange={onChange} rows={3} />
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end gap-3 pb-8">
        <button onClick={() => router.back()} className="px-5 py-2.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50">Cancel</button>
        <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-60 transition-colors">
          {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          {saving ? "Creating..." : "Create Business"}
        </button>
      </div>
    </div>
  );
}
