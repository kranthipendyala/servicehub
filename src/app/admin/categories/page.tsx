"use client";

import { useEffect, useState, ChangeEvent } from "react";
import {
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  AdminCategory,
} from "@/lib/admin-api";
import { useToast } from "@/components/admin/Toast";
import Modal from "@/components/admin/Modal";
import FormField from "@/components/admin/FormField";
import CategoryIcon from "@/components/ui/CategoryIcon";

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  icon: "",
  parent_id: null as number | null,
  meta_title: "",
  meta_description: "",
  sort_order: 0,
};

export default function AdminCategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminCategory | null>(null);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const load = async () => {
    try {
      const res = await getAdminCategories();
      const cats = res.data || [];
      setCategories(cats);
      // Auto-expand all parent categories
      const parentIds = new Set(cats.filter((c: AdminCategory) => !c.parent_id).map((c: AdminCategory) => c.id));
      setExpanded(parentIds);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to load", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleExpand = (id: number) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpanded(next);
  };

  const openAdd = (parentId: number | null = null) => {
    setEditing(null);
    setForm({ ...emptyForm, parent_id: parentId });
    setModalOpen(true);
  };

  const openEdit = (cat: AdminCategory) => {
    setEditing(cat);
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      icon: cat.icon || "",
      parent_id: cat.parent_id || null,
      meta_title: cat.meta_title || "",
      meta_description: cat.meta_description || "",
      sort_order: cat.sort_order || 0,
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
      toast("Category name is required", "warning");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await updateCategory(editing.id, form);
        toast("Category updated", "success");
      } else {
        await createCategory(form);
        toast("Category created", "success");
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCategory(deleteTarget.id);
      toast("Category deleted", "success");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to delete", "error");
    }
  };

  // Build hierarchy: top-level categories with children nested
  const topLevel = categories.filter((c) => !c.parent_id);
  const getChildren = (parentId: number) =>
    categories.filter((c) => c.parent_id === parentId);

  // All categories flat for parent select
  const parentOptions = [
    { label: "None (Top Level)", value: "" },
    ...categories
      .filter((c) => !c.parent_id)
      .map((c) => ({ label: c.name, value: String(c.id) })),
  ];

  const renderCategory = (cat: AdminCategory, depth = 0) => {
    const children = cat.children || getChildren(cat.id);
    const hasChildren = children.length > 0;
    const isExpanded = expanded.has(cat.id);

    return (
      <div key={cat.id}>
        <div
          className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-100 ${
            depth > 0 ? "bg-gray-50/50" : ""
          }`}
          style={{ paddingLeft: `${16 + depth * 28}px` }}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleExpand(cat.id)}
              className="p-0.5 rounded hover:bg-gray-200 text-gray-500"
            >
              <svg
                className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          ) : (
            <span className="w-5" />
          )}

          {cat.icon && (
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${depth === 0 ? "bg-primary-50 text-primary-600" : "bg-gray-100 text-gray-500"}`}>
              <CategoryIcon icon={cat.icon} className="w-4 h-4" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-gray-900">
              {cat.name}
            </span>
            {cat.description && (
              <p className="text-xs text-gray-500 truncate">
                {cat.description}
              </p>
            )}
          </div>

          {depth === 0 && (
            <span className="text-xs text-gray-400 tabular-nums">
              {cat.business_count ?? 0} businesses
            </span>
          )}
          {depth > 0 && (
            <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-600">
              Template
            </span>
          )}

          <div className="flex items-center gap-1">
            {depth === 0 && (
            <button
              onClick={() => openAdd(cat.id)}
              className="p-1.5 rounded-md hover:bg-blue-50 text-blue-600"
              title="Add service template"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
            )}
            <button
              onClick={() => openEdit(cat)}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600"
              title="Edit"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </button>
            <button
              onClick={() => setDeleteTarget(cat)}
              className="p-1.5 rounded-md hover:bg-red-50 text-red-500"
              title="Delete"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {children.map((child) => renderCategory(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">
            {topLevel.length} categories, {categories.length - topLevel.length} service templates
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            Categories = service groups. Templates = suggested services vendors can pick from when adding their services.
          </p>
        </div>
        <button
          onClick={() => openAdd(null)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Category
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : topLevel.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No categories found. Create your first one.
          </div>
        ) : (
          topLevel.map((cat) => renderCategory(cat))
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Edit ${editing.parent_id ? "Service Template" : "Category"}` : form.parent_id ? "Add Service Template" : "Add Category"}
        maxWidth="max-w-xl"
      >
        <div className="space-y-4">
          <FormField type="text" label="Name" name="name" value={form.name} onChange={onChange} required />
          <FormField type="text" label="Slug" name="slug" value={form.slug} onChange={onChange} helpText="URL-friendly identifier" />
          <FormField type="text" label="Icon" name="icon" value={form.icon} onChange={onChange} helpText="Emoji or icon class" />
          <FormField type="textarea" label="Description" name="description" value={form.description} onChange={onChange} rows={3} />
          <FormField
            type="select"
            label="Parent Category"
            name="parent_id"
            value={form.parent_id ? String(form.parent_id) : ""}
            onChange={(e) => setForm({ ...form, parent_id: e.target.value ? Number(e.target.value) : null })}
            options={parentOptions}
          />
          <FormField type="number" label="Sort Order" name="sort_order" value={form.sort_order} onChange={onChange} />
          <hr className="my-2" />
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

      {/* Delete Modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Category">
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?
          {(deleteTarget?.business_count ?? 0) > 0 && (
            <span className="text-red-600">
              {" "}
              This category has {deleteTarget?.business_count} businesses.
            </span>
          )}
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
