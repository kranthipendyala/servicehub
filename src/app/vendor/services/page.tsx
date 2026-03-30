"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/admin/Toast";
import {
  getVendorServices,
  deleteVendorService,
  updateVendorService,
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
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchServices = async () => {
    try {
      const res = await getVendorServices();
      setServices(
        Array.isArray(res.data) ? res.data : (res.data as any)?.services || []
      );
    } catch {
      toast("Failed to load services", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleToggleActive = async (service: Service) => {
    try {
      await updateVendorService(service.id, {
        is_active: !service.is_active,
      });
      toast(
        `Service ${service.is_active ? "deactivated" : "activated"}`,
        "success"
      );
      fetchServices();
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
      fetchServices();
    } catch {
      toast("Failed to delete service", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Services</h2>
        <Link
          href="/vendor/services/new"
          className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Service
        </Link>
      </div>

      {services.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.384-3.08A.5.5 0 005.5 12.5v0a.5.5 0 00.536.49l6.293-.54m-.93 2.72l2.08 3.6a.5.5 0 00.836.06l3.327-4.272a.5.5 0 00-.188-.752l-5.126-2.636m-2.929 4l5.08-7.08a.5.5 0 01.768-.077l2.077 1.927a.5.5 0 01.03.745L13.42 15.17a.5.5 0 01-.698.063l-1.302-1.063z" />
          </svg>
          <p className="text-gray-500 text-sm mb-4">
            No services yet. Add your first service to start accepting bookings.
          </p>
          <Link
            href="/vendor/services/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Service
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* Image */}
              {service.image && (
                <div className="h-40 bg-gray-100">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">
                    {service.name}
                  </h3>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                      service.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {service.is_active ? "Active" : "Inactive"}
                  </span>
                </div>

                {service.category_name && (
                  <p className="text-xs text-gray-500 mb-2">
                    {service.category_name}
                  </p>
                )}

                <div className="flex items-baseline gap-2 mb-3">
                  {service.discounted_price &&
                  service.discounted_price < service.base_price ? (
                    <>
                      <span className="text-lg font-bold text-gray-900">
                        Rs. {service.discounted_price.toLocaleString("en-IN")}
                      </span>
                      <span className="text-sm text-gray-400 line-through">
                        Rs. {service.base_price.toLocaleString("en-IN")}
                      </span>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-gray-900">
                      Rs. {service.base_price.toLocaleString("en-IN")}
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    {PRICE_UNIT_LABEL[service.price_unit] || service.price_unit}
                  </span>
                </div>

                {service.duration_minutes > 0 && (
                  <p className="text-xs text-gray-500 mb-3">
                    Duration: {service.duration_minutes} min
                  </p>
                )}

                {service.variants && service.variants.length > 0 && (
                  <p className="text-xs text-gray-500 mb-3">
                    {service.variants.length} variant(s)
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <Link
                    href={`/vendor/services/new?edit=${service.id}`}
                    className="flex-1 px-3 py-1.5 text-xs font-medium text-center text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleToggleActive(service)}
                    className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      service.is_active
                        ? "text-amber-700 bg-amber-50 hover:bg-amber-100"
                        : "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                    }`}
                  >
                    {service.is_active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => setDeleteId(service.id)}
                    className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Modal */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Service
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this service? This action cannot
              be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
