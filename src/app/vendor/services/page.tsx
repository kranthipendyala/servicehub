"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/admin/Toast";
import {
  getVendorServices,
  deleteVendorService,
  updateVendorService,
  getVendorCategories,
  VendorCategory,
} from "@/lib/vendor-api";
import type { Service } from "@/types";

const PRICE_UNIT_LABEL: Record<string, string> = {
  fixed: "Fixed",
  per_hour: "/ hr",
  per_sqft: "/ sq.ft",
  per_unit: "/ unit",
};

export default function VendorServicesPage() {
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<VendorCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const [svcRes, catRes] = await Promise.all([
        getVendorServices(),
        getVendorCategories().catch(() => ({ data: [] })),
      ]);
      setServices(
        Array.isArray(svcRes.data) ? svcRes.data : (svcRes.data as any)?.services || []
      );
      setCategories(Array.isArray(catRes.data) ? catRes.data : []);
    } catch {
      toast("Failed to load services", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleActive = async (service: Service) => {
    try {
      await updateVendorService(service.id, { is_active: !service.is_active });
      toast(`Service ${service.is_active ? "deactivated" : "activated"}`, "success");
      fetchData();
    } catch {
      toast("Failed to update service", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteVendorService(deleteId);
      toast("Service deleted", "success");
      setDeleteId(null);
      fetchData();
    } catch {
      toast("Failed to delete service", "error");
    }
  };

  // Group services by category
  const grouped: Record<number, { name: string; services: Service[] }> = {};
  const uncategorized: Service[] = [];

  services.forEach((svc) => {
    const catId = svc.category_id;
    if (!catId) {
      uncategorized.push(svc);
      return;
    }
    if (!grouped[catId]) {
      grouped[catId] = {
        name: svc.category_name || `Category ${catId}`,
        services: [],
      };
    }
    grouped[catId].services.push(svc);
  });

  // Also include vendor's selected categories that have no services yet
  categories.forEach((cat) => {
    if (!grouped[cat.id]) {
      grouped[cat.id] = { name: cat.name, services: [] };
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const ServiceCard = ({ service }: { service: Service }) => {
    const active = Number(service.is_active) === 1;
    return (
      <div className={`flex items-center justify-between gap-4 p-4 rounded-xl border transition-all ${active ? "bg-white border-gray-200 hover:shadow-sm" : "bg-gray-50 border-gray-100 opacity-70"}`}>
        <div className="flex items-center gap-4 min-w-0 flex-1">
          {service.image ? (
            <img src={service.image} alt={service.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.384-3.08A.5.5 0 005.5 12.5v0a.5.5 0 00.536.49l6.293-.54m-.93 2.72l2.08 3.6a.5.5 0 00.836.06l3.327-4.272a.5.5 0 00-.188-.752l-5.126-2.636m-2.929 4l5.08-7.08a.5.5 0 01.768-.077l2.077 1.927a.5.5 0 01.03.745L13.42 15.17a.5.5 0 01-.698.063l-1.302-1.063z" />
              </svg>
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-gray-900 truncate">{service.name}</h4>
              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 ${active ? "bg-primary-100 text-primary-700" : "bg-gray-200 text-gray-500"}`}>
                {active ? "ACTIVE" : "INACTIVE"}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-base font-bold text-gray-900">
                ₹{Number(service.base_price || 0).toLocaleString("en-IN")}
              </span>
              {service.discounted_price && service.discounted_price < service.base_price && (
                <span className="text-xs text-gray-400 line-through">₹{service.base_price.toLocaleString("en-IN")}</span>
              )}
              {service.price_unit && (
                <span className="text-xs text-gray-400">{PRICE_UNIT_LABEL[service.price_unit] || service.price_unit}</span>
              )}
              {service.duration_minutes > 0 && (
                <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{service.duration_minutes} min</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-0.5 flex-shrink-0">
          <Link href={`/vendor/services/new?edit=${service.id}`} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors" title="Edit">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
            </svg>
          </Link>
          <button onClick={() => handleToggleActive(service)} className={`p-2 rounded-lg transition-colors ${active ? "hover:bg-amber-50 text-amber-400 hover:text-amber-600" : "hover:bg-primary-50 text-primary-400 hover:text-primary-600"}`} title={active ? "Deactivate" : "Activate"}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {active ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
              )}
            </svg>
          </button>
          <button onClick={() => setDeleteId(service.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/vendor/dashboard" className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <div>
            <h2 className="text-xl font-bold text-gray-900">My Services</h2>
            <p className="text-sm text-gray-500 mt-0.5">{services.length} services across {Object.keys(grouped).length} categories</p>
          </div>
        </div>
        <Link
          href="/vendor/services/new"
          className="px-4 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors flex items-center gap-2 shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Service
        </Link>
      </div>

      {services.length === 0 && Object.keys(grouped).length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-50 flex items-center justify-center">
            <svg className="w-8 h-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.384-3.08A.5.5 0 005.5 12.5v0a.5.5 0 00.536.49l6.293-.54m-.93 2.72l2.08 3.6a.5.5 0 00.836.06l3.327-4.272a.5.5 0 00-.188-.752l-5.126-2.636m-2.929 4l5.08-7.08a.5.5 0 01.768-.077l2.077 1.927a.5.5 0 01.03.745L13.42 15.17a.5.5 0 01-.698.063l-1.302-1.063z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No services yet</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            First <Link href="/vendor/categories" className="text-primary-600 font-medium hover:underline">select your categories</Link>, then add services under each category.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/vendor/categories" className="px-4 py-2.5 text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-xl transition-colors">
              Select Categories
            </Link>
            <Link href="/vendor/services/new" className="px-4 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              Add Service
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Services grouped by category */}
          {Object.entries(grouped).map(([catId, group]) => (
            <div key={catId} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              {/* Category header */}
              <div className="flex items-center justify-between px-5 py-3.5 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{group.name}</h3>
                    <p className="text-xs text-gray-400">{group.services.length} {group.services.length === 1 ? "service" : "services"}</p>
                  </div>
                </div>
                <Link
                  href={`/vendor/services/new?cat=${catId}`}
                  className="px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Add Service
                </Link>
              </div>

              {/* Services list */}
              <div className="p-3">
                {group.services.length === 0 ? (
                  <Link href={`/vendor/services/new?cat=${catId}`} className="flex items-center justify-center gap-2 py-8 text-sm text-gray-400 hover:text-primary-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add your first service under {group.name}
                  </Link>
                ) : (
                  <div className="space-y-2">
                    {group.services.map((svc) => (
                      <ServiceCard key={svc.id} service={svc} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Uncategorized services */}
          {uncategorized.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-gray-500">Uncategorized</h3>
              <div className="space-y-2">
                {uncategorized.map((svc) => (
                  <ServiceCard key={svc.id} service={svc} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Modal */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-1">Delete Service?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-xl transition-colors">
                Cancel
              </button>
              <button onClick={handleDelete} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
