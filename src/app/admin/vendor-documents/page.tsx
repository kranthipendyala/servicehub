"use client";

import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/components/admin/Toast";
import {
  getVendorDocuments,
  approveDocument,
  rejectDocument,
  AdminVendorDocument,
  AdminPagination,
} from "@/lib/admin-api";

const DOC_TYPE_LABELS: Record<string, string> = {
  aadhaar: "Aadhaar Card",
  pan: "PAN Card",
  gst: "GST Certificate",
  trade_license: "Trade License",
};

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function AdminVendorDocumentsPage() {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<AdminVendorDocument[]>([]);
  const [pagination, setPagination] = useState<AdminPagination>({
    total: 0,
    page: 1,
    per_page: 20,
    pages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [actionId, setActionId] = useState<number | null>(null);
  const [rejectModalId, setRejectModalId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const load = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const res = await getVendorDocuments({
          page,
          per_page: 20,
          status: statusFilter || undefined,
        });
        setDocuments(res.data.documents || []);
        setPagination(
          res.data.pagination || { total: 0, page: 1, per_page: 20, pages: 1 }
        );
      } catch {
        toast("Failed to load documents", "error");
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, toast]
  );

  useEffect(() => {
    load(1);
  }, [load]);

  const handleApprove = async (id: number) => {
    setActionId(id);
    try {
      await approveDocument(id);
      toast("Document approved", "success");
      load(pagination.page);
    } catch {
      toast("Failed to approve document", "error");
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModalId) return;
    if (!rejectReason.trim()) {
      toast("Please provide a reason", "error");
      return;
    }
    setActionId(rejectModalId);
    try {
      await rejectDocument(rejectModalId, rejectReason);
      toast("Document rejected", "success");
      setRejectModalId(null);
      setRejectReason("");
      load(pagination.page);
    } catch {
      toast("Failed to reject document", "error");
    } finally {
      setActionId(null);
    }
  };

  const STATUS_TABS = [
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
    { label: "All", value: "" },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">KYC Documents</h1>

      <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-200 p-1.5 overflow-x-auto">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              statusFilter === tab.value
                ? "bg-primary-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 px-6 py-12 text-center text-gray-500">
          No documents found
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-xl border border-gray-200 p-6 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {doc.vendor_name || `Vendor #${doc.vendor_id}`}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {DOC_TYPE_LABELS[doc.document_type] || doc.document_type}
                    </p>
                  </div>
                  <span
                    className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                      statusColors[doc.status] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>

                <a
                  href={doc.document_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary-600 hover:underline break-all"
                >
                  {doc.document_url}
                </a>

                {doc.rejection_reason && (
                  <p className="text-xs text-red-600">
                    Rejection reason: {doc.rejection_reason}
                  </p>
                )}

                <p className="text-xs text-gray-400">Submitted: {doc.created_at}</p>

                {doc.status === "pending" && (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleApprove(doc.id)}
                      disabled={actionId === doc.id}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        setRejectModalId(doc.id);
                        setRejectReason("");
                      }}
                      disabled={actionId === doc.id}
                      className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => load(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => load(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Reject Reason Modal */}
      {rejectModalId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Reject Document</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for rejection
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                placeholder="Explain why this document is being rejected..."
              />
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setRejectModalId(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionId === rejectModalId}
                className="px-5 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
