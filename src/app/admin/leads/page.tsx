"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/admin/Toast";
import { adminFetch } from "@/lib/admin-api";

interface Lead {
  id: string; lead_number: string; contact_method: string; customer_name: string | null; customer_phone: string | null; status: string; lead_fee: string; created_at: string; business_name: string; vendor_name: string;
}

function timeAgo(d: string) { const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000); if (s < 60) return "just now"; if (s < 3600) return `${Math.floor(s / 60)}m ago`; if (s < 86400) return `${Math.floor(s / 3600)}h ago`; return `${Math.floor(s / 86400)}d ago`; }

export default function AdminLeadsPage() {
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch<any>("/admin/leads", { params: { per_page: 50 } })
      .then(res => { setLeads(res.data?.leads || []); setStats(res.data?.stats || null); })
      .catch(() => toast("Failed to load leads", "error"))
      .finally(() => setLoading(false));
  }, [toast]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">All Leads</h1>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Leads", value: stats.total },
            { label: "New", value: stats.new },
            { label: "Converted", value: stats.converted },
            { label: "Conversion Rate", value: `${stats.conversion_rate}%` },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border p-4">
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Lead</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Customer</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Business</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Method</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Fee</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {leads.map(lead => (
              <tr key={lead.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{lead.lead_number}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{lead.customer_name || "—"}</p>
                  <p className="text-xs text-gray-500">{lead.customer_phone || ""}</p>
                </td>
                <td className="px-4 py-3 text-gray-700">{lead.business_name}</td>
                <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${lead.contact_method === "call" ? "bg-green-100 text-green-700" : lead.contact_method === "whatsapp" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>{lead.contact_method}</span></td>
                <td className="px-4 py-3"><span className={`text-xs font-bold ${lead.status === "new" ? "text-amber-600" : lead.status === "converted" ? "text-green-600" : "text-gray-500"}`}>{lead.status}</span></td>
                <td className="px-4 py-3 text-gray-600">₹{lead.lead_fee}</td>
                <td className="px-4 py-3 text-xs text-gray-400">{timeAgo(lead.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {leads.length === 0 && <div className="text-center py-12 text-gray-400">No leads yet</div>}
      </div>
    </div>
  );
}
