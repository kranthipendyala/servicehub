"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
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

  const inputCls = "w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none";

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
          <h2 className="text-xl font-bold text-gray-900">KYC Documents</h2>
          <p className="text-sm text-gray-500">Upload identity and business documents for verification</p>
        </div>
      </div>

      {/* Upload Form */}
      <form onSubmit={handleUpload} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        <h3 className="text-base font-semibold text-gray-900">Upload New Document</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
          <select value={docType} onChange={(e) => setDocType(e.target.value)} className={`${inputCls} bg-white`}>
            {DOC_TYPES.map((dt) => (
              <option key={dt.value} value={dt.value}>{dt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Document URL</label>
          <input type="url" value={docUrl} onChange={(e) => setDocUrl(e.target.value)} placeholder="https://example.com/document.pdf" className={inputCls} required />
          <p className="text-xs text-gray-400 mt-1">Upload your document to a cloud service and paste the link</p>
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {uploading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          {uploading ? "Uploading..." : "Upload Document"}
        </button>
      </form>

      {/* Document List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">Submitted Documents</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {documents.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <svg className="w-10 h-10 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <p className="text-sm text-gray-400">No documents uploaded yet</p>
            </div>
          ) : (
            documents.map((doc) => (
              <div key={doc.id} className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {DOC_TYPES.find((d) => d.value === doc.document_type)?.label || doc.document_type}
                  </p>
                  <a href={doc.document_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-600 hover:underline truncate block">
                    {doc.document_url}
                  </a>
                  {doc.rejection_reason && (
                    <p className="text-xs text-red-600 mt-1">Reason: {doc.rejection_reason}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">Uploaded: {doc.created_at}</p>
                </div>
                <span className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full flex-shrink-0 capitalize ${statusColors[doc.status] || "bg-gray-100 text-gray-600"}`}>
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
