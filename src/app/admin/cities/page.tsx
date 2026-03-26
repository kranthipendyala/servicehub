"use client";

import { useEffect, useState, ChangeEvent } from "react";
import {
  getAdminCities,
  createCity,
  updateCity,
  getLocalities,
  AdminCity,
  AdminLocality,
} from "@/lib/admin-api";
import { useToast } from "@/components/admin/Toast";
import Modal from "@/components/admin/Modal";
import FormField from "@/components/admin/FormField";

const emptyCity = {
  name: "",
  slug: "",
  state_name: "",
  meta_title: "",
  meta_description: "",
};

export default function AdminCitiesPage() {
  const { toast } = useToast();
  const [cities, setCities] = useState<AdminCity[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCity | null>(null);
  const [form, setForm] = useState(emptyCity);
  const [saving, setSaving] = useState(false);

  // Expanded city -> localities
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [localities, setLocalities] = useState<AdminLocality[]>([]);
  const [loadingLocalities, setLoadingLocalities] = useState(false);

  const load = async () => {
    try {
      const res = await getAdminCities();
      setCities(res.data || []);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to load", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleExpand = async (city: AdminCity) => {
    if (expandedId === city.id) {
      setExpandedId(null);
      setLocalities([]);
      return;
    }
    setExpandedId(city.id);
    setLoadingLocalities(true);
    try {
      const res = await getLocalities(city.id);
      setLocalities(res.data || []);
    } catch {
      setLocalities([]);
    } finally {
      setLoadingLocalities(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm(emptyCity);
    setModalOpen(true);
  };

  const openEdit = (city: AdminCity) => {
    setEditing(city);
    setForm({
      name: city.name,
      slug: city.slug,
      state_name: city.state_name || "",
      meta_title: city.meta_title || "",
      meta_description: city.meta_description || "",
    });
    setModalOpen(true);
  };

  const onChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "name" && !editing) {
        next.slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!form.name) {
      toast("City name is required", "warning");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await updateCity(editing.id, form as Partial<AdminCity>);
        toast("City updated", "success");
      } else {
        await createCity(form as Partial<AdminCity>);
        toast("City created", "success");
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  const [search, setSearch] = useState("");
  const filtered = search
    ? cities.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          (c.state_name || "").toLowerCase().includes(search.toLowerCase())
      )
    : cities;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-72">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search cities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add City
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="w-10 px-4 py-3" />
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                City
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                State
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Businesses
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Localities
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                  No cities found
                </td>
              </tr>
            ) : (
              filtered.map((city) => (
                <>
                  <tr key={city.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleExpand(city)}
                        className="p-0.5 rounded hover:bg-gray-200 text-gray-400"
                      >
                        <svg
                          className={`w-4 h-4 transition-transform ${expandedId === city.id ? "rotate-90" : ""}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </button>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {city.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {city.state_name || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {city.business_count ?? 0}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {city.locality_count ?? 0}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openEdit(city)}
                        className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                  {expandedId === city.id && (
                    <tr key={`${city.id}-localities`}>
                      <td colSpan={6} className="bg-gray-50 px-8 py-3">
                        {loadingLocalities ? (
                          <p className="text-sm text-gray-500 animate-pulse">
                            Loading localities...
                          </p>
                        ) : localities.length === 0 ? (
                          <p className="text-sm text-gray-400">
                            No localities found for this city
                          </p>
                        ) : (
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                            {localities.map((loc) => (
                              <div
                                key={loc.id}
                                className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-200"
                              >
                                <div>
                                  <p className="text-sm font-medium text-gray-800">
                                    {loc.name}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {loc.business_count ?? 0} businesses
                                    {loc.pincode && ` | ${loc.pincode}`}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit City" : "Add City"}
      >
        <div className="space-y-4">
          <FormField type="text" label="City Name" name="name" value={form.name} onChange={onChange} required />
          <FormField type="text" label="Slug" name="slug" value={form.slug} onChange={onChange} />
          <FormField type="text" label="State" name="state_name" value={form.state_name} onChange={onChange} />
          <FormField type="text" label="Meta Title" name="meta_title" value={form.meta_title} onChange={onChange} />
          <FormField type="textarea" label="Meta Description" name="meta_description" value={form.meta_description} onChange={onChange} rows={2} />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60">
            {saving ? "Saving..." : editing ? "Update" : "Create"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
