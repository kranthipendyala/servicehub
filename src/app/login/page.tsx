"use client";

import { useState, useEffect, Suspense, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import PhoneInput from "@/components/auth/PhoneInput";
import OtpInput from "@/components/auth/OtpInput";
import { sendOtp, phoneLogin, completeProfile, googleLogin } from "@/lib/user-auth";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";

type Step = "phone" | "otp" | "profile";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const { user, login } = useAuth();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [loading, setLoading] = useState(false);

  // Profile fields (step 3)
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [profileError, setProfileError] = useState("");

  // Fade transition
  const [visible, setVisible] = useState(true);

  // Already logged in
  useEffect(() => {
    if (user) {
      router.replace(redirect);
    }
  }, [user, router, redirect]);

  if (user) return null;

  const transitionTo = (nextStep: Step) => {
    setVisible(false);
    setTimeout(() => {
      setStep(nextStep);
      setVisible(true);
    }, 200);
  };

  /* ── Step 1: Send OTP ── */
  const handleSendOtp = async () => {
    setPhoneError("");
    if (phone.length !== 10) {
      setPhoneError("Please enter a valid 10-digit mobile number");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setPhoneError("Please enter a valid Indian mobile number");
      return;
    }

    setLoading(true);
    try {
      await sendOtp(phone);
      transitionTo("otp");
    } catch (err) {
      setPhoneError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 2: Verify OTP ── */
  const handleVerifyOtp = async (otp: string) => {
    setOtpError("");
    setLoading(true);
    try {
      const res = await phoneLogin(phone, otp);

      if (res.is_new_user) {
        // New user → complete profile
        transitionTo("profile");
      } else {
        // Existing user → login and redirect
        login(res.token, {
          id: Number(res.id),
          name: res.name,
          email: res.email,
          phone: res.phone || phone,
          role: res.role,
        });
        router.replace(redirect);
      }
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setOtpError("");
    try {
      await sendOtp(phone);
    } catch {
      setOtpError("Failed to resend OTP. Please try again.");
    }
  };

  /* ── Step 3: Complete Profile ── */
  const handleCompleteProfile = async (e: FormEvent) => {
    e.preventDefault();
    setProfileError("");

    if (!fullName.trim()) {
      setProfileError("Please enter your name");
      return;
    }
    if (fullName.trim().length < 2) {
      setProfileError("Name must be at least 2 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await completeProfile({
        phone,
        name: fullName.trim(),
        email: email.trim() || undefined,
        role: "user",
      });
      login(res.token, {
        id: Number(res.id),
        name: res.name,
        email: res.email,
        phone: res.phone || phone,
        role: res.role,
      });
      router.replace(redirect);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-8 px-4 bg-gradient-to-br from-primary-50 via-white to-accent-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-100/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-100/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-50/50 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div
          className={`bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-primary-500/5 border border-white/60 p-8 sm:p-10 transition-all duration-200 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-500/30 mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>

            {step === "phone" && (
              <>
                <h1 className="text-2xl font-heading font-bold text-gray-900">Welcome</h1>
                <p className="text-sm text-gray-500 mt-1">Sign in to your MechanicalHub account</p>
              </>
            )}
            {step === "otp" && (
              <>
                <h1 className="text-2xl font-heading font-bold text-gray-900">Verify your number</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Enter the 4-digit code sent to{" "}
                  <span className="font-semibold text-gray-700">+91 {phone.slice(0, 5)} {"*".repeat(phone.length - 5)}</span>
                </p>
                <button
                  type="button"
                  onClick={() => transitionTo("phone")}
                  className="inline-flex items-center gap-1 mt-1.5 text-xs text-primary-600 hover:text-primary-700 font-semibold"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                  Edit number
                </button>
              </>
            )}
            {step === "profile" && (
              <>
                <h1 className="text-2xl font-heading font-bold text-gray-900">Almost there!</h1>
                <p className="text-sm text-gray-500 mt-1">Tell us your name to complete sign up</p>
              </>
            )}
          </div>

          {/* ── Step 1: Phone Entry ── */}
          {step === "phone" && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                <PhoneInput
                  value={phone}
                  onChange={(v) => { setPhone(v); setPhoneError(""); }}
                  error={phoneError}
                  autoFocus
                  disabled={loading}
                />
              </div>

              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading || phone.length !== 10}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-bold rounded-xl hover:from-primary-600 hover:to-primary-700 focus:ring-4 focus:ring-primary-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-500/30"
              >
                {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {loading ? "Sending OTP..." : "Continue"}
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-surface-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-4 bg-white/80 text-gray-400">or</span>
                </div>
              </div>

              {/* Google Sign-in */}
              <GoogleLoginButton
                onSuccess={async (credential) => {
                  setPhoneError("");
                  try {
                    const res = await googleLogin(credential);
                    login(res.token, {
                      id: Number(res.id),
                      name: res.name,
                      email: res.email,
                      phone: res.phone || "",
                      role: res.role,
                    });
                    router.replace(redirect);
                  } catch (err) {
                    setPhoneError(err instanceof Error ? err.message : "Google login failed");
                  }
                }}
                onError={(err) => setPhoneError(err)}
                disabled={loading}
              />

              {/* Terms */}
              <p className="text-[11px] text-gray-400 text-center leading-relaxed">
                By continuing, you agree to our{" "}
                <Link href="/terms" className="text-primary-500 hover:underline">Terms of Service</Link>
                {" "}&{" "}
                <Link href="/privacy" className="text-primary-500 hover:underline">Privacy Policy</Link>
              </p>
            </div>
          )}

          {/* ── Step 2: OTP Verification ── */}
          {step === "otp" && (
            <div>
              <OtpInput
                length={4}
                onComplete={handleVerifyOtp}
                onResend={handleResendOtp}
                loading={loading}
                error={otpError}
                phone={phone}
              />
            </div>
          )}

          {/* ── Step 3: Complete Profile ── */}
          {step === "profile" && (
            <form onSubmit={handleCompleteProfile} className="space-y-5">
              {profileError && (
                <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  {profileError}
                </div>
              )}

              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="w-[18px] h-[18px] text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    autoFocus
                    autoComplete="name"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-surface-300 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="w-[18px] h-[18px] text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    autoComplete="email"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-surface-300 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all placeholder:text-gray-400"
                  />
                </div>
                <p className="mt-1 text-[11px] text-gray-400">For booking confirmations and receipts</p>
              </div>

              <button
                type="submit"
                disabled={loading || !fullName.trim()}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-accent-500 to-accent-600 text-white text-sm font-bold rounded-xl hover:from-accent-600 hover:to-accent-700 focus:ring-4 focus:ring-accent-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-accent-500/20 hover:shadow-xl hover:shadow-accent-500/30"
              >
                {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>
          )}
        </div>

        {/* Vendor link - below card */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/40">
            <span className="text-xs text-gray-500">Are you a service provider?</span>
            <Link
              href="/vendor/login"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1"
            >
              Join as Vendor
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-6 mt-5 text-[11px] text-gray-400">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            Secure OTP
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            Encrypted
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            24/7 Support
          </span>
        </div>
      </div>
    </div>
  );
}
