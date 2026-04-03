"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getVendorToken,
  getVendorUser,
  getOnboardingStatus,
  saveOnboardingStep,
  completeOnboarding,
  setVendorAuth,
  getVendorCategories,
  updateVendorCategories,
  getServiceAreas,
  updateServiceAreas,
  type OnboardingStatus,
} from "@/lib/vendor-api";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ServiceEntry {
  id: string;
  name: string;
  category_id: string;
  base_price: string;
  duration: string;
}

interface KycDocs {
  aadhaar_url: string;
  pan_url: string;
  gst_url: string;
  trade_license_url: string;
}

interface BankInfo {
  account_holder_name: string;
  account_number: string;
  confirm_account_number: string;
  ifsc_code: string;
  bank_name: string;
  branch_name: string;
  upi_id: string;
}

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  children?: CategoryItem[];
}

interface CityItem {
  id: number;
  name: string;
  slug: string;
  state_name?: string;
}

const STEPS = [
  { num: 1, label: "Business Profile" },
  { num: 2, label: "Categories" },
  { num: 3, label: "Service Areas" },
  { num: 4, label: "Services" },
  { num: 5, label: "KYC Documents" },
  { num: 6, label: "Bank Details" },
];

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function VendorOnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [status, setStatus] = useState<OnboardingStatus | null>(null);

  // Dynamic data
  const [allCategories, setAllCategories] = useState<CategoryItem[]>([]);
  const [allCities, setAllCities] = useState<CityItem[]>([]);

  // Step 1: Business Profile
  const [biz, setBiz] = useState({
    name: "", short_description: "", full_description: "",
    address: "", pin_code: "", phone: "", email: "",
    website: "", logo_url: "",
    open_time: "09:00", close_time: "18:00", working_days: "Mon-Sat",
  });

  // Step 2: Categories
  const [selectedCatIds, setSelectedCatIds] = useState<Set<number>>(new Set());

  // Step 3: Service Areas
  const [selectedCityIds, setSelectedCityIds] = useState<Set<number>>(new Set());

  // Step 4: Services
  const [services, setServices] = useState<ServiceEntry[]>([
    { id: "1", name: "", category_id: "", base_price: "", duration: "" },
  ]);

  // Step 5: KYC
  const [kyc, setKyc] = useState<KycDocs>({ aadhaar_url: "", pan_url: "", gst_url: "", trade_license_url: "" });

  // Step 6: Bank
  const [bank, setBank] = useState<BankInfo>({
    account_holder_name: "", account_number: "", confirm_account_number: "",
    ifsc_code: "", bank_name: "", branch_name: "", upi_id: "",
  });

  // Fetch all data on load
  useEffect(() => {
    const token = getVendorToken();
    if (!token) { router.replace("/vendor/login"); return; }

    // Pre-fill phone/email from vendor user
    const vendorUser = getVendorUser();
    if (vendorUser) {
      setBiz((prev) => ({ ...prev, phone: vendorUser.phone || prev.phone, email: vendorUser.email || prev.email }));
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [statusRes, catsRes, citiesRes, vendorCatsRes, areasRes] = await Promise.all([
          getOnboardingStatus(),
          fetch("/proxy-api/categories").then((r) => r.json()).catch(() => ({ data: { categories: [] } })),
          fetch("/proxy-api/cities").then((r) => r.json()).catch(() => ({ data: { cities: [] } })),
          getVendorCategories().catch(() => ({ data: [] })),
          getServiceAreas().catch(() => ({ data: [] })),
        ]);

        setStatus(statusRes.data);
        setAllCategories(catsRes.data?.categories || catsRes.data || []);
        const cityList = citiesRes.data?.cities || citiesRes.data || [];
        setAllCities(Array.isArray(cityList) ? cityList : []);

        // Pre-fill vendor's existing categories
        const vCats = Array.isArray(vendorCatsRes.data) ? vendorCatsRes.data : [];
        if (vCats.length > 0) setSelectedCatIds(new Set(vCats.map((c: any) => c.id)));

        // Pre-fill vendor's existing service areas
        const vAreas = Array.isArray(areasRes.data) ? areasRes.data : [];
        if (vAreas.length > 0) setSelectedCityIds(new Set(vAreas.map((a: any) => a.city_id)));

        // Pre-fill business info
        if (statusRes.data.business) {
          const b = statusRes.data.business;
          setBiz((prev) => ({
            ...prev,
            name: b.name || prev.name, short_description: b.short_description || prev.short_description,
            full_description: b.description || prev.full_description, address: b.address || prev.address,
            pin_code: b.pin_code || prev.pin_code, phone: b.phone || prev.phone,
            email: b.email || prev.email, website: b.website || prev.website, logo_url: b.logo || prev.logo_url,
          }));
        }

        // Auto-advance
        const s = statusRes.data;
        if (s.profile_complete && vCats.length === 0) setCurrentStep(2);
        else if (s.profile_complete && vCats.length > 0 && vAreas.length === 0) setCurrentStep(3);
        else if (s.profile_complete && vCats.length > 0 && vAreas.length > 0 && !s.services_added) setCurrentStep(4);
        else if (s.services_added && !s.documents_submitted) setCurrentStep(5);
        else if (s.documents_submitted && !s.bank_added) setCurrentStep(6);
      } catch {} finally { setLoading(false); }
    };
    fetchData();
  }, [router]);

  const updateBiz = (field: string, value: string) => setBiz((prev) => ({ ...prev, [field]: value }));

  // Selected parent categories for dropdown in services step
  const selectedCategories = allCategories.filter((c) => selectedCatIds.has(c.id));

  /* ---------------------------------------------------------------- */
  /*  Step savers                                                      */
  /* ---------------------------------------------------------------- */

  const saveStep1 = async () => {
    if (!biz.name.trim()) { setError("Business name is required"); return false; }
    if (!biz.address.trim()) { setError("Address is required"); return false; }
    if (!biz.phone.trim()) { setError("Phone is required"); return false; }
    setSaving(true); setError("");
    try {
      await saveOnboardingStep("business-profile", {
        name: biz.name, description: biz.full_description, short_description: biz.short_description,
        address: biz.address, pin_code: biz.pin_code, phone: biz.phone, email: biz.email,
        website: biz.website, logo: biz.logo_url,
        business_hours: `${biz.working_days} ${biz.open_time}-${biz.close_time}`,
      });
      return true;
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to save"); return false; }
    finally { setSaving(false); }
  };

  const saveStep2 = async () => {
    if (selectedCatIds.size === 0) { setError("Select at least one category"); return false; }
    setSaving(true); setError("");
    try {
      await updateVendorCategories(Array.from(selectedCatIds));
      return true;
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to save"); return false; }
    finally { setSaving(false); }
  };

  const saveStep3 = async () => {
    if (selectedCityIds.size === 0) { setError("Select at least one city"); return false; }
    setSaving(true); setError("");
    try {
      await updateServiceAreas(Array.from(selectedCityIds));
      return true;
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to save"); return false; }
    finally { setSaving(false); }
  };

  const saveStep4 = async () => {
    const valid = services.filter((s) => s.name.trim() && s.base_price.trim());
    if (valid.length === 0) { setError("Add at least one service"); return false; }
    setSaving(true); setError("");
    try {
      await saveOnboardingStep("services", {
        services: valid.map((s) => ({
          name: s.name.trim(), category_id: s.category_id ? Number(s.category_id) : undefined,
          base_price: parseFloat(s.base_price) || 0, duration: s.duration.trim(),
        })),
      });
      return true;
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to save"); return false; }
    finally { setSaving(false); }
  };

  const saveStep5 = async () => {
    if (!kyc.aadhaar_url.trim()) { setError("Aadhaar Card is required"); return false; }
    if (!kyc.pan_url.trim()) { setError("PAN Card is required"); return false; }
    setSaving(true); setError("");
    try {
      await saveOnboardingStep("kyc-documents", {
        documents: [
          { type: "aadhaar", url: kyc.aadhaar_url.trim() },
          { type: "pan", url: kyc.pan_url.trim() },
          ...(kyc.gst_url.trim() ? [{ type: "gst", url: kyc.gst_url.trim() }] : []),
          ...(kyc.trade_license_url.trim() ? [{ type: "trade_license", url: kyc.trade_license_url.trim() }] : []),
        ],
      });
      return true;
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to save"); return false; }
    finally { setSaving(false); }
  };

  const saveStep6 = async () => {
    if (!bank.account_holder_name.trim()) { setError("Account holder name required"); return false; }
    if (!bank.account_number.trim()) { setError("Account number required"); return false; }
    if (bank.account_number !== bank.confirm_account_number) { setError("Account numbers don't match"); return false; }
    if (!bank.ifsc_code.trim()) { setError("IFSC code required"); return false; }
    if (!bank.bank_name.trim()) { setError("Bank name required"); return false; }
    setSaving(true); setError("");
    try {
      await saveOnboardingStep("bank-details", {
        account_holder_name: bank.account_holder_name.trim(), account_number: bank.account_number.trim(),
        ifsc_code: bank.ifsc_code.trim(), bank_name: bank.bank_name.trim(),
        branch_name: bank.branch_name.trim(), upi_id: bank.upi_id.trim(),
      });
      return true;
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to save"); return false; }
    finally { setSaving(false); }
  };

  const handleNext = async () => {
    let ok = false;
    if (currentStep === 1) ok = await saveStep1();
    else if (currentStep === 2) ok = await saveStep2();
    else if (currentStep === 3) ok = await saveStep3();
    else if (currentStep === 4) ok = await saveStep4();
    else if (currentStep === 5) ok = await saveStep5();
    if (ok && currentStep < 6) { setCurrentStep(currentStep + 1); setError(""); window.scrollTo(0, 0); }
  };

  const handleSubmit = async () => {
    const ok = await saveStep6();
    if (!ok) return;
    setSaving(true);
    try {
      await completeOnboarding();
      const user = getVendorUser();
      if (user) setVendorAuth(getVendorToken() || "", { ...user, onboarding_completed: true });
      setShowSuccess(true);
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to submit"); }
    finally { setSaving(false); }
  };

  // Service helpers
  const addService = (catId?: string) => {
    setServices([...services, { id: String(Date.now()), name: "", category_id: catId || "", base_price: "", duration: "" }]);
  };
  const removeService = (id: string) => { if (services.length > 1) setServices(services.filter((s) => s.id !== id)); };
  const updateService = (id: string, field: keyof ServiceEntry, value: string) => {
    setServices(services.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  /* ---------------------------------------------------------------- */
  /*  Styles                                                           */
  /* ---------------------------------------------------------------- */

  const inputCls = "w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1";

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (showSuccess) return (
    <div className="flex items-center justify-center py-20">
      <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-xl shadow-primary-500/30">
          <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Welcome Aboard!</h2>
        <p className="text-gray-500 mb-3">Your application has been submitted for review.</p>
        <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 text-sm font-medium px-4 py-2 rounded-full mb-8">
          Review within 24-48 hours
        </div>
        <button onClick={() => router.replace("/vendor/dashboard")} className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl">
          Go to Dashboard
        </button>
      </div>
    </div>
  );

  const progressPercent = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  // Group cities by state
  const stateGroups: Record<string, CityItem[]> = {};
  allCities.forEach((c) => { const s = c.state_name || "Other"; if (!stateGroups[s]) stateGroups[s] = []; stateGroups[s].push(c); });

  // Group services by selected category for step 4
  const svcByCategory: Record<string, ServiceEntry[]> = {};
  services.forEach((s) => {
    const key = s.category_id || "0";
    if (!svcByCategory[key]) svcByCategory[key] = [];
    svcByCategory[key].push(s);
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="text-center mb-4">
          <p className="text-sm font-semibold text-primary-600">Step {currentStep} of {STEPS.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">{STEPS[currentStep - 1].label}</p>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
          <div className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="flex justify-between">
          {STEPS.map((s) => (
            <div key={s.num} className="flex flex-col items-center" style={{ width: `${100 / STEPS.length}%` }}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                currentStep > s.num ? "bg-primary-600 border-primary-600 text-white" :
                currentStep === s.num ? "bg-white border-primary-500 text-primary-600" :
                "bg-white border-gray-200 text-gray-400"
              }`}>
                {currentStep > s.num ? "✓" : s.num}
              </div>
              <span className="text-[10px] mt-1 text-center hidden sm:block text-gray-400">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
        {error && (
          <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600 flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {error}
          </div>
        )}

        {/* Step 1: Business Profile */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-gray-900">Business Profile</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2"><label className={labelCls}>Business Name *</label><input type="text" value={biz.name} onChange={(e) => updateBiz("name", e.target.value)} placeholder="Your business name" className={inputCls} /></div>
              <div className="sm:col-span-2"><label className={labelCls}>Short Description</label><input type="text" value={biz.short_description} onChange={(e) => updateBiz("short_description", e.target.value)} placeholder="One-line description" className={inputCls} maxLength={160} /></div>
              <div className="sm:col-span-2"><label className={labelCls}>Full Description</label><textarea value={biz.full_description} onChange={(e) => updateBiz("full_description", e.target.value)} placeholder="Detailed description..." className={`${inputCls} resize-y`} rows={3} /></div>
            </div>
            <hr className="border-gray-200" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2"><label className={labelCls}>Address *</label><input type="text" value={biz.address} onChange={(e) => updateBiz("address", e.target.value)} placeholder="Full address" className={inputCls} /></div>
              <div><label className={labelCls}>PIN Code</label><input type="text" value={biz.pin_code} onChange={(e) => updateBiz("pin_code", e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="6-digit PIN" className={inputCls} /></div>
              <div><label className={labelCls}>Phone *</label><input type="tel" value={biz.phone} onChange={(e) => updateBiz("phone", e.target.value)} placeholder="Business phone" className={inputCls} /></div>
              <div><label className={labelCls}>Email</label><input type="email" value={biz.email} onChange={(e) => updateBiz("email", e.target.value)} placeholder="business@example.com" className={inputCls} /></div>
              <div><label className={labelCls}>Website</label><input type="url" value={biz.website} onChange={(e) => updateBiz("website", e.target.value)} placeholder="https://..." className={inputCls} /></div>
            </div>
            <hr className="border-gray-200" />
            <div>
              <label className={`${labelCls} mb-3`}>Business Hours</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div><label className="block text-xs text-gray-500 mb-1">Working Days</label><select value={biz.working_days} onChange={(e) => updateBiz("working_days", e.target.value)} className={inputCls}><option value="Mon-Sat">Mon - Sat</option><option value="Mon-Fri">Mon - Fri</option><option value="Mon-Sun">Mon - Sun</option></select></div>
                <div><label className="block text-xs text-gray-500 mb-1">Open</label><input type="time" value={biz.open_time} onChange={(e) => updateBiz("open_time", e.target.value)} className={inputCls} /></div>
                <div><label className="block text-xs text-gray-500 mb-1">Close</label><input type="time" value={biz.close_time} onChange={(e) => updateBiz("close_time", e.target.value)} className={inputCls} /></div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Select Categories */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Select Your Categories</h3>
            <p className="text-sm text-gray-500">Choose all service categories your business offers. You'll add specific services under each in the next steps.</p>
            <div className="space-y-2">
              {allCategories.map((cat) => {
                const isSelected = selectedCatIds.has(cat.id);
                return (
                  <label key={cat.id} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border cursor-pointer transition-all ${isSelected ? "bg-primary-50 border-primary-300" : "bg-white border-gray-200 hover:border-gray-300"}`}>
                    <input type="checkbox" checked={isSelected} onChange={() => {
                      setSelectedCatIds((prev) => { const n = new Set(prev); n.has(cat.id) ? n.delete(cat.id) : n.add(cat.id); return n; });
                    }} className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                    <div>
                      <span className={`text-sm font-semibold ${isSelected ? "text-primary-800" : "text-gray-700"}`}>{cat.name}</span>
                      {cat.children && cat.children.length > 0 && (
                        <p className="text-xs text-gray-400 mt-0.5">{cat.children.map((c) => c.name).join(", ")}</p>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
            <p className="text-xs text-gray-400">{selectedCatIds.size} categories selected</p>
          </div>
        )}

        {/* Step 3: Select Service Areas */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Select Service Areas</h3>
            <p className="text-sm text-gray-500">Choose the cities where you provide services.</p>
            {Object.entries(stateGroups).map(([state, cities]) => (
              <div key={state}>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{state}</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {cities.map((city) => {
                    const isSelected = selectedCityIds.has(city.id);
                    return (
                      <label key={city.id} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer text-sm transition-all ${isSelected ? "bg-primary-50 border-primary-300 text-primary-700 font-medium" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                        <input type="checkbox" checked={isSelected} onChange={() => {
                          setSelectedCityIds((prev) => { const n = new Set(prev); n.has(city.id) ? n.delete(city.id) : n.add(city.id); return n; });
                        }} className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                        {city.name}
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
            <p className="text-xs text-gray-400">{selectedCityIds.size} cities selected</p>
          </div>
        )}

        {/* Step 4: Add Services under each category */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Add Services</h3>
            <p className="text-sm text-gray-500">Add at least one service under your selected categories with your pricing.</p>

            {selectedCategories.length === 0 ? (
              <p className="text-sm text-amber-600">No categories selected. Go back to step 2.</p>
            ) : (
              selectedCategories.map((cat) => {
                const catServices = services.filter((s) => s.category_id === String(cat.id));
                return (
                  <div key={cat.id} className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-gray-800">{cat.name}</h4>
                      <button type="button" onClick={() => addService(String(cat.id))} className="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                        Add
                      </button>
                    </div>
                    <div className="p-4 space-y-3">
                      {catServices.length === 0 ? (
                        <button type="button" onClick={() => addService(String(cat.id))} className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-400 hover:border-primary-300 hover:text-primary-600 transition-colors">
                          + Add first service under {cat.name}
                        </button>
                      ) : (
                        catServices.map((svc, idx) => (
                          <div key={svc.id} className="grid grid-cols-12 gap-2 items-end">
                            <div className="col-span-5"><label className="block text-xs text-gray-500 mb-1">Name *</label><input type="text" value={svc.name} onChange={(e) => updateService(svc.id, "name", e.target.value)} placeholder="e.g. Pipe Fitting" className={inputCls} /></div>
                            <div className="col-span-3"><label className="block text-xs text-gray-500 mb-1">Price (Rs.) *</label><input type="text" value={svc.base_price} onChange={(e) => updateService(svc.id, "base_price", e.target.value.replace(/[^\d]/g, ""))} placeholder="500" className={inputCls} /></div>
                            <div className="col-span-3"><label className="block text-xs text-gray-500 mb-1">Duration (min)</label><input type="text" value={svc.duration} onChange={(e) => updateService(svc.id, "duration", e.target.value.replace(/\D/g, ""))} placeholder="30" className={inputCls} /></div>
                            <div className="col-span-1 flex justify-center">
                              <button type="button" onClick={() => removeService(svc.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Step 5: KYC */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">KYC Documents</h3>
            <p className="text-sm text-gray-500">Upload documents for verification.</p>
            {([
              { label: "Aadhaar Card", field: "aadhaar_url" as keyof KycDocs, required: true },
              { label: "PAN Card", field: "pan_url" as keyof KycDocs, required: true },
              { label: "GST Certificate", field: "gst_url" as keyof KycDocs },
              { label: "Trade License", field: "trade_license_url" as keyof KycDocs },
            ]).map((doc) => (
              <div key={doc.field}>
                <label className={labelCls}>{doc.label} {doc.required && <span className="text-red-500">*</span>}</label>
                <input type="url" value={kyc[doc.field]} onChange={(e) => setKyc({ ...kyc, [doc.field]: e.target.value })} placeholder="Paste document URL" className={inputCls} />
              </div>
            ))}
          </div>
        )}

        {/* Step 6: Bank */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Bank Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2"><label className={labelCls}>Account Holder *</label><input type="text" value={bank.account_holder_name} onChange={(e) => setBank({ ...bank, account_holder_name: e.target.value })} className={inputCls} /></div>
              <div><label className={labelCls}>Account Number *</label><input type="text" value={bank.account_number} onChange={(e) => setBank({ ...bank, account_number: e.target.value.replace(/\D/g, "") })} className={inputCls} /></div>
              <div><label className={labelCls}>Confirm Account *</label><input type="text" value={bank.confirm_account_number} onChange={(e) => setBank({ ...bank, confirm_account_number: e.target.value.replace(/\D/g, "") })} className={inputCls} /></div>
              <div><label className={labelCls}>IFSC Code *</label><input type="text" value={bank.ifsc_code} onChange={(e) => setBank({ ...bank, ifsc_code: e.target.value.toUpperCase().slice(0, 11) })} className={inputCls} maxLength={11} /></div>
              <div><label className={labelCls}>Bank Name *</label><input type="text" value={bank.bank_name} onChange={(e) => setBank({ ...bank, bank_name: e.target.value })} className={inputCls} /></div>
              <div><label className={labelCls}>Branch</label><input type="text" value={bank.branch_name} onChange={(e) => setBank({ ...bank, branch_name: e.target.value })} className={inputCls} /></div>
              <div><label className={labelCls}>UPI ID</label><input type="text" value={bank.upi_id} onChange={(e) => setBank({ ...bank, upi_id: e.target.value })} placeholder="name@upi" className={inputCls} /></div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6 pb-8">
        <button type="button" onClick={() => { if (currentStep > 1) { setCurrentStep(currentStep - 1); setError(""); window.scrollTo(0, 0); } }} disabled={currentStep === 1}
          className="px-5 py-2.5 text-sm font-medium text-gray-600 rounded-xl border border-gray-300 hover:bg-gray-50 disabled:opacity-40">
          Back
        </button>
        {currentStep < 6 ? (
          <button type="button" onClick={handleNext} disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-sm font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 disabled:opacity-60 flex items-center gap-2">
            {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {saving ? "Saving..." : "Save & Continue"}
          </button>
        ) : (
          <button type="button" onClick={handleSubmit} disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-sm font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 disabled:opacity-60 flex items-center gap-2">
            {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {saving ? "Submitting..." : "Submit for Review"}
          </button>
        )}
      </div>
    </div>
  );
}
