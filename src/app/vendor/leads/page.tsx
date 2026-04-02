"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/admin/Toast";
import { vendorFetch } from "@/lib/vendor-api";

interface Lead {
  id: string; lead_number: string; contact_method: string; customer_name: string | null; customer_phone: string | null; customer_email: string | null; message: string | null; status: string; lead_fee: string; created_at: string; business_name: string;
}

const METHOD_ICON: Record<string, { icon: string; color: string; label: string }> = {
  call: { icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z", color: "text-green-600 bg-green-50", label: "Phone Call" },
  whatsapp: { icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z", color: "text-emerald-600 bg-emerald-50", label: "WhatsApp" },
  enquiry: { icon: "M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75", color: "text-blue-600 bg-blue-50", label: "Callback" },
};

function timeAgo(d: string) { const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000); if (s < 60) return "just now"; if (s < 3600) return `${Math.floor(s / 60)}m ago`; if (s < 86400) return `${Math.floor(s / 3600)}h ago`; return `${Math.floor(s / 86400)}d ago`; }

export default function VendorLeadsPage() {
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<{ total: number; new: number; converted: number; conversion_rate: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    vendorFetch<any>("/vendor/leads", { params: { per_page: 50 } })
      .then(res => { setLeads(res.data?.leads || []); setStats(res.data?.stats || null); })
      .catch(() => toast("Failed to load leads", "error"))
      .finally(() => setLoading(false));
  }, [toast]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
        <p className="text-sm text-gray-500 mt-1">Customers who contacted you directly via call, WhatsApp, or callback</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Leads", value: stats.total, color: "bg-blue-50 text-blue-700" },
            { label: "New", value: stats.new, color: "bg-amber-50 text-amber-700" },
            { label: "Converted", value: stats.converted, color: "bg-green-50 text-green-700" },
            { label: "Conversion Rate", value: `${stats.conversion_rate}%`, color: "bg-purple-50 text-purple-700" },
          ].map(s => (
            <div key={s.label} className={`${s.color} rounded-xl p-4`}>
              <p className="text-xs opacity-70">{s.label}</p>
              <p className="text-2xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {leads.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl">
          <p className="text-gray-500 text-lg font-semibold">No leads yet</p>
          <p className="text-gray-400 text-sm mt-1">When customers contact you, leads will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map(lead => {
            const method = METHOD_ICON[lead.contact_method] || METHOD_ICON.enquiry;
            return (
              <div key={lead.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl ${method.color} flex items-center justify-center flex-shrink-0`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={method.icon} /></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-900">{lead.customer_name || "Unknown Customer"}</p>
                      <span className="text-xs text-gray-400">{timeAgo(lead.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-500">{method.label} · {lead.lead_number}</p>
                    {lead.customer_phone && <p className="text-sm text-gray-700 mt-1 font-medium">📞 {lead.customer_phone}</p>}
                    {lead.customer_email && <p className="text-xs text-gray-500">{lead.customer_email}</p>}
                    {lead.message && <p className="text-sm text-gray-600 mt-2 italic">&quot;{lead.message}&quot;</p>}
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${lead.status === "new" ? "bg-amber-100 text-amber-700" : lead.status === "converted" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {lead.status.toUpperCase()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
