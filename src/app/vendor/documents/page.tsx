"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/admin/Toast";
import {
  uploadDocument,
  getMyDocuments,
  VendorDocument,
} from "@/lib/vendor-api";

const DOC_TYPES = [
  { value: "aadhaar", label: "Aadhaar Card" },
  { value: "pan", label: "PAN Card" },
  { value: "gst", label: "GST Certificate" },
  { value: "trade_license", label: "Trade License" },
];

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function VendorDocumentsPage() {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<VendorDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState("aadhaar");
  const [docUrl, setDocUrl] = useState("");

  const fetchDocs = async () => {
    try {
      const res = await getMyDocuments();
      setDocuments(res.data || []);
    } catch {
      toast("Failed to load documents", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docUrl.trim()) {
      toast("Please enter a document URL", "error");
      return;
    }
    setUploading(true);
    try {
      await uploadDocument(docType, docUrl);
      toast("Document uploaded successfully", "success");
      setDocUrl("");
      fetchDocs();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Upload failed", "error");
    } finally {
      setUploading(false);
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
      <h1 className="text-2xl font-bold text-gray-900">KYC Documents</h1>
      <p className="text-sm text-gray-500">
        Upload your identity and business documents for verification.
      </p>

      {/* Upload Form */}
      <form
        onSubmit={handleUpload}
        className="bg-white rounded-xl border border-gray-200 p-6 space-y-4"
      >
        <h2 className="text-base font-semibold text-gray-900">Upload New Document</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document Type
            </label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            >
              {DOC_TYPES.map((dt) => (
                <option key={dt.value} value={dt.value}>
                  {dt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={docUrl}
                onChange={(e) => setDocUrl(e.target.value)}
                placeholder="https://example.com/document.pdf"
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                required
              />
              <button
                type="submit"
                disabled={uploading}
                className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Document List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Submitted Documents</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {documents.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-gray-400">
              No documents uploaded yet
            </div>
          ) : (
            documents.map((doc) => (
              <div key={doc.id} className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {DOC_TYPES.find((d) => d.value === doc.document_type)?.label ||
                      doc.document_type}
                  </p>
                  <a
                    href={doc.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-emerald-600 hover:underline truncate block"
                  >
                    {doc.document_url}
                  </a>
                  {doc.rejection_reason && (
                    <p className="text-xs text-red-600 mt-1">
                      Reason: {doc.rejection_reason}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">
                    Uploaded: {doc.created_at}
                  </p>
                </div>
                <span
                  className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full flex-shrink-0 ${
                    statusColors[doc.status] || "bg-gray-100 text-gray-600"
                  }`}
                >
                  {doc.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
