"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { vendorRegister, sendVendorOtp, vendorPhoneLogin, setVendorAuth, getVendorToken } from "@/lib/vendor-api";
import { vendorFetch } from "@/lib/vendor-api";
import PhoneInput from "@/components/auth/PhoneInput";
import OtpInput from "@/components/auth/OtpInput";

interface CityItem {
  id: number;
  name: string;
  slug: string;
}

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
}

export default function VendorRegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const prePhone = searchParams.get("phone") || "";
  const preVerified = searchParams.get("verified") === "true";

  const [step, setStep] = useState<"phone" | "otp" | "register">(
    prePhone && preVerified ? "register" : "phone"
  );
  const [phone, setPhone] = useState(prePhone);
  const [phoneError, setPhoneError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [loading, setLoading] = useState(false);

  // Registration form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [cityId, setCityId] = useState<number>(0);
  const [categoryId, setCategoryId] = useState<number>(0);
  const [formError, setFormError] = useState("");

  // Dropdown data
  const [cities, setCities] = useState<CityItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const token = getVendorToken();
    if (token) {
      router.replace("/vendor/dashboard");
      return;
    }
  }, [router]);

  // Fetch cities and categories
  useEffect(() => {
    if (step !== "register") return;

    const fetchData = async () => {
      setLoadingData(true);
      try {
        const [citiesRes, catsRes] = await Promise.all([
          fetch("/proxy-api/cities").then((r) => r.json()),
          fetch("/proxy-api/categories").then((r) => r.json()),
        ]);
        setCities(citiesRes.data?.cities || citiesRes.data || []);
        setCategories(catsRes.data?.categories || catsRes.data || []);
      } catch {
        // silently fail; user can retry
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [step]);

  const handleSendOtp = async () => {
    if (phone.length !== 10) {
      setPhoneError("Please enter a valid 10-digit phone number");
      return;
    }
    setPhoneError("");
    setLoading(true);
    try {
      await sendVendorOtp(phone);
      setStep("otp");
    } catch (err) {
      setPhoneError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (otp: string) => {
    setOtpError("");
    setLoading(true);
    try {
      const data = await vendorPhoneLogin(phone, otp);

      // If already a vendor, go to dashboard
      if (!data.is_new_user && ["vendor", "business_owner"].includes(data.role)) {
        setVendorAuth(data.token, {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
          onboarding_completed: data.onboarding_completed ?? true,
        });
        router.replace("/vendor/dashboard");
        return;
      }

      if (!data.is_new_user && data.role === "user") {
        setOtpError("This phone is registered as a customer. Use a different number.");
        return;
      }

      // New user or unassigned — proceed to registration
      setStep("register");
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setOtpError("");
    try {
      await sendVendorOtp(phone);
    } catch {
      setOtpError("Failed to resend OTP");
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim()) { setFormError("Full name is required"); return; }
    if (!email.trim() || !email.includes("@")) { setFormError("Valid email is required"); return; }
    if (!businessName.trim()) { setFormError("Business name is required"); return; }
    if (!cityId) { setFormError("Please select a city"); return; }
    if (!categoryId) { setFormError("Please select a category"); return; }

    setLoading(true);
    try {
      const data = await vendorRegister({
        phone,
        name: name.trim(),
        email: email.trim(),
        business_name: businessName.trim(),
        city_id: cityId,
        category_id: categoryId,
      });
      router.replace("/vendor/onboarding");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /*  Benefit cards data                                                  */
  /* ------------------------------------------------------------------ */
  const benefits = [
    {
      icon: (
        <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      ),
      title: "Get More Customers",
      desc: "Access thousands of customers actively searching for services near you",
    },
    {
      icon: (
        <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Earn Rs.50K+/month",
      desc: "Top vendors earn over Rs.50,000 per month with consistent bookings",
    },
    {
      icon: (
        <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z" />
        </svg>
      ),
      title: "Zero Investment to Start",
      desc: "No registration fee, no hidden charges. Start earning from day one",
    },
  ];

  const stats = [
    { value: "25,000+", label: "Vendors" },
    { value: "1 Lakh+", label: "Bookings" },
    { value: "500+", label: "Cities" },
  ];

  const trustBadges = [
    { icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z", label: "Free to Join" },
    { icon: "M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z", label: "Weekly Payouts" },
    { icon: "M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155", label: "Dedicated Support" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="flex min-h-screen">
        {/* LEFT SIDE - Value Proposition */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] flex-col justify-center px-12 xl:px-20 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-emerald-400/5 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />

          <div className="relative z-10 max-w-lg">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/30">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.384-3.08A.5.5 0 005.5 12.5v0a.5.5 0 00.536.49l6.293-.54m-.93 2.72l2.08 3.6a.5.5 0 00.836.06l3.327-4.272a.5.5 0 00-.188-.752l-5.126-2.636m-2.929 4l5.08-7.08a.5.5 0 01.768-.077l2.077 1.927a.5.5 0 01.03.745L13.42 15.17a.5.5 0 01-.698.063l-1.302-1.063z" />
                </svg>
              </div>
              <span className="text-white/80 font-semibold text-lg">VendorHub</span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl xl:text-5xl font-extrabold mb-4 leading-tight">
              <span className="bg-gradient-to-r from-white via-emerald-200 to-emerald-400 bg-clip-text text-transparent">
                Grow Your Business
              </span>
              <br />
              <span className="text-white/90 text-3xl xl:text-4xl">with Mechanical Services</span>
            </h1>
            <p className="text-slate-400 text-lg mb-10 leading-relaxed">
              Join thousands of service professionals who are scaling their earnings through our platform.
            </p>

            {/* Benefit Cards */}
            <div className="space-y-4 mb-10">
              {benefits.map((b) => (
                <div key={b.title} className="flex items-start gap-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all">
                  <div className="w-11 h-11 rounded-lg bg-emerald-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {b.icon}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">{b.title}</h3>
                    <p className="text-slate-400 text-sm mt-0.5">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-8 mb-10">
              {stats.map((s, i) => (
                <div key={s.label} className="flex items-center gap-3">
                  {i > 0 && <div className="w-px h-10 bg-white/10 -ml-4 mr-0" />}
                  <div>
                    <p className="text-2xl font-bold text-emerald-400">{s.value}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Testimonial */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 mb-8">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-white/90 text-sm italic leading-relaxed">
                &ldquo;I doubled my income in 3 months. The platform sends me consistent bookings and the weekly payouts are always on time.&rdquo;
              </p>
              <div className="flex items-center gap-3 mt-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">R</div>
                <div>
                  <p className="text-white text-sm font-semibold">Rajesh Kumar</p>
                  <p className="text-slate-500 text-xs">Electrician, Mumbai</p>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-6">
              {trustBadges.map((badge) => (
                <div key={badge.label} className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={badge.icon} />
                  </svg>
                  <span className="text-xs text-slate-400 font-medium">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - Registration Form */}
        <div className="w-full lg:w-1/2 xl:w-[45%] flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            {/* Mobile-only hero */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-600 shadow-lg shadow-emerald-600/30 mb-4">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.384-3.08A.5.5 0 005.5 12.5v0a.5.5 0 00.536.49l6.293-.54m-.93 2.72l2.08 3.6a.5.5 0 00.836.06l3.327-4.272a.5.5 0 00-.188-.752l-5.126-2.636m-2.929 4l5.08-7.08a.5.5 0 01.768-.077l2.077 1.927a.5.5 0 01.03.745L13.42 15.17a.5.5 0 01-.698.063l-1.302-1.063z" />
                </svg>
              </div>
              <h1 className="text-2xl font-extrabold">
                <span className="bg-gradient-to-r from-white via-emerald-200 to-emerald-400 bg-clip-text text-transparent">
                  Grow Your Business
                </span>
              </h1>
              <p className="text-slate-400 mt-2 text-sm">
                Join 25,000+ vendors earning on Mechanical Services
              </p>
              {/* Mobile trust badges */}
              <div className="flex items-center justify-center gap-4 mt-4">
                {trustBadges.map((badge) => (
                  <div key={badge.label} className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full">
                    <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={badge.icon} />
                    </svg>
                    <span className="text-xs text-slate-400 font-medium">{badge.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card */}
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              {step === "phone" && (
                <>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">
                    Create Vendor Account
                  </h2>
                  <p className="text-sm text-gray-500 mb-6">
                    Enter your phone number to get started
                  </p>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <PhoneInput
                        value={phone}
                        onChange={(v) => { setPhone(v); setPhoneError(""); }}
                        error={phoneError}
                        autoFocus
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={loading || phone.length !== 10}
                      className="w-full py-3 px-4 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-500/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                      {loading ? "Sending OTP..." : "Verify Phone Number"}
                    </button>
                  </div>
                </>
              )}

              {step === "otp" && (
                <>
                  <button
                    type="button"
                    onClick={() => { setStep("phone"); setOtpError(""); }}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Change number
                  </button>

                  <h2 className="text-xl font-semibold text-gray-900 mb-1">
                    Verify OTP
                  </h2>
                  <p className="text-sm text-gray-500 mb-6">
                    Enter the code sent to your phone
                  </p>

                  <OtpInput
                    length={4}
                    onComplete={handleVerifyOtp}
                    onResend={handleResendOtp}
                    loading={loading}
                    error={otpError}
                    phone={phone}
                  />
                </>
              )}

              {step === "register" && (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-emerald-600">Phone verified: +91 {phone}</span>
                  </div>

                  <h2 className="text-xl font-semibold text-gray-900 mb-1 mt-3">
                    Complete Registration
                  </h2>
                  <p className="text-sm text-gray-500 mb-6">
                    Tell us about yourself and your business
                  </p>

                  {formError && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600 flex items-center gap-2">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                      </svg>
                      {formError}
                    </div>
                  )}

                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="vendor@example.com"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. Sharma Auto Services"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                      <select
                        value={cityId}
                        onChange={(e) => setCityId(Number(e.target.value))}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none bg-white"
                      >
                        <option value={0}>Select your city</option>
                        {cities.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Service Category *</label>
                      <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(Number(e.target.value))}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none bg-white"
                      >
                        <option value={0}>Select primary category</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                      {loadingData && (
                        <p className="mt-1 text-xs text-gray-400">Loading options...</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm font-semibold rounded-xl hover:from-emerald-700 hover:to-emerald-800 focus:ring-4 focus:ring-emerald-500/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                    >
                      {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                      {loading ? "Creating Account..." : "Create Vendor Account"}
                    </button>
                  </form>
                </>
              )}

              {/* Login link */}
              <div className="mt-6 pt-5 border-t border-gray-100 text-center">
                <p className="text-sm text-gray-500">
                  Already have an account?{" "}
                  <Link
                    href="/vendor/login"
                    className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>

            <p className="text-center text-xs text-slate-500 mt-6">
              Mechanical Services Vendor Portal
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
