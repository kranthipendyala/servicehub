"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/admin/Toast";
import { adminFetch } from "@/lib/admin-api";

interface Settings {
  [key: string]: string;
}

const GEO_STAGES = [
  { id: "telangana", name: "Telangana", icon: "M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z", cities: "Hyderabad, Warangal, Nizamabad, Karimnagar, Khammam", target: "500+ vendors, 50K customers" },
  { id: "india", name: "All India", icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z", cities: "Mumbai, Delhi, Bangalore, Chennai, Pune + 500 cities", target: "25K+ vendors, 10L customers" },
];

const PHASES = [
  {
    id: "1",
    name: "Free for All",
    subtitle: "Month 1-6",
    description: "No fees, no commission, no subscription. Focus on building supply and demand. Vendors and customers use the platform completely free.",
    badge: "Growth Phase",
    gradient: "from-emerald-500 to-green-600",
    lightBg: "bg-emerald-50",
    lightBorder: "border-emerald-200",
    lightText: "text-emerald-700",
    ringColor: "ring-emerald-400",
    stages: [
      { geo: "telangana", label: "Stage 1A: Telangana Launch", desc: "Onboard vendors in Hyderabad first. Get 500+ vendors, run referral programs, offer guaranteed bookings to early vendors.", timeline: "Month 1-3" },
      { geo: "india", label: "Stage 1B: Pan-India Expansion", desc: "Expand to Mumbai, Delhi, Bangalore. Replicate Telangana playbook city by city. Target 5,000 vendors across 10 cities.", timeline: "Month 4-6" },
    ],
    features: [
      { label: "Payment", value: "Pay After Service", enabled: true },
      { label: "Platform Fee", value: "FREE", enabled: false },
      { label: "Commission", value: "0%", enabled: false },
      { label: "Vendor Payouts", value: "100% earnings", enabled: true },
    ],
    customerSees: "Service price + GST only",
    vendorGets: "100% of service amount",
    youEarn: "₹0 (investment phase)",
    settings: { platform_fee_enabled: "0", commission_enabled: "0", subscription_required: "0", surge_pricing_enabled: "0", cod_enabled: "1", online_payment_enabled: "0" },
  },
  {
    id: "2",
    name: "Platform Fee",
    subtitle: "Month 6-12",
    description: "Start earning by charging customers a small convenience fee per booking. Vendors still get 100% of their service price.",
    badge: "First Revenue",
    gradient: "from-blue-500 to-indigo-600",
    lightBg: "bg-blue-50",
    lightBorder: "border-blue-200",
    lightText: "text-blue-700",
    ringColor: "ring-blue-400",
    stages: [
      { geo: "telangana", label: "Stage 2A: Fee in Telangana", desc: "Enable ₹39 platform fee only for Telangana bookings first. Test customer acceptance. Monitor booking drop-off rates.", timeline: "Month 6-8" },
      { geo: "india", label: "Stage 2B: Fee Pan-India", desc: "Roll out platform fee nationwide. Enable surge pricing for weekends. Expected: ₹39-88 per booking revenue.", timeline: "Month 9-12" },
    ],
    features: [
      { label: "Platform Fee", value: "₹39/booking", enabled: true },
      { label: "Surge Pricing", value: "+₹49 weekends", enabled: true },
      { label: "Commission", value: "0%", enabled: false },
      { label: "Subscriptions", value: "Not Required", enabled: false },
    ],
    customerSees: "Service + ₹39 platform fee + GST",
    vendorGets: "100% of service amount",
    youEarn: "₹39-88 per booking",
    settings: { platform_fee_enabled: "1", commission_enabled: "0", subscription_required: "0", surge_pricing_enabled: "1", cod_enabled: "1", online_payment_enabled: "1" },
  },
  {
    id: "3",
    name: "Subscriptions",
    subtitle: "Month 12-18",
    description: "Introduce vendor subscription plans. Free tier with booking limits. Pro and Premium plans with more features and visibility.",
    badge: "Recurring Revenue",
    gradient: "from-purple-500 to-violet-600",
    lightBg: "bg-purple-50",
    lightBorder: "border-purple-200",
    lightText: "text-purple-700",
    ringColor: "ring-purple-400",
    stages: [
      { geo: "telangana", label: "Stage 3A: Subscriptions in Telangana", desc: "Launch subscription plans for Telangana vendors. Offer 3-month free Pro trial to top vendors. Gather feedback, refine plans.", timeline: "Month 12-14" },
      { geo: "india", label: "Stage 3B: Subscriptions Pan-India", desc: "Roll out subscription plans nationwide. Run promotions: First month free. Target 200+ paying subscribers across India.", timeline: "Month 15-18" },
    ],
    features: [
      { label: "Platform Fee", value: "₹39/booking", enabled: true },
      { label: "Subscriptions", value: "₹499-1999/mo", enabled: true },
      { label: "Commission", value: "0%", enabled: false },
      { label: "Free Tier", value: "10 bookings/mo", enabled: true },
    ],
    customerSees: "Service + ₹39 platform fee + GST",
    vendorGets: "100% (subscribers get priority)",
    youEarn: "₹39/booking + ₹499-1999/vendor/mo",
    settings: { platform_fee_enabled: "1", commission_enabled: "0", subscription_required: "1", surge_pricing_enabled: "1", cod_enabled: "1", online_payment_enabled: "1" },
  },
  {
    id: "4",
    name: "Full Monetization",
    subtitle: "Month 18+",
    description: "Maximum revenue. Platform fee + commission + subscriptions. Premium subscribers get lower commission rates as incentive.",
    badge: "Maximum Revenue",
    gradient: "from-amber-500 to-orange-600",
    lightBg: "bg-amber-50",
    lightBorder: "border-amber-200",
    lightText: "text-amber-700",
    ringColor: "ring-amber-400",
    stages: [
      { geo: "telangana", label: "Stage 4A: Commission in Telangana", desc: "Enable 10% commission for Telangana vendors first. Monitor vendor retention. Offer commission discount for Premium subscribers (5%).", timeline: "Month 18-20" },
      { geo: "india", label: "Stage 4B: Commission Pan-India", desc: "Roll out commission nationwide at 15%. Premium vendors pay 10%. Expected: ₹39 fee + 15% commission + subscriptions per booking.", timeline: "Month 21+" },
    ],
    features: [
      { label: "Platform Fee", value: "₹39/booking", enabled: true },
      { label: "Commission", value: "10-20%", enabled: true },
      { label: "Subscriptions", value: "₹499-1999/mo", enabled: true },
      { label: "Premium Discount", value: "-5% commission", enabled: true },
    ],
    customerSees: "Service + ₹39 fee + GST",
    vendorGets: "80-90% after commission",
    youEarn: "₹39/booking + 15% commission + subscriptions",
    settings: { platform_fee_enabled: "1", commission_enabled: "1", subscription_required: "1", surge_pricing_enabled: "1", cod_enabled: "0", online_payment_enabled: "1" },
  },
];

export default function RevenuePhaseSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingField, setSavingField] = useState("");

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    try {
      const res = await adminFetch<Settings>("/admin/settings");
      if (res.data) setSettings(res.data);
    } catch {
      toast("Failed to load settings", "error");
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (updates: Record<string, string>) => {
    try {
      await adminFetch("/admin/settings", { method: "POST", body: updates });
      setSettings(prev => ({ ...prev, ...updates }));
      return true;
    } catch {
      toast("Failed to save", "error");
      return false;
    }
  };

  const activatePhase = async (phase: typeof PHASES[0], geo: string) => {
    setSaving(true);
    const geoKey = `phase${phase.id}_geo`;
    const updates: Record<string, string> = { revenue_phase: phase.id, geo_scope: geo, [geoKey]: geo, ...phase.settings };
    const ok = await saveSettings(updates);
    if (ok) {
      const geoLabel = geo === "telangana" ? "Telangana" : "All India";
      toast(`Phase ${phase.id}: ${phase.name} (${geoLabel}) — Activated!`, "success");
    }
    setSaving(false);
  };

  const updateField = async (key: string, value: string) => {
    setSavingField(key);
    setSettings(prev => ({ ...prev, [key]: value }));
    await saveSettings({ [key]: value });
    setSavingField("");
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>;

  const currentPhase = settings.revenue_phase || "1";
  const currentGeo = settings.geo_scope || "telangana";
  const activePhaseData = PHASES.find(p => p.id === currentPhase) || PHASES[0];
  const activeGeoData = GEO_STAGES.find(g => g.id === currentGeo) || GEO_STAGES[0];
  const activeStage = currentGeo === "telangana" ? "A" : "B";

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Revenue Phases & Geo Expansion</h1>
          <p className="text-sm text-gray-500 mt-1">Each phase has 2 stages: Telangana first, then All India. Changes apply immediately.</p>
        </div>
        <div className={`px-4 py-3 rounded-xl ${activePhaseData.lightBg} ${activePhaseData.lightBorder} border`}>
          <p className="text-xs text-gray-500">Currently Active</p>
          <p className={`font-bold ${activePhaseData.lightText}`}>Phase {currentPhase}{activeStage}: {activePhaseData.name}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={activeGeoData.icon} /></svg>
            <span className="text-xs font-medium text-gray-600">{activeGeoData.name}</span>
          </div>
        </div>
      </div>

      {/* Phase Timeline */}
      <div className="relative">
        {/* Connecting line */}
        <div className="hidden lg:block absolute top-[60px] left-[calc(12.5%)] right-[calc(12.5%)] h-1 bg-gray-200 rounded-full z-0">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${activePhaseData.gradient} transition-all duration-700`}
            style={{ width: `${((parseInt(currentPhase) - 1) / 3) * 100}%` }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PHASES.map((phase, idx) => {
            const isActive = currentPhase === phase.id;
            const isPast = parseInt(currentPhase) > parseInt(phase.id);

            return (
              <div key={phase.id} className="relative z-10">
                {/* Phase number circle */}
                <div className="flex justify-center mb-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    isActive ? `bg-gradient-to-br ${phase.gradient} text-white shadow-lg ring-4 ring-offset-2 ${phase.ringColor}/30` :
                    isPast ? `bg-gradient-to-br ${phase.gradient} text-white` :
                    "bg-gray-200 text-gray-500"
                  }`}>
                    {isPast && !isActive ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    ) : phase.id}
                  </div>
                </div>

                {/* Card */}
                <div className={`rounded-2xl border-2 p-5 transition-all h-full flex flex-col ${
                  isActive ? `${phase.lightBg} ${phase.lightBorder} shadow-lg` : "bg-white border-gray-200 hover:border-gray-300"
                }`}>
                  {/* Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? phase.lightText : "text-gray-400"}`}>{phase.badge}</span>
                    {isActive && <span className="flex items-center gap-1 text-[10px] font-bold text-green-600"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />LIVE</span>}
                  </div>

                  <h3 className={`text-lg font-bold mb-0.5 ${isActive ? phase.lightText : "text-gray-900"}`}>{phase.name}</h3>
                  <p className="text-xs text-gray-400 mb-3">{phase.subtitle}</p>
                  <p className={`text-xs leading-relaxed mb-4 flex-1 ${isActive ? "text-gray-600" : "text-gray-500"}`}>{phase.description}</p>

                  {/* Feature list */}
                  <div className="space-y-2 mb-4">
                    {phase.features.map(f => (
                      <div key={f.label} className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">{f.label}</span>
                        <span className={`font-semibold ${f.enabled ? (isActive ? phase.lightText : "text-gray-900") : "text-gray-300"}`}>{f.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Revenue breakdown */}
                  <div className={`rounded-xl p-3 text-xs space-y-1 mb-4 ${isActive ? "bg-white/60" : "bg-gray-50"}`}>
                    <div className="flex justify-between"><span className="text-gray-500">Customer sees:</span><span className="font-medium text-gray-700">{phase.customerSees}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Vendor gets:</span><span className="font-medium text-gray-700">{phase.vendorGets}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">You earn:</span><span className={`font-bold ${isActive ? phase.lightText : "text-gray-900"}`}>{phase.youEarn}</span></div>
                  </div>

                  {/* Geo Stages */}
                  <div className="space-y-2 mb-4">
                    {phase.stages.map((stage) => {
                      const isStageActive = isActive && currentGeo === stage.geo;
                      const stageGeo = GEO_STAGES.find(g => g.id === stage.geo);
                      return (
                        <div key={stage.geo} className={`rounded-lg p-3 border text-xs ${isStageActive ? "bg-white border-green-200" : "bg-gray-50/50 border-gray-100"}`}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                              <svg className={`w-3.5 h-3.5 ${isStageActive ? "text-green-500" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={stageGeo?.icon || ""} /></svg>
                              <span className={`font-bold ${isStageActive ? "text-green-700" : "text-gray-600"}`}>{stage.label}</span>
                            </div>
                            {isStageActive && <span className="flex items-center gap-1 text-[9px] font-bold text-green-600"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />LIVE</span>}
                          </div>
                          <p className="text-gray-500 leading-relaxed">{stage.desc}</p>
                          <p className="text-gray-400 mt-1">{stage.timeline}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Action */}
                  {isActive ? (
                    <div className="space-y-2">
                      {currentGeo === "telangana" ? (
                        <button
                          onClick={() => activatePhase(phase, "india")}
                          disabled={saving}
                          className={`w-full py-2.5 text-sm font-bold rounded-xl transition-all disabled:opacity-50 text-white bg-gradient-to-r ${phase.gradient} hover:shadow-md active:scale-[0.98]`}
                        >
                          {saving ? "Expanding..." : "Expand to All India →"}
                        </button>
                      ) : (
                        <div className={`py-2.5 text-center rounded-xl text-sm font-bold ${phase.lightText} bg-white/50 border ${phase.lightBorder}`}>
                          Active — All India
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => activatePhase(phase, "telangana")}
                      disabled={saving}
                      className={`w-full py-2.5 text-sm font-bold rounded-xl transition-all disabled:opacity-50 text-white bg-gradient-to-r ${phase.gradient} hover:shadow-md active:scale-[0.98]`}
                    >
                      {saving ? "Switching..." : `Activate Phase ${phase.id}`}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fine-tune Controls */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900">Fine-tune Settings</h2>
          <p className="text-xs text-gray-500 mt-0.5">Override individual settings regardless of active phase. Changes apply instantly.</p>
        </div>

        <div className="divide-y divide-gray-100">
          {/* Geo Scope */}
          <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Geographic Scope</h3>
                  <p className="text-xs text-gray-400">Where services are available</p>
                </div>
              </div>
            </div>
            <div className="md:col-span-8">
              <div className="flex gap-3">
                {GEO_STAGES.map((geo) => (
                  <button
                    key={geo.id}
                    onClick={() => updateField("geo_scope", geo.id)}
                    className={`flex-1 p-3 rounded-xl border-2 text-left transition-all ${
                      currentGeo === geo.id
                        ? "border-teal-500 bg-teal-50 ring-2 ring-teal-200"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <svg className={`w-4 h-4 ${currentGeo === geo.id ? "text-teal-600" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={geo.icon} /></svg>
                      <span className={`text-sm font-bold ${currentGeo === geo.id ? "text-teal-700" : "text-gray-700"}`}>{geo.name}</span>
                      {currentGeo === geo.id && <span className="ml-auto text-[9px] font-bold text-green-600 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />ACTIVE</span>}
                    </div>
                    <p className="text-[10px] text-gray-500">{geo.cities}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Target: {geo.target}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Platform Fee */}
          <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" /></svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Platform Fee</h3>
                  <p className="text-xs text-gray-400">Convenience fee charged to customer</p>
                </div>
              </div>
            </div>
            <div className="md:col-span-3 flex items-center gap-3">
              <button onClick={() => updateField("platform_fee_enabled", settings.platform_fee_enabled === "1" ? "0" : "1")} className={`relative w-12 h-7 rounded-full transition-colors ${settings.platform_fee_enabled === "1" ? "bg-blue-600" : "bg-gray-200"}`}>
                <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.platform_fee_enabled === "1" ? "translate-x-5" : ""}`} />
              </button>
              <span className={`text-sm font-medium ${settings.platform_fee_enabled === "1" ? "text-blue-600" : "text-gray-400"}`}>{settings.platform_fee_enabled === "1" ? "ON" : "OFF"}</span>
            </div>
            <div className="md:col-span-5 flex items-center gap-3">
              <div className="flex-1">
                <label className="block text-[10px] text-gray-400 mb-1 uppercase tracking-wider">Fee Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                  <input type="number" value={settings.platform_fee_amount || "39"} onChange={e => updateField("platform_fee_amount", e.target.value)} className="w-full border rounded-lg pl-7 pr-3 py-2 text-sm" />
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-[10px] text-gray-400 mb-1 uppercase tracking-wider">Surge Extra</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">+₹</span>
                  <input type="number" value={settings.surge_fee_amount || "49"} onChange={e => updateField("surge_fee_amount", e.target.value)} className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm" />
                </div>
              </div>
            </div>
          </div>

          {/* Commission */}
          <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Vendor Commission</h3>
                  <p className="text-xs text-gray-400">Deducted from vendor payout per booking</p>
                </div>
              </div>
            </div>
            <div className="md:col-span-3 flex items-center gap-3">
              <button onClick={() => updateField("commission_enabled", settings.commission_enabled === "1" ? "0" : "1")} className={`relative w-12 h-7 rounded-full transition-colors ${settings.commission_enabled === "1" ? "bg-amber-600" : "bg-gray-200"}`}>
                <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.commission_enabled === "1" ? "translate-x-5" : ""}`} />
              </button>
              <span className={`text-sm font-medium ${settings.commission_enabled === "1" ? "text-amber-600" : "text-gray-400"}`}>{settings.commission_enabled === "1" ? "ON" : "OFF"}</span>
            </div>
            <div className="md:col-span-5">
              <label className="block text-[10px] text-gray-400 mb-1 uppercase tracking-wider">Default Rate</label>
              <div className="relative">
                <input type="number" value={settings.default_commission_rate || "15"} onChange={e => updateField("default_commission_rate", e.target.value)} className="w-full border rounded-lg px-3 pr-8 py-2 text-sm" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Set per-category rates in <a href="/admin/commissions" className="text-blue-500 underline">Commissions</a></p>
            </div>
          </div>

          {/* Subscriptions */}
          <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Vendor Subscriptions</h3>
                  <p className="text-xs text-gray-400">Require subscription for receiving bookings</p>
                </div>
              </div>
            </div>
            <div className="md:col-span-3 flex items-center gap-3">
              <button onClick={() => updateField("subscription_required", settings.subscription_required === "1" ? "0" : "1")} className={`relative w-12 h-7 rounded-full transition-colors ${settings.subscription_required === "1" ? "bg-purple-600" : "bg-gray-200"}`}>
                <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.subscription_required === "1" ? "translate-x-5" : ""}`} />
              </button>
              <span className={`text-sm font-medium ${settings.subscription_required === "1" ? "text-purple-600" : "text-gray-400"}`}>{settings.subscription_required === "1" ? "Required" : "Optional"}</span>
            </div>
            <div className="md:col-span-5">
              <label className="block text-[10px] text-gray-400 mb-1 uppercase tracking-wider">Free bookings/month (without subscription)</label>
              <input type="number" value={settings.free_bookings_per_month || "999"} onChange={e => updateField("free_bookings_per_month", e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
              <p className="text-[10px] text-gray-400 mt-1">Manage plans in <a href="/admin/subscriptions" className="text-blue-500 underline">Subscription Plans</a></p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer sees */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center"><svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></span>
            What Customer Sees
          </h3>
          <p className="text-xs text-gray-400 mb-4">Booking checkout preview (₹500 service)</p>
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">AC Repair Service</span><span className="text-gray-900">₹500</span></div>
            {settings.platform_fee_enabled === "1" && <div className="flex justify-between"><span className="text-gray-500">Platform Fee</span><span className="text-blue-600">₹{settings.platform_fee_amount || 39}</span></div>}
            <div className="flex justify-between"><span className="text-gray-500">GST (18%)</span><span className="text-gray-900">₹90</span></div>
            <div className="border-t pt-2 flex justify-between font-bold"><span>Total</span><span className="text-primary-600">₹{590 + (settings.platform_fee_enabled === "1" ? parseInt(settings.platform_fee_amount || "39") : 0)}</span></div>
          </div>
        </div>

        {/* Vendor sees */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center"><svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.384-3.08A.5.5 0 005.5 12.5v0a.5.5 0 00.536.49l6.293-.54" /></svg></span>
            What Vendor Gets
          </h3>
          <p className="text-xs text-gray-400 mb-4">Payout breakdown (₹500 service)</p>
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Service Amount</span><span className="text-gray-900">₹500</span></div>
            {settings.commission_enabled === "1" && (
              <div className="flex justify-between"><span className="text-gray-500">Commission ({settings.default_commission_rate || 15}%)</span><span className="text-red-500">-₹{Math.round(500 * parseInt(settings.default_commission_rate || "15") / 100)}</span></div>
            )}
            <div className="border-t pt-2 flex justify-between font-bold">
              <span>Vendor Payout</span>
              <span className="text-emerald-600">₹{500 - (settings.commission_enabled === "1" ? Math.round(500 * parseInt(settings.default_commission_rate || "15") / 100) : 0)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
