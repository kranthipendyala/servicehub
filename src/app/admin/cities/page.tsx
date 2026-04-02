"use client";

import { useEffect, useState, ChangeEvent } from "react";
import {
  getAdminCities,
  createCity,
  updateCity,
  getLocalities,
  createLocality,
  updateLocality,
  deleteLocality,
  AdminCity,
  AdminLocality,
} from "@/lib/admin-api";
import { useToast } from "@/components/admin/Toast";
import Modal from "@/components/admin/Modal";
import FormField from "@/components/admin/FormField";

interface StateItem { id: number; name: string; slug: string; }

const emptyCityForm = { name: "", state_id: "", meta_title: "", meta_description: "" };
const emptyLocalityForm = { name: "" };

export default function AdminCitiesPage() {
  const { toast } = useToast();
  const [cities, setCities] = useState<AdminCity[]>([]);
  const [states, setStates] = useState<StateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // City modal
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<AdminCity | null>(null);
  const [cityForm, setCityForm] = useState(emptyCityForm);
  const [savingCity, setSavingCity] = useState(false);

  // Localities
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [localities, setLocalities] = useState<AdminLocality[]>([]);
  const [loadingLoc, setLoadingLoc] = useState(false);

  // Locality modal
  const [locModalOpen, setLocModalOpen] = useState(false);
  const [editingLoc, setEditingLoc] = useState<AdminLocality | null>(null);
  const [locForm, setLocForm] = useState(emptyLocalityForm);
  const [locCityId, setLocCityId] = useState<number>(0);
  const [savingLoc, setSavingLoc] = useState(false);

  const load = async () => {
    try {
      const [cityRes, stateRes] = await Promise.all([
        getAdminCities(),
        fetch("/proxy-api/cities").then((r) => r.json()).catch(() => ({ data: { cities: [] } })),
      ]);
      setCities(cityRes.data || []);
      // Extract unique states from cities
      const stateMap = new Map<number, StateItem>();
      const cityList = stateRes.data?.cities || stateRes.data || [];
      (Array.isArray(cityList) ? cityList : []).forEach((c: any) => {
        if (c.state_id && c.state_name) {
          stateMap.set(Number(c.state_id), { id: Number(c.state_id), name: c.state_name, slug: c.state_slug || "" });
        }
      });
      setStates(Array.from(stateMap.values()).sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to load", "error");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Expand city → load localities
  const handleExpand = async (city: AdminCity) => {
    if (expandedId === city.id) { setExpandedId(null); setLocalities([]); return; }
    setExpandedId(city.id);
    setLoadingLoc(true);
    try {
      const res = await getLocalities(city.id);
      setLocalities(res.data || []);
    } catch { setLocalities([]); }
    finally { setLoadingLoc(false); }
  };

  // City CRUD
  const openAddCity = () => { setEditingCity(null); setCityForm(emptyCityForm); setCityModalOpen(true); };
  const openEditCity = (city: AdminCity) => {
    setEditingCity(city);
    setCityForm({
      name: city.name,
      state_id: city.state_id ? String(city.state_id) : "",
      meta_title: city.meta_title || "",
      meta_description: city.meta_description || "",
    });
    setCityModalOpen(true);
  };

  const handleSaveCity = async () => {
    if (!cityForm.name) { toast("City name is required", "warning"); return; }
    if (!cityForm.state_id) { toast("Select a state", "warning"); return; }
    setSavingCity(true);
    try {
      const data = { name: cityForm.name, state_id: Number(cityForm.state_id), meta_title: cityForm.meta_title, meta_description: cityForm.meta_description };
      if (editingCity) {
        await updateCity(editingCity.id, data as any);
        toast("City updated", "success");
      } else {
        await createCity(data as any);
        toast("City created", "success");
      }
      setCityModalOpen(false);
      load();
    } catch (err) { toast(err instanceof Error ? err.message : "Failed to save", "error"); }
    finally { setSavingCity(false); }
  };

  // Locality CRUD
  const openAddLocality = (cityId: number) => { setEditingLoc(null); setLocForm(emptyLocalityForm); setLocCityId(cityId); setLocModalOpen(true); };
  const openEditLocality = (loc: AdminLocality, cityId: number) => {
    setEditingLoc(loc); setLocForm({ name: loc.name }); setLocCityId(cityId); setLocModalOpen(true);
  };

  const handleSaveLocality = async () => {
    if (!locForm.name) { toast("Locality name is required", "warning"); return; }
    setSavingLoc(true);
    try {
      if (editingLoc) {
        await updateLocality(editingLoc.id, { name: locForm.name } as any);
        toast("Locality updated", "success");
      } else {
        await createLocality({ name: locForm.name, city_id: locCityId } as any);
        toast("Locality created", "success");
      }
      setLocModalOpen(false);
      // Refresh localities
      const res = await getLocalities(locCityId);
      setLocalities(res.data || []);
    } catch (err) { toast(err instanceof Error ? err.message : "Failed to save", "error"); }
    finally { setSavingLoc(false); }
  };

  const handleDeleteLocality = async (loc: AdminLocality) => {
    if (!confirm(`Delete locality "${loc.name}"?`)) return;
    try {
      await deleteLocality(loc.id);
      toast("Locality deleted", "success");
      setLocalities(localities.filter((l) => l.id !== loc.id));
    } catch (err) { toast(err instanceof Error ? err.message : "Failed to delete", "error"); }
  };

  const filtered = search
    ? cities.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || (c.state_name || "").toLowerCase().includes(search.toLowerCase()))
    : cities;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-72">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input type="text" placeholder="Search cities..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{cities.length} cities</span>
          <button onClick={openAddCity} className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Add City
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="w-10 px-4 py-3" />
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">City</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">State</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Businesses</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Localities</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 6 }).map((__, j) => (<td key={j} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse" /></td>))}</tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-500">No cities found</td></tr>
            ) : (
              filtered.map((city) => (
                <tr key={city.id} className="group">
                  <td className="px-4 py-3" colSpan={expandedId === city.id ? undefined : undefined}>
                    <button onClick={() => handleExpand(city)} className="p-0.5 rounded hover:bg-gray-200 text-gray-400">
                      <svg className={`w-4 h-4 transition-transform ${expandedId === city.id ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </button>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{city.name}</td>
                  <td className="px-4 py-3 text-gray-600">{city.state_name || "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{city.business_count ?? 0}</td>
                  <td className="px-4 py-3 text-gray-600">{city.locality_count ?? 0}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openAddLocality(city.id)} className="p-1.5 rounded-md hover:bg-blue-50 text-blue-600" title="Add locality">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                      </button>
                      <button onClick={() => openEditCity(city)} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600" title="Edit city">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Expanded localities panel */}
        {expandedId && (
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-700">
                Localities in {cities.find((c) => c.id === expandedId)?.name}
              </h4>
              <button onClick={() => openAddLocality(expandedId)} className="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                Add Locality
              </button>
            </div>
            {loadingLoc ? (
              <p className="text-sm text-gray-400 animate-pulse">Loading...</p>
            ) : localities.length === 0 ? (
              <p className="text-sm text-gray-400">No localities yet</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {localities.map((loc) => (
                  <div key={loc.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-200">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{loc.name}</p>
                      <p className="text-xs text-gray-400">{loc.business_count ?? 0} businesses</p>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <button onClick={() => openEditLocality(loc, expandedId)} className="p-1 rounded hover:bg-gray-100 text-gray-400" title="Edit">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
                      </button>
                      <button onClick={() => handleDeleteLocality(loc)} className="p-1 rounded hover:bg-red-50 text-red-400" title="Delete">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* City Modal */}
      <Modal open={cityModalOpen} onClose={() => setCityModalOpen(false)} title={editingCity ? "Edit City" : "Add City"}>
        <div className="space-y-4">
          <FormField type="text" label="City Name" name="name" value={cityForm.name} onChange={(e) => setCityForm({ ...cityForm, name: e.target.value })} required />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
            <select value={cityForm.state_id} onChange={(e) => setCityForm({ ...cityForm, state_id: e.target.value })} className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 bg-white" required>
              <option value="">Select state</option>
              {states.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
            </select>
          </div>
          <FormField type="text" label="Meta Title" name="meta_title" value={cityForm.meta_title} onChange={(e) => setCityForm({ ...cityForm, meta_title: (e.target as HTMLInputElement).value })} />
          <FormField type="textarea" label="Meta Description" name="meta_description" value={cityForm.meta_description} onChange={(e) => setCityForm({ ...cityForm, meta_description: (e.target as HTMLTextAreaElement).value })} rows={2} />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setCityModalOpen(false)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSaveCity} disabled={savingCity} className="px-4 py-2 text-sm rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60">
            {savingCity ? "Saving..." : editingCity ? "Update" : "Create"}
          </button>
        </div>
      </Modal>

      {/* Locality Modal */}
      <Modal open={locModalOpen} onClose={() => setLocModalOpen(false)} title={editingLoc ? "Edit Locality" : "Add Locality"}>
        <div className="space-y-4">
          <FormField type="text" label="Locality Name" name="name" value={locForm.name} onChange={(e) => setLocForm({ name: (e.target as HTMLInputElement).value })} required />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setLocModalOpen(false)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSaveLocality} disabled={savingLoc} className="px-4 py-2 text-sm rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60">
            {savingLoc ? "Saving..." : editingLoc ? "Update" : "Create"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
