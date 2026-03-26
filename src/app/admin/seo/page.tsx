"use client";

import { useState, ChangeEvent } from "react";
import { saveSeoMeta, AdminSeoMeta } from "@/lib/admin-api";
import { useToast } from "@/components/admin/Toast";
import FormField from "@/components/admin/FormField";

const pageTypes = [
  { label: "Homepage", value: "homepage" },
  { label: "City", value: "city" },
  { label: "Category", value: "category" },
  { label: "City + Category", value: "city_category" },
  { label: "Locality", value: "locality" },
  { label: "Business", value: "business" },
  { label: "Search", value: "search" },
  { label: "Custom Page", value: "custom" },
];

const emptyForm: AdminSeoMeta = {
  page_type: "homepage",
  reference_slug: "",
  meta_title: "",
  meta_description: "",
  og_title: "",
  og_description: "",
  og_image: "",
  canonical_url: "",
  h1_override: "",
  no_index: false,
};

export default function AdminSeoPage() {
  const { toast } = useToast();
  const [entries, setEntries] = useState<AdminSeoMeta[]>([]);
  const [form, setForm] = useState<AdminSeoMeta>({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const onChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!form.page_type || !form.meta_title) {
      toast("Page type and meta title are required", "warning");
      return;
    }
    setSaving(true);
    try {
      await saveSeoMeta(form);
      toast("SEO meta saved successfully", "success");

      if (editingIndex !== null) {
        const updated = [...entries];
        updated[editingIndex] = { ...form };
        setEntries(updated);
        setEditingIndex(null);
      } else {
        setEntries([...entries, { ...form }]);
      }
      setForm({ ...emptyForm });
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  const editEntry = (idx: number) => {
    setEditingIndex(idx);
    setForm({ ...entries[idx] });
  };

  const removeEntry = (idx: number) => {
    setEntries(entries.filter((_, i) => i !== idx));
    if (editingIndex === idx) {
      setEditingIndex(null);
      setForm({ ...emptyForm });
    }
  };

  // Google preview
  const previewTitle = form.meta_title || "Page Title";
  const previewDesc = form.meta_description || "Description of the page will appear here...";
  const previewUrl =
    form.canonical_url ||
    `https://example.com/${form.page_type}/${form.reference_slug || ""}`;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* SEO Entry Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          {editingIndex !== null ? "Edit SEO Entry" : "Add SEO Meta Entry"}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            type="select"
            label="Page Type"
            name="page_type"
            value={form.page_type}
            onChange={onChange}
            required
            options={pageTypes}
          />
          <FormField
            type="text"
            label="Reference Slug"
            name="reference_slug"
            value={form.reference_slug || ""}
            onChange={onChange}
            helpText="e.g., city slug, category slug, or business slug"
          />
          <FormField
            type="text"
            label="Meta Title"
            name="meta_title"
            value={form.meta_title}
            onChange={onChange}
            required
            className="md:col-span-2"
            helpText={`${(form.meta_title || "").length}/60 characters`}
          />
          <FormField
            type="textarea"
            label="Meta Description"
            name="meta_description"
            value={form.meta_description || ""}
            onChange={onChange}
            className="md:col-span-2"
            rows={3}
            helpText={`${(form.meta_description || "").length}/160 characters`}
          />
          <FormField
            type="text"
            label="H1 Override"
            name="h1_override"
            value={form.h1_override || ""}
            onChange={onChange}
            className="md:col-span-2"
          />
          <FormField
            type="text"
            label="Canonical URL"
            name="canonical_url"
            value={form.canonical_url || ""}
            onChange={onChange}
            className="md:col-span-2"
          />
        </div>

        <h4 className="text-sm font-semibold text-gray-700 mt-6 mb-3">
          Open Graph
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            type="text"
            label="OG Title"
            name="og_title"
            value={form.og_title || ""}
            onChange={onChange}
          />
          <FormField
            type="text"
            label="OG Image URL"
            name="og_image"
            value={form.og_image || ""}
            onChange={onChange}
          />
          <FormField
            type="textarea"
            label="OG Description"
            name="og_description"
            value={form.og_description || ""}
            onChange={onChange}
            className="md:col-span-2"
            rows={2}
          />
        </div>

        <div className="mt-4">
          <FormField
            type="toggle"
            label="No Index (hide from search engines)"
            name="no_index"
            checked={!!form.no_index}
            onChange={(v) => setForm({ ...form, no_index: v })}
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          {editingIndex !== null && (
            <button
              onClick={() => {
                setEditingIndex(null);
                setForm({ ...emptyForm });
              }}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              Cancel Edit
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 text-sm rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60"
          >
            {saving
              ? "Saving..."
              : editingIndex !== null
              ? "Update Entry"
              : "Save Entry"}
          </button>
        </div>
      </div>

      {/* Google Preview */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          Google Search Preview
        </h3>
        <div className="bg-white rounded-lg p-4 max-w-xl">
          <p className="text-sm text-green-800 truncate">{previewUrl}</p>
          <h4 className="text-xl text-blue-800 hover:underline cursor-pointer leading-tight mt-0.5">
            {previewTitle.length > 60
              ? previewTitle.slice(0, 60) + "..."
              : previewTitle}
          </h4>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {previewDesc.length > 160
              ? previewDesc.slice(0, 160) + "..."
              : previewDesc}
          </p>
        </div>
      </div>

      {/* Saved Entries */}
      {entries.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">
              Saved Entries ({entries.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {entries.map((entry, idx) => (
              <div
                key={idx}
                className="px-6 py-3 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {entry.meta_title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {entry.page_type}
                    {entry.reference_slug && ` / ${entry.reference_slug}`}
                  </p>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <button
                    onClick={() => editEntry(idx)}
                    className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                  </button>
                  <button
                    onClick={() => removeEntry(idx)}
                    className="p-1.5 rounded-md hover:bg-red-50 text-red-500"
                    title="Remove"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
