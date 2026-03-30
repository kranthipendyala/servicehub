"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getVendorToken, setVendorAuth, sendVendorOtp, vendorPhoneLogin } from "@/lib/vendor-api";
import PhoneInput from "@/components/auth/PhoneInput";
import OtpInput from "@/components/auth/OtpInput";

export default function VendorLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpError, setOtpError] = useState("");

  useEffect(() => {
    const token = getVendorToken();
    if (token) {
      router.replace("/vendor/dashboard");
    }
  }, [router]);

  const handleSendOtp = async () => {
    if (phone.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await sendVendorOtp(phone);
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (otp: string) => {
    setOtpError("");
    setLoading(true);
    try {
      const data = await vendorPhoneLogin(phone, otp);

      // New user — redirect to register
      if (data.is_new_user) {
        router.push(`/vendor/register?phone=${phone}&verified=true`);
        return;
      }

      // Existing user but customer role
      if (!["vendor", "business_owner"].includes(data.role)) {
        if (data.role === "user") {
          setOtpError("This is a customer account. Please use the main website to login.");
        } else {
          setOtpError("This account does not have vendor access.");
        }
        return;
      }

      // Valid vendor — store auth and redirect
      setVendorAuth(data.token, {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        onboarding_completed: data.onboarding_completed ?? true,
      });

      if (data.onboarding_completed === false) {
        router.replace("/vendor/onboarding");
      } else {
        router.replace("/vendor/dashboard");
      }
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
      setOtpError("Failed to resend OTP. Please try again.");
    }
  };

  const leftStats = [
    { value: "25K+", label: "Active Vendors" },
    { value: "1L+", label: "Bookings Completed" },
    { value: "98%", label: "On-time Payouts" },
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* LEFT SIDE - Branding */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] flex-col justify-center items-center relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-500/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-emerald-400/5 rounded-full blur-2xl" />

        {/* CSS Illustration - Service tools */}
        <div className="relative z-10 flex flex-col items-center max-w-md px-8">
          {/* Large icon cluster */}
          <div className="relative w-64 h-64 mb-10">
            {/* Central gear */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-2xl shadow-emerald-600/30 rotate-3">
              <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.384-3.08A.5.5 0 005.5 12.5v0a.5.5 0 00.536.49l6.293-.54m-.93 2.72l2.08 3.6a.5.5 0 00.836.06l3.327-4.272a.5.5 0 00-.188-.752l-5.126-2.636m-2.929 4l5.08-7.08a.5.5 0 01.768-.077l2.077 1.927a.5.5 0 01.03.745L13.42 15.17a.5.5 0 01-.698.063l-1.302-1.063z" />
              </svg>
            </div>
            {/* Floating elements */}
            <div className="absolute top-4 left-4 w-14 h-14 rounded-xl bg-blue-500/20 backdrop-blur-sm border border-blue-400/20 flex items-center justify-center animate-bounce" style={{ animationDuration: "3s" }}>
              <svg className="w-7 h-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <div className="absolute top-2 right-8 w-12 h-12 rounded-lg bg-purple-500/20 backdrop-blur-sm border border-purple-400/20 flex items-center justify-center animate-bounce" style={{ animationDuration: "4s", animationDelay: "1s" }}>
              <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="absolute bottom-6 left-8 w-12 h-12 rounded-lg bg-amber-500/20 backdrop-blur-sm border border-amber-400/20 flex items-center justify-center animate-bounce" style={{ animationDuration: "3.5s", animationDelay: "0.5s" }}>
              <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
            </div>
            <div className="absolute bottom-2 right-4 w-14 h-14 rounded-xl bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/20 flex items-center justify-center animate-bounce" style={{ animationDuration: "4.5s", animationDelay: "1.5s" }}>
              <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          {/* Branding text */}
          <h1 className="text-3xl xl:text-4xl font-extrabold text-white text-center mb-3">
            Welcome to <span className="bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">VendorHub</span>
          </h1>
          <p className="text-slate-400 text-center text-base mb-10 leading-relaxed max-w-sm">
            Your business command center. Manage bookings, track earnings, and grow your customer base.
          </p>

          {/* Stats */}
          <div className="flex items-center gap-6">
            {leftStats.map((s, i) => (
              <div key={s.label} className="flex items-center gap-4">
                {i > 0 && <div className="w-px h-12 bg-white/10 -ml-2" />}
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-400">{s.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Login Form */}
      <div className="w-full lg:w-1/2 xl:w-[45%] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-600 shadow-lg shadow-emerald-600/30 mb-4">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.384-3.08A.5.5 0 005.5 12.5v0a.5.5 0 00.536.49l6.293-.54m-.93 2.72l2.08 3.6a.5.5 0 00.836.06l3.327-4.272a.5.5 0 00-.188-.752l-5.126-2.636m-2.929 4l5.08-7.08a.5.5 0 01.768-.077l2.077 1.927a.5.5 0 01.03.745L13.42 15.17a.5.5 0 01-.698.063l-1.302-1.063z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">VendorHub</h1>
            <p className="text-slate-400 mt-1 text-sm">
              Mechanical Services Vendor Portal
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            {step === "phone" ? (
              <>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">
                  Welcome back
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                  Sign in to your vendor account with your phone number
                </p>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <PhoneInput
                      value={phone}
                      onChange={(v) => { setPhone(v); setError(""); }}
                      error={error}
                      autoFocus
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading || phone.length !== 10}
                    className="w-full py-3 px-4 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-500/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading && (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    )}
                    {loading ? "Sending OTP..." : "Send OTP"}
                  </button>
                </div>
              </>
            ) : (
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
                  Enter the verification code sent to your phone
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

            {/* Register link - more prominent */}
            <div className="mt-6 pt-5 border-t border-gray-100">
              <Link
                href="/vendor/register"
                className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-emerald-50 text-emerald-700 text-sm font-semibold rounded-xl hover:bg-emerald-100 transition-all group"
              >
                New to VendorHub? Register free
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>

          <p className="text-center text-xs text-slate-500 mt-6">
            Mechanical Services Vendor Portal
          </p>
        </div>
      </div>
    </div>
  );
}
