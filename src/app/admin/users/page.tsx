"use client";

import { useEffect, useState, useCallback, ChangeEvent } from "react";
import {
  getAdminUsers,
  updateUser,
  createUser,
  AdminUser,
  AdminPagination,
} from "@/lib/admin-api";
import { useToast } from "@/components/admin/Toast";
import DataTable, { Column } from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";
import FormField from "@/components/admin/FormField";

const ROLE_COLORS: Record<string, string> = {
  super_admin: "bg-red-100 text-red-700",
  admin: "bg-purple-100 text-purple-700",
  vendor: "bg-primary-100 text-primary-700",
  business_owner: "bg-blue-100 text-blue-700",
  user: "bg-gray-100 text-gray-600",
};

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  vendor: "Vendor",
  business_owner: "Business Owner",
  user: "Customer",
};

const ROLE_OPTIONS = [
  { label: "Customer", value: "user" },
  { label: "Vendor", value: "vendor" },
  { label: "Business Owner", value: "business_owner" },
  { label: "Admin", value: "admin" },
  { label: "Super Admin", value: "super_admin" },
];

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<AdminPagination>({ total: 0, page: 1, per_page: 20, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("");
  const [search, setSearch] = useState("");

  // Edit modal
  const [editModal, setEditModal] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", role: "user", is_active: true });
  const [saving, setSaving] = useState(false);

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", email: "", phone: "", password: "", role: "vendor" });
  const [creating, setCreating] = useState(false);

  const load = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const res = await getAdminUsers({
          page, per_page: 20,
          role: roleFilter || undefined,
          search: search || undefined,
        } as any);
        setUsers(res.data.users || []);
        setPagination(res.data.pagination || { total: 0, page: 1, per_page: 20, pages: 1 });
      } catch (err) {
        toast(err instanceof Error ? err.message : "Failed to load users", "error");
      } finally { setLoading(false); }
    },
    [toast, roleFilter, search]
  );

  useEffect(() => { load(1); }, [load]);

  const openEdit = (user: AdminUser) => {
    setEditModal(user);
    setEditForm({
      name: user.name,
      email: user.email || "",
      phone: user.phone || "",
      role: user.role,
      is_active: !!user.is_active,
    });
  };

  const handleSave = async () => {
    if (!editModal) return;
    setSaving(true);
    try {
      await updateUser(editModal.id, {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        role: editForm.role,
        is_active: editForm.is_active ? 1 : 0,
      } as Partial<AdminUser>);
      toast("User updated", "success");
      setEditModal(null);
      load(pagination.page);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to update", "error");
    } finally { setSaving(false); }
  };

  const handleToggleActive = async (user: AdminUser) => {
    try {
      await updateUser(user.id, { is_active: user.is_active ? 0 : 1 } as Partial<AdminUser>);
      toast(`User ${user.is_active ? "deactivated" : "activated"}`, "success");
      load(pagination.page);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to update", "error");
    }
  };

  const handleCreate = async () => {
    if (!createForm.name || !createForm.email || !createForm.password) {
      toast("Name, email and password are required", "warning");
      return;
    }
    setCreating(true);
    try {
      await createUser(createForm);
      toast("User created", "success");
      setShowCreate(false);
      setCreateForm({ name: "", email: "", phone: "", password: "", role: "vendor" });
      load(1);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to create user", "error");
    } finally { setCreating(false); }
  };

  const columns: Column<AdminUser>[] = [
    {
      key: "name", label: "Name", sortable: true,
      render: (row) => (
        <div className="min-w-[140px]">
          <span className="font-medium text-gray-900">{row.name}</span>
          {row.email && <p className="text-xs text-gray-400 truncate">{row.email}</p>}
        </div>
      ),
    },
    {
      key: "phone", label: "Phone",
      render: (row) => <span className="text-gray-600 text-sm">{row.phone || "-"}</span>,
    },
    {
      key: "role", label: "Role",
      render: (row) => (
        <span className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize ${ROLE_COLORS[row.role] || "bg-gray-100 text-gray-600"}`}>
          {ROLE_LABELS[row.role] || row.role}
        </span>
      ),
    },
    {
      key: "is_active", label: "Status",
      render: (row) => row.is_active ? (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Active
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-300" /> Inactive
        </span>
      ),
    },
    {
      key: "created_at", label: "Registered", sortable: true,
      render: (row) => (
        <span className="text-xs text-gray-500">
          {row.created_at ? new Date(row.created_at).toLocaleDateString() : "-"}
        </span>
      ),
    },
  ];

  const onEditChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const onCreateChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setCreateForm({ ...createForm, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-4">
      <DataTable<AdminUser>
        columns={columns}
        data={users}
        loading={loading}
        searchPlaceholder="Search users..."
        onSearch={setSearch}
        searchValue={search}
        pagination={{
          page: pagination.page,
          totalPages: pagination.pages,
          total: pagination.total,
          perPage: pagination.per_page,
        }}
        onPageChange={(p) => load(p)}
        toolbar={
          <div className="flex items-center gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-sm rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            >
              <option value="">All Roles</option>
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Create User
            </button>
          </div>
        }
        actions={(row) => (
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={() => handleToggleActive(row)}
              className={`p-1.5 rounded-md ${row.is_active ? "hover:bg-red-50 text-red-500" : "hover:bg-green-50 text-green-600"}`}
              title={row.is_active ? "Deactivate" : "Activate"}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {row.is_active ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
            </button>
            <button onClick={() => openEdit(row)} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600" title="Edit">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </button>
          </div>
        )}
      />

      {/* Edit Modal */}
      <Modal open={!!editModal} onClose={() => setEditModal(null)} title={`Edit: ${editModal?.name}`}>
        <div className="space-y-4">
          <FormField type="text" label="Full Name" name="name" value={editForm.name} onChange={onEditChange} required />
          <FormField type="email" label="Email" name="email" value={editForm.email} onChange={onEditChange} />
          <FormField type="tel" label="Phone" name="phone" value={editForm.phone} onChange={onEditChange} />
          <FormField type="select" label="Role" name="role" value={editForm.role} onChange={onEditChange} options={ROLE_OPTIONS} />
          <FormField type="toggle" label="Active" name="is_active" checked={editForm.is_active} onChange={(v) => setEditForm({ ...editForm, is_active: v })} />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setEditModal(null)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </Modal>

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create New User">
        <div className="space-y-4">
          <FormField type="text" label="Full Name" name="name" value={createForm.name} onChange={onCreateChange} required />
          <FormField type="email" label="Email" name="email" value={createForm.email} onChange={onCreateChange} required />
          <FormField type="tel" label="Phone" name="phone" value={createForm.phone} onChange={onCreateChange} />
          <FormField type="text" label="Password" name="password" value={createForm.password} onChange={onCreateChange} required />
          <FormField type="select" label="Role" name="role" value={createForm.role} onChange={onCreateChange} options={ROLE_OPTIONS} />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50">Cancel</button>
          <button onClick={handleCreate} disabled={creating} className="px-4 py-2 text-sm rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60">
            {creating ? "Creating..." : "Create User"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
