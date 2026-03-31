"use client";

import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/components/admin/Toast";
import { adminFetch } from "@/lib/admin-api";

interface OtpLog {
  id: string;
  phone: string;
  otp_code: string;
  purpose: string;
  is_used: string;
  attempts: string;
  expires_at: string;
  created_at: string;
  user_name: string | null;
  user_email: string | null;
  user_role: string | null;
}

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function isExpired(date: string) {
  return new Date(date).getTime() < Date.now();
}

export default function OtpLogsPage() {
  const { toast } = useToast();
  const [otps, setOtps] = useState<OtpLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchOtps = useCallback(async () => {
    try {
      const res = await adminFetch<any>("/admin/otp-logs", {
        params: { per_page: 50, phone: search || undefined },
      });
      setOtps(res.data?.otps || []);
    } catch {
      toast("Failed to load OTPs", "error");
    } finally {
      setLoading(false);
    }
  }, [search, toast]);

  useEffect(() => {
    fetchOtps();
  }, [fetchOtps]);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchOtps, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchOtps]);

  const copyOtp = (otp: string, phone: string) => {
    navigator.clipboard.writeText(otp);
    toast(`OTP ${otp} copied for ${phone}`, "success");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">OTP Logs</h1>
          <p className="text-sm text-gray-500 mt-1">
            View all OTPs sent during trial period. Share with users who need to login.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="accent-primary-500"
            />
            Auto-refresh (5s)
          </label>
          <button
            onClick={fetchOtps}
            className="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
          >
            Refresh Now
          </button>
        </div>
      </div>

      {/* Trial mode banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <div>
          <p className="text-sm font-semibold text-amber-800">Trial Mode — SMS not configured</p>
          <p className="text-xs text-amber-600 mt-0.5">OTPs are shown here instead of being sent via SMS. When you configure MSG91/Twilio, OTPs will be sent to users&apos; phones and this page will only show logs.</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search by phone number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
        />
      </div>

      {/* OTP Cards */}
      {otps.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-600 mb-1">No OTPs found</h3>
          <p className="text-gray-400 text-sm">OTPs will appear here when users try to login</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {otps.map((otp) => {
            const expired = isExpired(otp.expires_at);
            const used = otp.is_used === "1";
            const active = !expired && !used;

            return (
              <div
                key={otp.id}
                className={`rounded-xl border-2 p-5 transition-all ${
                  active
                    ? "border-green-200 bg-green-50/50"
                    : used
                    ? "border-gray-200 bg-gray-50 opacity-60"
                    : "border-red-100 bg-red-50/30 opacity-60"
                }`}
              >
                {/* Status badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    active ? "bg-green-100 text-green-700" :
                    used ? "bg-gray-200 text-gray-600" :
                    "bg-red-100 text-red-600"
                  }`}>
                    {active ? "ACTIVE" : used ? "USED" : "EXPIRED"}
                  </span>
                  <span className="text-xs text-gray-400">{timeAgo(otp.created_at)}</span>
                </div>

                {/* User info */}
                {otp.user_name ? (
                  <div className="mb-3">
                    <p className="text-lg font-bold text-gray-900">{otp.user_name}</p>
                    <p className="text-sm text-gray-500">+91 {otp.phone}{otp.user_email ? ` · ${otp.user_email}` : ""}</p>
                    {otp.user_role && (
                      <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        otp.user_role === "vendor" || otp.user_role === "business_owner" ? "bg-emerald-100 text-emerald-700" :
                        otp.user_role === "admin" || otp.user_role === "super_admin" ? "bg-red-100 text-red-700" :
                        "bg-blue-100 text-blue-700"
                      }`}>{otp.user_role}</span>
                    )}
                  </div>
                ) : (
                  <div className="mb-3">
                    <p className="text-sm text-amber-600 font-medium">New User</p>
                    <p className="text-lg font-bold text-gray-900">+91 {otp.phone}</p>
                  </div>
                )}

                {/* OTP Code */}
                <div className="flex items-center justify-between bg-white rounded-lg border p-3 mb-3">
                  <div>
                    <p className="text-xs text-gray-400">OTP Code</p>
                    <p className="text-3xl font-mono font-bold tracking-[0.3em] text-gray-900">{otp.otp_code}</p>
                  </div>
                  {active && (
                    <button
                      onClick={() => copyOtp(otp.otp_code, otp.phone)}
                      className="px-3 py-2 bg-primary-50 text-primary-600 rounded-lg text-xs font-semibold hover:bg-primary-100 transition-colors"
                    >
                      Copy
                    </button>
                  )}
                </div>

                {/* Meta */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400">Purpose</span>
                    <p className="font-medium text-gray-700 capitalize">{otp.purpose}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Attempts</span>
                    <p className="font-medium text-gray-700">{otp.attempts}/5</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Expires</span>
                    <p className={`font-medium ${expired ? "text-red-500" : "text-green-600"}`}>
                      {expired ? "Expired" : timeAgo(otp.expires_at).replace("ago", "left")}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Created</span>
                    <p className="font-medium text-gray-700">{new Date(otp.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* How to use */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <h3 className="font-semibold text-blue-900 mb-2">How to help users login during trial</h3>
        <ol className="text-sm text-blue-700 space-y-1.5 list-decimal list-inside">
          <li>User enters phone number on login page and clicks &quot;Send OTP&quot;</li>
          <li>OTP appears here within seconds (auto-refreshes every 5s)</li>
          <li>Share the 4-digit OTP with the user via call/WhatsApp</li>
          <li>User enters OTP on the verification screen</li>
          <li>Once SMS provider is configured, OTPs will be sent directly to users</li>
        </ol>
      </div>
    </div>
  );
}
