"use client";

import { useEffect, useState, useCallback } from "react";
import { adminFetch, AdminPagination } from "@/lib/admin-api";
import { useToast } from "@/components/admin/Toast";
import DataTable, { Column } from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";

interface BusinessClaim {
  id: number;
  business_id: number;
  business_name?: string;
  user_id: number;
  user_name?: string;
  user_email?: string;
  user_phone?: string;
  status: string;
  notes?: string;
  admin_notes?: string;
  proof_document?: string;
  created_at: string;
}

export default function AdminClaimsPage() {
  const { toast } = useToast();
  const [claims, setClaims] = useState<BusinessClaim[]>([]);
  const [pagination, setPagination] = useState<AdminPagination>({
    total: 0,
    page: 1,
    per_page: 20,
    pages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState<{
    claim: BusinessClaim;
    action: "approve" | "reject";
  } | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  const load = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const res = await adminFetch<{
          claims: BusinessClaim[];
          pagination: AdminPagination;
        }>("/admin/claims", { params: { page, per_page: 20 } });
        setClaims(res.data?.claims || []);
        setPagination(
          res.data?.pagination || { total: 0, page: 1, per_page: 20, pages: 1 }
        );
      } catch (err) {
        // Claims endpoint may not exist yet
        if (err instanceof Error && err.message.includes("404")) {
          setClaims([]);
          toast("Claims API endpoint not yet available", "info");
        } else {
          toast(
            err instanceof Error ? err.message : "Failed to load claims",
            "error"
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    load(1);
  }, [load]);

  const handleAction = async () => {
    if (!actionModal) return;
    setProcessing(true);
    try {
      await adminFetch(
        `/admin/claims/${actionModal.claim.id}/${actionModal.action}`,
        {
          method: "POST",
          body: { admin_notes: adminNotes },
        }
      );
      toast(
        `Claim ${actionModal.action === "approve" ? "approved" : "rejected"}`,
        "success"
      );
      setActionModal(null);
      setAdminNotes("");
      load(pagination.page);
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Action failed",
        "error"
      );
    } finally {
      setProcessing(false);
    }
  };

  const columns: Column<BusinessClaim>[] = [
    {
      key: "business_name",
      label: "Business",
      render: (row) => (
        <span className="font-medium text-gray-900">
          {row.business_name || `Business #${row.business_id}`}
        </span>
      ),
    },
    {
      key: "user_name",
      label: "Claimed By",
      render: (row) => (
        <div>
          <p className="text-sm text-gray-900">{row.user_name || "Unknown"}</p>
          {row.user_email && (
            <p className="text-xs text-gray-400">{row.user_email}</p>
          )}
          {row.user_phone && (
            <p className="text-xs text-gray-400">{row.user_phone}</p>
          )}
        </div>
      ),
    },
    {
      key: "notes",
      label: "Notes",
      render: (row) => (
        <p className="text-sm text-gray-600 truncate max-w-xs">
          {row.notes || "-"}
        </p>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const colors: Record<string, string> = {
          pending: "bg-amber-100 text-amber-700",
          approved: "bg-green-100 text-green-700",
          rejected: "bg-red-100 text-red-700",
        };
        return (
          <span
            className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
              colors[row.status] || "bg-gray-100 text-gray-600"
            }`}
          >
            {row.status}
          </span>
        );
      },
    },
    {
      key: "created_at",
      label: "Date",
      sortable: true,
      render: (row) => (
        <span className="text-xs text-gray-500">
          {row.created_at
            ? new Date(row.created_at).toLocaleDateString()
            : "-"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <DataTable<BusinessClaim>
        columns={columns}
        data={claims}
        loading={loading}
        pagination={{
          page: pagination.page,
          totalPages: pagination.pages,
          total: pagination.total,
          perPage: pagination.per_page,
        }}
        onPageChange={(p) => load(p)}
        emptyMessage="No business claims found"
        actions={(row) =>
          row.status === "pending" ? (
            <div className="flex items-center justify-end gap-1">
              <button
                onClick={() =>
                  setActionModal({ claim: row, action: "approve" })
                }
                className="p-1.5 rounded-md hover:bg-green-50 text-green-600"
                title="Approve"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              </button>
              <button
                onClick={() =>
                  setActionModal({ claim: row, action: "reject" })
                }
                className="p-1.5 rounded-md hover:bg-red-50 text-red-500"
                title="Reject"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ) : (
            <span className="text-xs text-gray-400">
              {row.admin_notes || "Processed"}
            </span>
          )
        }
      />

      {/* Action Modal */}
      <Modal
        open={!!actionModal}
        onClose={() => {
          setActionModal(null);
          setAdminNotes("");
        }}
        title={`${
          actionModal?.action === "approve" ? "Approve" : "Reject"
        } Claim`}
      >
        <p className="text-sm text-gray-600 mb-3">
          {actionModal?.action === "approve"
            ? "Approve this business claim? The user will be granted owner access to the business listing."
            : "Reject this business claim? The user will be notified."}
        </p>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Admin Notes (optional)
          </label>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            placeholder="Add notes about this decision..."
          />
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => {
              setActionModal(null);
              setAdminNotes("");
            }}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleAction}
            disabled={processing}
            className={`px-4 py-2 text-sm rounded-lg text-white disabled:opacity-60 ${
              actionModal?.action === "approve"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {processing
              ? "Processing..."
              : actionModal?.action === "approve"
              ? "Approve"
              : "Reject"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
