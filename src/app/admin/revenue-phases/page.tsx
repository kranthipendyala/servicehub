"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/admin/Toast";
import { adminFetch } from "@/lib/admin-api";

interface Settings { [key: string]: string; }

const PHASES = [
  {
    id: "1", name: "Free for All", period: "Launch Phase",
    desc: "Zero fees. Build vendor supply and customer demand. Platform is completely free for everyone.",
    color: "emerald",
    pricing: { customer: "Service price only", vendor: "Keeps 100%", platform: "₹0" },
    toggles: { platform_fee_enabled: "0", commission_enabled: "0", subscription_required: "0", surge_pricing_enabled: "0", cod_enabled: "1", online_payment_enabled: "0" },
  },
  {
    id: "2", name: "Platform Fee", period: "Revenue Start",
    desc: "Small convenience fee per booking. Vendors keep 100% of their price. First revenue stream.",
    color: "blue",
    pricing: { customer: "Service + ₹39 fee", vendor: "Keeps 100%", platform: "₹39-88/booking" },
    toggles: { platform_fee_enabled: "1", commission_enabled: "0", subscription_required: "0", surge_pricing_enabled: "1", cod_enabled: "1", online_payment_enabled: "1" },
  },
  {
    id: "3", name: "Subscriptions", period: "Recurring Revenue",
    desc: "Vendor subscription plans with tiered features. Free tier available. Recurring monthly revenue.",
    color: "purple",
    pricing: { customer: "Service + ₹39 fee", vendor: "100% (subs get priority)", platform: "₹39/booking + ₹499-1999/mo" },
    toggles: { platform_fee_enabled: "1", commission_enabled: "0", subscription_required: "1", surge_pricing_enabled: "1", cod_enabled: "1", online_payment_enabled: "1" },
  },
  {
    id: "4", name: "Full Monetization", period: "Scale Phase",
    desc: "All revenue streams active. Commission on every booking. Premium vendors get lower rates.",
    color: "amber",
    pricing: { customer: "Service + ₹39 fee", vendor: "80-90% after commission", platform: "Fee + 15% + subs + leads" },
    toggles: { platform_fee_enabled: "1", commission_enabled: "1", subscription_required: "1", surge_pricing_enabled: "1", cod_enabled: "0", online_payment_enabled: "1" },
  },
];

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; badge: string; btn: string; light: string }> = {
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-700", btn: "bg-emerald-600 hover:bg-emerald-700", light: "bg-emerald-500" },
  blue: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", badge: "bg-blue-100 text-blue-700", btn: "bg-blue-600 hover:bg-blue-700", light: "bg-blue-500" },
  purple: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", badge: "bg-purple-100 text-purple-700", btn: "bg-purple-600 hover:bg-purple-700", light: "bg-purple-500" },
  amber: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", badge: "bg-amber-100 text-amber-700", btn: "bg-amber-600 hover:bg-amber-700", light: "bg-amber-500" },
};

const SETTINGS_CONFIG = [
  { key: "platform_fee_enabled", label: "Platform Fee", desc: "Convenience fee charged to customers per booking" },
  { key: "surge_pricing_enabled", label: "Surge Pricing", desc: "Dynamic pricing during peak hours and weekends" },
  { key: "commission_enabled", label: "Vendor Commission", desc: "Percentage cut from vendor earnings per booking" },
  { key: "subscription_required", label: "Vendor Subscriptions", desc: "Monthly subscription plans for vendors" },
  { key: "cod_enabled", label: "Pay After Service", desc: "Customer pays cash after service completion" },
  { key: "online_payment_enabled", label: "Online Payments", desc: "Razorpay, UPI, card payments at checkout" },
  { key: "lead_charge_enabled", label: "Lead Charges", desc: "Charge vendors per phone call/WhatsApp enquiry" },
];

const AMOUNT_CONFIG = [
  { key: "platform_fee_amount", label: "Platform Fee", unit: "₹", placeholder: "39", desc: "Per booking" },
  { key: "surge_amount", label: "Surge Fee", unit: "₹", placeholder: "49", desc: "Added during peak" },
  { key: "commission_rate", label: "Commission", unit: "%", placeholder: "15", desc: "Of service amount" },
  { key: "lead_charge_amount", label: "Lead Charge", unit: "₹", placeholder: "10", desc: "Per lead" },
];

export default function RevenuePhaseSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmPhase, setConfirmPhase] = useState<typeof PHASES[0] | null>(null);

  useEffect(() => {
    adminFetch<Settings>("/admin/settings").then((res) => {
      if (res.data) setSettings(res.data);
    }).catch(() => toast("Failed to load settings", "error")).finally(() => setLoading(false));
  }, []);

  const saveSettings = async (updates: Record<string, string>) => {
    try {
      await adminFetch("/admin/settings", { method: "POST", body: updates });
      setSettings((prev) => ({ ...prev, ...updates }));
      return true;
    } catch { toast("Failed to save", "error"); return false; }
  };

  const activatePhase = async (phase: typeof PHASES[0]) => {
    setSaving(true);
    const ok = await saveSettings({ revenue_phase: phase.id, ...phase.toggles });
    if (ok) toast(`Switched to ${phase.name}`, "success");
    setSaving(false);
    setConfirmPhase(null);
  };

  const toggleSetting = (key: string) => {
    const newVal = settings[key] === "1" ? "0" : "1";
    setSettings((prev) => ({ ...prev, [key]: newVal }));
    saveSettings({ [key]: newVal });
  };

  const updateAmount = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const saveAmount = (key: string) => {
    saveSettings({ [key]: settings[key] || "0" });
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>;

  const currentPhase = settings.revenue_phase || "1";

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Revenue Model</h1>
        <p className="text-sm text-gray-500 mt-1">Configure how the platform earns revenue. Serving Telangana & Andhra Pradesh.</p>
      </div>

      {/* Current Phase Banner */}
      {(() => {
        const phase = PHASES.find((p) => p.id === currentPhase) || PHASES[0];
        const c = COLOR_MAP[phase.color];
        return (
          <div className={`${c.bg} ${c.border} border rounded-2xl p-6`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${c.badge}`}>
                    <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                    ACTIVE
                  </span>
                  <span className="text-xs text-gray-500">{phase.period}</span>
                </div>
                <h2 className={`text-xl font-bold ${c.text}`}>Phase {phase.id}: {phase.name}</h2>
                <p className="text-sm text-gray-600 mt-1">{phase.desc}</p>
              </div>
              <div className="flex gap-4 text-center flex-shrink-0">
                <div className="bg-white/70 rounded-xl px-4 py-3 min-w-[100px]">
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Customer pays</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">{phase.pricing.customer}</p>
                </div>
                <div className="bg-white/70 rounded-xl px-4 py-3 min-w-[100px]">
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Vendor gets</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">{phase.pricing.vendor}</p>
                </div>
                <div className="bg-white/70 rounded-xl px-4 py-3 min-w-[100px]">
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">You earn</p>
                  <p className={`text-sm font-bold ${c.text} mt-0.5`}>{phase.pricing.platform}</p>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Phase Selector */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Switch Phase</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PHASES.map((phase) => {
            const isActive = currentPhase === phase.id;
            const c = COLOR_MAP[phase.color];
            return (
              <button
                key={phase.id}
                onClick={() => !isActive && setConfirmPhase(phase)}
                disabled={isActive}
                className={`text-left rounded-xl border-2 p-4 transition-all ${
                  isActive ? `${c.bg} ${c.border}` : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${c.light}`}>
                    {phase.id}
                  </div>
                  {isActive && (
                    <span className="text-[10px] font-bold text-green-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> LIVE
                    </span>
                  )}
                </div>
                <h3 className={`text-sm font-bold ${isActive ? c.text : "text-gray-900"}`}>{phase.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{phase.period}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Feature Toggles */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Feature Controls</h2>
          <p className="text-xs text-gray-500 mt-0.5">Fine-tune individual features. Changes apply instantly.</p>
        </div>
        <div className="divide-y divide-gray-100">
          {SETTINGS_CONFIG.map((item) => {
            const isOn = settings[item.key] === "1";
            return (
              <div key={item.key} className="px-6 py-4 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{item.label}</h3>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
                <button onClick={() => toggleSetting(item.key)} className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${isOn ? "bg-primary-600" : "bg-gray-200"}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isOn ? "translate-x-5" : ""}`} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Amount Settings */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Pricing</h2>
          <p className="text-xs text-gray-500 mt-0.5">Set exact amounts. Saved on blur.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
          {AMOUNT_CONFIG.map((item) => (
            <div key={item.key} className="px-6 py-5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-900">{item.label}</label>
                <span className="text-xs text-gray-400">{item.desc}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-gray-400">{item.unit}</span>
                <input
                  type="number"
                  value={settings[item.key] || ""}
                  onChange={(e) => updateAmount(item.key, e.target.value)}
                  onBlur={() => saveAmount(item.key)}
                  placeholder={item.placeholder}
                  className="w-full text-2xl font-bold text-gray-900 border-0 border-b-2 border-gray-200 focus:border-primary-500 focus:ring-0 px-0 py-1 bg-transparent"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirm Phase Switch Modal */}
      {confirmPhase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Switch to {confirmPhase.name}?</h3>
            <p className="text-sm text-gray-500 mb-1">{confirmPhase.desc}</p>
            <div className="bg-gray-50 rounded-lg p-3 my-4 text-xs space-y-1">
              <p><span className="text-gray-500">Customer:</span> <span className="font-semibold">{confirmPhase.pricing.customer}</span></p>
              <p><span className="text-gray-500">Vendor:</span> <span className="font-semibold">{confirmPhase.pricing.vendor}</span></p>
              <p><span className="text-gray-500">Platform:</span> <span className="font-semibold">{confirmPhase.pricing.platform}</span></p>
            </div>
            <p className="text-xs text-amber-600 mb-4">This will update all feature toggles to match this phase.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmPhase(null)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50">Cancel</button>
              <button onClick={() => activatePhase(confirmPhase)} disabled={saving}
                className={`px-4 py-2 text-sm font-semibold rounded-lg text-white ${COLOR_MAP[confirmPhase.color].btn} disabled:opacity-50`}>
                {saving ? "Switching..." : "Confirm Switch"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
