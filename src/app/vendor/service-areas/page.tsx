"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/admin/Toast";
import { getServiceAreas, updateServiceAreas, ServiceArea } from "@/lib/vendor-api";

interface CityItem {
  id: number;
  name: string;
  slug: string;
  state_name?: string;
}

export default function VendorServiceAreasPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [areas, setAreas] = useState<ServiceArea[]>([]);
  const [cities, setCities] = useState<CityItem[]>([]);
  const [selectedCities, setSelectedCities] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [areasRes, citiesRes] = await Promise.all([
          getServiceAreas(),
          fetch("/proxy-api/cities").then((r) => r.json()),
        ]);

        const areaList = Array.isArray(areasRes.data) ? areasRes.data : [];
        setAreas(areaList);
        setSelectedCities(new Set(areaList.map((a) => a.city_id)));

        const cityList = citiesRes.data?.cities || citiesRes.data || [];
        setCities(Array.isArray(cityList) ? cityList : []);
      } catch {
        toast("Failed to load data", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleCity = (cityId: number) => {
    setSelectedCities((prev) => {
      const next = new Set(prev);
      if (next.has(cityId)) {
        next.delete(cityId);
      } else {
        next.add(cityId);
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (selectedCities.size === 0) {
      toast("Select at least one city", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await updateServiceAreas(Array.from(selectedCities));
      const updated = Array.isArray(res.data) ? res.data : [];
      setAreas(updated);
      setSelectedCities(new Set(updated.map((a) => a.city_id)));
      toast("Service areas updated", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  // Group cities by state
  const stateGroups: Record<string, CityItem[]> = {};
  cities.forEach((c) => {
    const state = c.state_name || "Other";
    if (!stateGroups[state]) stateGroups[state] = [];
    stateGroups[state].push(c);
  });

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
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Service Areas</h2>
          <p className="text-sm text-gray-500">Select cities where you provide services</p>
        </div>
      </div>

      {/* Selected count */}
      <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          <span className="text-sm font-medium text-primary-800">
            {selectedCities.size} {selectedCities.size === 1 ? "city" : "cities"} selected
          </span>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          {saving ? "Saving..." : "Save Areas"}
        </button>
      </div>

      {/* City selection by state */}
      {Object.entries(stateGroups).map(([state, stateCities]) => (
        <div key={state} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700">{state}</h3>
          </div>
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {stateCities.map((city) => {
              const isSelected = selectedCities.has(city.id);
              return (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => toggleCity(city.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                    isSelected
                      ? "bg-primary-50 border-primary-300 text-primary-700"
                      : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                    isSelected ? "bg-primary-600 border-primary-600" : "border-gray-300"
                  }`}>
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </div>
                  {city.name}
                </button>
              );
            })}
          </div>
        </div>
      ))}

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
          {saving ? "Saving..." : "Save Service Areas"}
        </button>
      </div>
    </div>
  );
}
