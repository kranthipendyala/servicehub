"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  getVendorToken,
  getVendorUser,
  getOnboardingStatus,
  saveOnboardingStep,
  completeOnboarding,
  setVendorAuth,
  type OnboardingStatus,
} from "@/lib/vendor-api";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ServiceEntry {
  id: string;
  name: string;
  category: string;
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

const STEPS = [
  { num: 1, label: "Business Profile", icon: "M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21", encouragement: "Great start! Tell us about your business." },
  { num: 2, label: "Add Services", icon: "M11.42 15.17l-5.384-3.08A.5.5 0 005.5 12.5v0a.5.5 0 00.536.49l6.293-.54m-.93 2.72l2.08 3.6a.5.5 0 00.836.06l3.327-4.272a.5.5 0 00-.188-.752l-5.126-2.636m-2.929 4l5.08-7.08a.5.5 0 01.768-.077l2.077 1.927a.5.5 0 01.03.745L13.42 15.17a.5.5 0 01-.698.063l-1.302-1.063z", encouragement: "You're doing great! List your services." },
  { num: 3, label: "KYC Documents", icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z", encouragement: "Almost there! Upload your documents." },
  { num: 4, label: "Bank Details", icon: "M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z", encouragement: "One last step! Set up your payouts." },
];

/* ------------------------------------------------------------------ */
/*  Main Page Component                                                */
/* ------------------------------------------------------------------ */

export default function VendorOnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [status, setStatus] = useState<OnboardingStatus | null>(null);

  // Step 1: Business Profile
  const [biz, setBiz] = useState({
    name: "",
    short_description: "",
    full_description: "",
    address: "",
    city: "",
    locality: "",
    pin_code: "",
    phone: "",
    email: "",
    website: "",
    logo_url: "",
    open_time: "09:00",
    close_time: "18:00",
    working_days: "Mon-Sat",
  });

  // Step 2: Services
  const [services, setServices] = useState<ServiceEntry[]>([
    { id: "1", name: "", category: "", base_price: "", duration: "" },
  ]);

  // Step 3: KYC
  const [kyc, setKyc] = useState<KycDocs>({
    aadhaar_url: "",
    pan_url: "",
    gst_url: "",
    trade_license_url: "",
  });

  // Step 4: Bank
  const [bank, setBank] = useState<BankInfo>({
    account_holder_name: "",
    account_number: "",
    confirm_account_number: "",
    ifsc_code: "",
    bank_name: "",
    branch_name: "",
    upi_id: "",
  });

  // Fetch onboarding status
  useEffect(() => {
    const token = getVendorToken();
    if (!token) {
      router.replace("/vendor/login");
      return;
    }

    const fetchStatus = async () => {
      setLoading(true);
      try {
        const res = await getOnboardingStatus();
        setStatus(res.data);

        // Pre-fill business info if available
        if (res.data.business) {
          const b = res.data.business;
          setBiz((prev) => ({
            ...prev,
            name: b.name || prev.name,
            short_description: b.short_description || prev.short_description,
            full_description: b.description || prev.full_description,
            address: b.address || prev.address,
            pin_code: b.pin_code || prev.pin_code,
            phone: b.phone || prev.phone,
            email: b.email || prev.email,
            website: b.website || prev.website,
            logo_url: b.logo || prev.logo_url,
          }));
        }

        // Auto-advance to first incomplete step
        if (res.data.profile_complete && !res.data.services_added) setCurrentStep(2);
        else if (res.data.services_added && !res.data.documents_submitted) setCurrentStep(3);
        else if (res.data.documents_submitted && !res.data.bank_added) setCurrentStep(4);
      } catch {
        // If status fails, just start from step 1
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, [router]);

  const updateBiz = (field: string, value: string) => {
    setBiz((prev) => ({ ...prev, [field]: value }));
  };

  /* ---------------------------------------------------------------- */
  /*  Step validators and savers                                       */
  /* ---------------------------------------------------------------- */

  const saveStep1 = async () => {
    if (!biz.name.trim()) { setError("Business name is required"); return false; }
    if (!biz.address.trim()) { setError("Address is required"); return false; }
    if (!biz.phone.trim()) { setError("Phone number is required"); return false; }

    setSaving(true);
    setError("");
    try {
      await saveOnboardingStep("business-profile", {
        ...biz,
        business_hours: `${biz.working_days} ${biz.open_time}-${biz.close_time}`,
      });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const saveStep2 = async () => {
    const validServices = services.filter((s) => s.name.trim() && s.base_price.trim());
    if (validServices.length === 0) {
      setError("Add at least one service with name and price");
      return false;
    }

    setSaving(true);
    setError("");
    try {
      await saveOnboardingStep("services", {
        services: validServices.map((s) => ({
          name: s.name.trim(),
          category: s.category.trim(),
          base_price: parseFloat(s.base_price) || 0,
          duration: s.duration.trim(),
        })),
      });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const saveStep3 = async () => {
    if (!kyc.aadhaar_url.trim()) { setError("Aadhaar Card is required"); return false; }
    if (!kyc.pan_url.trim()) { setError("PAN Card is required"); return false; }

    setSaving(true);
    setError("");
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const saveStep4 = async () => {
    if (!bank.account_holder_name.trim()) { setError("Account holder name is required"); return false; }
    if (!bank.account_number.trim()) { setError("Account number is required"); return false; }
    if (bank.account_number !== bank.confirm_account_number) { setError("Account numbers do not match"); return false; }
    if (!bank.ifsc_code.trim()) { setError("IFSC code is required"); return false; }
    if (!bank.bank_name.trim()) { setError("Bank name is required"); return false; }

    setSaving(true);
    setError("");
    try {
      await saveOnboardingStep("bank-details", {
        account_holder_name: bank.account_holder_name.trim(),
        account_number: bank.account_number.trim(),
        ifsc_code: bank.ifsc_code.trim(),
        bank_name: bank.bank_name.trim(),
        branch_name: bank.branch_name.trim(),
        upi_id: bank.upi_id.trim(),
      });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    let success = false;
    if (currentStep === 1) success = await saveStep1();
    else if (currentStep === 2) success = await saveStep2();
    else if (currentStep === 3) success = await saveStep3();

    if (success && currentStep < 4) {
      setCurrentStep(currentStep + 1);
      setError("");
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError("");
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    const step4Ok = await saveStep4();
    if (!step4Ok) return;

    setSaving(true);
    try {
      await completeOnboarding();

      // Update local user to mark onboarding complete
      const user = getVendorUser();
      if (user) {
        setVendorAuth(
          getVendorToken() || "",
          { ...user, onboarding_completed: true }
        );
      }

      setShowSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSaving(false);
    }
  };

  // Services helpers
  const addService = () => {
    setServices([...services, { id: String(Date.now()), name: "", category: "", base_price: "", duration: "" }]);
  };

  const removeService = (id: string) => {
    if (services.length <= 1) return;
    setServices(services.filter((s) => s.id !== id));
  };

  const updateService = (id: string, field: keyof ServiceEntry, value: string) => {
    setServices(services.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  /* ---------------------------------------------------------------- */
  /*  Loading state                                                    */
  /* ---------------------------------------------------------------- */

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading onboarding status...</p>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Success modal with confetti animation                            */
  /* ---------------------------------------------------------------- */

  if (showSuccess) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center relative overflow-hidden">
          {/* Confetti-like decorations */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-4 left-6 w-3 h-3 bg-emerald-400 rounded-full animate-bounce" style={{ animationDuration: "1.5s", animationDelay: "0s" }} />
            <div className="absolute top-8 right-10 w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDuration: "1.8s", animationDelay: "0.2s" }} />
            <div className="absolute top-12 left-1/4 w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDuration: "1.3s", animationDelay: "0.4s" }} />
            <div className="absolute top-6 right-1/4 w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDuration: "1.6s", animationDelay: "0.1s" }} />
            <div className="absolute top-16 left-10 w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDuration: "2s", animationDelay: "0.3s" }} />
            <div className="absolute top-10 right-8 w-3 h-3 bg-emerald-300 rounded-full animate-bounce" style={{ animationDuration: "1.4s", animationDelay: "0.5s" }} />
            <div className="absolute top-20 left-8 w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDuration: "1.7s", animationDelay: "0.6s" }} />
            <div className="absolute top-14 right-16 w-2.5 h-2.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDuration: "1.9s", animationDelay: "0.15s" }} />

            {/* Square confetti */}
            <div className="absolute top-8 left-16 w-2 h-2 bg-yellow-300 rotate-45 animate-bounce" style={{ animationDuration: "1.5s", animationDelay: "0.25s" }} />
            <div className="absolute top-14 right-20 w-2 h-2 bg-emerald-400 rotate-12 animate-bounce" style={{ animationDuration: "1.8s", animationDelay: "0.35s" }} />
            <div className="absolute top-6 left-1/3 w-1.5 h-1.5 bg-blue-300 rotate-45 animate-bounce" style={{ animationDuration: "1.6s", animationDelay: "0.45s" }} />
            <div className="absolute top-18 right-1/3 w-2 h-2 bg-pink-300 rotate-12 animate-bounce" style={{ animationDuration: "2.1s", animationDelay: "0.55s" }} />
          </div>

          {/* Animated checkmark */}
          <div className="relative z-10">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/30 animate-[scaleIn_0.5s_ease-out]">
              <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>

            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Welcome Aboard!</h2>
            <p className="text-gray-500 mb-3 leading-relaxed">
              Your application has been submitted successfully.
            </p>
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-sm font-medium px-4 py-2 rounded-full mb-8">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Review within 24-48 hours
            </div>

            <button
              onClick={() => router.replace("/vendor/dashboard")}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg shadow-emerald-600/20"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Step progress bar - animated filled bar with labels              */
  /* ---------------------------------------------------------------- */

  const isStepComplete = (stepNum: number) => {
    return currentStep > stepNum || (status && (
      (stepNum === 1 && status.business_profile) ||
      (stepNum === 2 && status.services_added) ||
      (stepNum === 3 && status.kyc_documents) ||
      (stepNum === 4 && status.bank_details)
    ));
  };

  const progressPercent = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  const renderStepBar = () => (
    <div className="mb-8">
      {/* Encouragement text */}
      <div className="text-center mb-6">
        <p className="text-sm font-semibold text-emerald-600">
          Step {currentStep} of {STEPS.length}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {STEPS[currentStep - 1].encouragement}
        </p>
      </div>

      {/* Progress bar track */}
      <div className="relative mb-2">
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Step indicators on the bar */}
      <div className="relative flex items-start justify-between -mt-5">
        {STEPS.map((step) => {
          const complete = isStepComplete(step.num);
          const isCurrent = currentStep === step.num;

          return (
            <div key={step.num} className="flex flex-col items-center" style={{ width: `${100 / STEPS.length}%` }}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border-2 ${
                  complete
                    ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-500/30"
                    : isCurrent
                      ? "bg-white border-emerald-500 text-emerald-600 shadow-md"
                      : "bg-white border-gray-200 text-gray-400"
                }`}
              >
                {complete ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : (
                  step.num
                )}
              </div>
              <span className={`text-xs mt-2 font-medium text-center hidden sm:block ${
                isCurrent ? "text-emerald-700" : complete ? "text-emerald-600" : "text-gray-400"
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  /* ---------------------------------------------------------------- */
  /*  Input helper                                                     */
  /* ---------------------------------------------------------------- */

  const inputCls = "w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1";

  /* ---------------------------------------------------------------- */
  /*  Step 1: Business Profile                                         */
  /* ---------------------------------------------------------------- */

  const renderStep1 = () => (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={STEPS[0].icon} />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Business Profile</h3>
          <p className="text-sm text-gray-500">Tell customers about your business</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className={labelCls}>Business Name *</label>
          <input type="text" value={biz.name} onChange={(e) => updateBiz("name", e.target.value)} placeholder="Your business name" className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>Short Description</label>
          <input type="text" value={biz.short_description} onChange={(e) => updateBiz("short_description", e.target.value)} placeholder="One-line description of your services" className={inputCls} maxLength={160} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>Full Description</label>
          <textarea value={biz.full_description} onChange={(e) => updateBiz("full_description", e.target.value)} placeholder="Detailed description of your business, experience, and services..." className={`${inputCls} min-h-[100px] resize-y`} rows={4} />
        </div>
      </div>

      <hr className="border-gray-200" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className={labelCls}>Address *</label>
          <input type="text" value={biz.address} onChange={(e) => updateBiz("address", e.target.value)} placeholder="Street address" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>City</label>
          <input type="text" value={biz.city} onChange={(e) => updateBiz("city", e.target.value)} placeholder="City" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Locality</label>
          <input type="text" value={biz.locality} onChange={(e) => updateBiz("locality", e.target.value)} placeholder="Locality / Area" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>PIN Code</label>
          <input type="text" value={biz.pin_code} onChange={(e) => updateBiz("pin_code", e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="6-digit PIN" className={inputCls} />
        </div>
      </div>

      <hr className="border-gray-200" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Phone *</label>
          <input type="tel" value={biz.phone} onChange={(e) => updateBiz("phone", e.target.value)} placeholder="Business phone" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Email</label>
          <input type="email" value={biz.email} onChange={(e) => updateBiz("email", e.target.value)} placeholder="business@example.com" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Website</label>
          <input type="url" value={biz.website} onChange={(e) => updateBiz("website", e.target.value)} placeholder="https://..." className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Logo URL</label>
          <input type="url" value={biz.logo_url} onChange={(e) => updateBiz("logo_url", e.target.value)} placeholder="https://...logo.png" className={inputCls} />
        </div>
      </div>

      <hr className="border-gray-200" />

      <div>
        <label className={`${labelCls} mb-3`}>Business Hours</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Working Days</label>
            <select value={biz.working_days} onChange={(e) => updateBiz("working_days", e.target.value)} className={inputCls}>
              <option value="Mon-Sat">Mon - Sat</option>
              <option value="Mon-Fri">Mon - Fri</option>
              <option value="Mon-Sun">Mon - Sun</option>
              <option value="All Days">All Days</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Open Time</label>
            <input type="time" value={biz.open_time} onChange={(e) => updateBiz("open_time", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Close Time</label>
            <input type="time" value={biz.close_time} onChange={(e) => updateBiz("close_time", e.target.value)} className={inputCls} />
          </div>
        </div>
      </div>
    </div>
  );

  /* ---------------------------------------------------------------- */
  /*  Step 2: Services                                                 */
  /* ---------------------------------------------------------------- */

  const renderStep2 = () => (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={STEPS[1].icon} />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Add Your Services</h3>
          <p className="text-sm text-gray-500">Add at least one service you offer to customers</p>
        </div>
      </div>

      <div className="space-y-4">
        {services.map((svc, idx) => (
          <div key={svc.id} className="bg-gray-50 rounded-xl p-5 border border-gray-200 relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700">Service {idx + 1}</span>
              {services.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeService(svc.id)}
                  className="text-red-400 hover:text-red-600 transition-colors p-1"
                  title="Remove service"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Service Name *</label>
                <input
                  type="text"
                  value={svc.name}
                  onChange={(e) => updateService(svc.id, "name", e.target.value)}
                  placeholder="e.g. Engine Oil Change"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                <input
                  type="text"
                  value={svc.category}
                  onChange={(e) => updateService(svc.id, "category", e.target.value)}
                  placeholder="e.g. Car Service"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Base Price (INR) *</label>
                <input
                  type="text"
                  value={svc.base_price}
                  onChange={(e) => updateService(svc.id, "base_price", e.target.value.replace(/[^\d.]/g, ""))}
                  placeholder="e.g. 500"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Duration</label>
                <input
                  type="text"
                  value={svc.duration}
                  onChange={(e) => updateService(svc.id, "duration", e.target.value)}
                  placeholder="e.g. 30 mins"
                  className={inputCls}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addService}
        className="w-full py-2.5 px-4 border-2 border-dashed border-emerald-300 text-emerald-600 text-sm font-semibold rounded-xl hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Add Another Service
      </button>
    </div>
  );

  /* ---------------------------------------------------------------- */
  /*  Step 3: KYC                                                      */
  /* ---------------------------------------------------------------- */

  const KycField = ({
    label,
    required,
    value,
    field,
    status: docStatus,
  }: {
    label: string;
    required?: boolean;
    value: string;
    field: keyof KycDocs;
    status?: boolean;
  }) => (
    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
        value.trim() ? "bg-emerald-100" : "bg-gray-200"
      }`}>
        {value.trim() ? (
          <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9.75m3 0H9.75m0 0v3m0-3v-3m10.5-3V6.375c0-.621-.504-1.125-1.125-1.125H4.125C3.504 5.25 3 5.754 3 6.375v11.25c0 .621.504 1.125 1.125 1.125h15.75c.621 0 1.125-.504 1.125-1.125V12.75z" />
          </svg>
        )}
      </div>
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
        <input
          type="url"
          value={value}
          onChange={(e) => setKyc((prev) => ({ ...prev, [field]: e.target.value }))}
          placeholder="Paste document URL here"
          className={inputCls}
        />
        <p className="text-xs text-gray-400 mt-1">Upload your document and paste the URL</p>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={STEPS[2].icon} />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">KYC Documents</h3>
          <p className="text-sm text-gray-500">Upload required documents for verification</p>
        </div>
      </div>

      <div className="space-y-3">
        <KycField label="Aadhaar Card" required value={kyc.aadhaar_url} field="aadhaar_url" />
        <KycField label="PAN Card" required value={kyc.pan_url} field="pan_url" />
        <KycField label="GST Certificate" value={kyc.gst_url} field="gst_url" />
        <KycField label="Trade License" value={kyc.trade_license_url} field="trade_license_url" />
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700 flex items-start gap-2">
        <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <span>Documents will be verified by our team. Ensure all documents are clear and legible.</span>
      </div>
    </div>
  );

  /* ---------------------------------------------------------------- */
  /*  Step 4: Bank Details                                             */
  /* ---------------------------------------------------------------- */

  const renderStep4 = () => (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={STEPS[3].icon} />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Bank Details</h3>
          <p className="text-sm text-gray-500">Add your bank account for receiving payouts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className={labelCls}>Account Holder Name *</label>
          <input
            type="text"
            value={bank.account_holder_name}
            onChange={(e) => setBank((b) => ({ ...b, account_holder_name: e.target.value }))}
            placeholder="As per bank records"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Account Number *</label>
          <input
            type="text"
            value={bank.account_number}
            onChange={(e) => setBank((b) => ({ ...b, account_number: e.target.value.replace(/\D/g, "") }))}
            placeholder="Account number"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Confirm Account Number *</label>
          <input
            type="text"
            value={bank.confirm_account_number}
            onChange={(e) => setBank((b) => ({ ...b, confirm_account_number: e.target.value.replace(/\D/g, "") }))}
            placeholder="Re-enter account number"
            className={inputCls}
          />
          {bank.confirm_account_number && bank.account_number !== bank.confirm_account_number && (
            <p className="text-xs text-red-500 mt-1">Account numbers do not match</p>
          )}
        </div>
        <div>
          <label className={labelCls}>IFSC Code *</label>
          <input
            type="text"
            value={bank.ifsc_code}
            onChange={(e) => setBank((b) => ({ ...b, ifsc_code: e.target.value.toUpperCase().slice(0, 11) }))}
            placeholder="e.g. SBIN0001234"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Bank Name *</label>
          <input
            type="text"
            value={bank.bank_name}
            onChange={(e) => setBank((b) => ({ ...b, bank_name: e.target.value }))}
            placeholder="e.g. State Bank of India"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Branch</label>
          <input
            type="text"
            value={bank.branch_name}
            onChange={(e) => setBank((b) => ({ ...b, branch_name: e.target.value }))}
            placeholder="Branch name (optional)"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>UPI ID</label>
          <input
            type="text"
            value={bank.upi_id}
            onChange={(e) => setBank((b) => ({ ...b, upi_id: e.target.value }))}
            placeholder="yourname@upi (optional)"
            className={inputCls}
          />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700 flex items-start gap-2">
        <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
        <span>Your bank details are encrypted and securely stored. We use bank transfers for all payouts.</span>
      </div>
    </div>
  );

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div>
      {renderStepBar()}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
        {/* Error */}
        {error && (
          <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600 flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {error}
          </div>
        )}

        {/* Step content */}
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {saving ? "Saving..." : "Save & Continue"}
              {!saving && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/20"
            >
              {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {saving ? "Submitting..." : "Submit for Review"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
