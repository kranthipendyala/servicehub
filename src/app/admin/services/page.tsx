"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getAdminServices,
  getAdminCategories,
  AdminService,
  AdminPagination,
  AdminCategory,
} from "@/lib/admin-api";
import { useToast } from "@/components/admin/Toast";
import DataTable, { Column } from "@/components/admin/DataTable";

export default function AdminServicesPage() {
  const { toast } = useToast();
  const [services, setServices] = useState<AdminService[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [pagination, setPagination] = useState<AdminPagination>({
    total: 0,
    page: 1,
    per_page: 20,
    pages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const loadCategories = useCallback(async () => {
    try {
      const res = await getAdminCategories();
      setCategories(res.data || []);
    } catch {
      // silently fail - categories are for filtering only
    }
  }, []);

  const load = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const res = await getAdminServices({
          page,
          per_page: 20,
          category: categoryFilter || undefined,
          search: search || undefined,
          status: statusFilter || undefined,
        });
        setServices(res.data.services || []);
        setPagination(
          res.data.pagination || {
            total: 0,
            page: 1,
            per_page: 20,
            pages: 1,
          }
        );
      } catch (err) {
        toast(
          err instanceof Error ? err.message : "Failed to load services",
          "error"
        );
      } finally {
        setLoading(false);
      }
    },
    [categoryFilter, search, statusFilter, toast]
  );

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    load(1);
  }, [load]);

  const formatDuration = (minutes: number) => {
    if (!minutes) return "-";
    if (minutes < 60) return `${minutes}m`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const formatPrice = (price: number) =>
    `₹${Number(price).toLocaleString("en-IN")}`;

  const columns: Column<AdminService>[] = [
    {
      key: "name",
      label: "Service Name",
      sortable: true,
      render: (row) => (
        <div className="min-w-[180px]">
          <p className="font-medium text-gray-900">{row.name}</p>
          {row.short_description && (
            <p className="text-xs text-gray-500 line-clamp-1">
              {row.short_description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "business_name",
      label: "Business",
      sortable: true,
      render: (row) => (
        <span className="text-gray-600">{row.business_name || "-"}</span>
      ),
    },
    {
      key: "category_name",
      label: "Category",
      sortable: true,
      render: (row) => (
        <span className="text-gray-600">{row.category_name || "-"}</span>
      ),
    },
    {
      key: "base_price",
      label: "Price",
      sortable: true,
      render: (row) => (
        <div>
          {row.discounted_price && row.discounted_price < row.base_price ? (
            <>
              <span className="font-medium text-gray-900">
                {formatPrice(row.discounted_price)}
              </span>
              <span className="ml-1 text-xs text-gray-400 line-through">
                {formatPrice(row.base_price)}
              </span>
            </>
          ) : (
            <span className="font-medium text-gray-900">
              {formatPrice(row.base_price)}
            </span>
          )}
          <span className="ml-1 text-xs text-gray-400">
            /{row.price_unit.replace(/_/g, " ")}
          </span>
        </div>
      ),
    },
    {
      key: "duration_minutes",
      label: "Duration",
      sortable: true,
      render: (row) => (
        <span className="text-gray-600">
          {formatDuration(row.duration_minutes)}
        </span>
      ),
    },
    {
      key: "is_active",
      label: "Status",
      render: (row) => (
        <span
          className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
            row.is_active
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {row.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <DataTable<AdminService>
        columns={columns}
        data={services}
        loading={loading}
        searchPlaceholder="Search services..."
        onSearch={setSearch}
        searchValue={search}
        pagination={{
          page: pagination.page,
          totalPages: pagination.pages,
          total: pagination.total,
          perPage: pagination.per_page,
        }}
        onPageChange={(p) => load(p)}
        emptyMessage="No services found"
        toolbar={
          <div className="flex items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-sm rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        }
      />
    </div>
  );
}
