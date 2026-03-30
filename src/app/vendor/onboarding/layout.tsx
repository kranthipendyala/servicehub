"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const STEPS = [
  { num: 1, label: "Business Profile" },
  { num: 2, label: "Services" },
  { num: 3, label: "KYC Documents" },
  { num: 4, label: "Bank Details" },
];

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  // We read step from a query param or from the page itself via context
  // For simplicity the page will manage its own step; the layout just provides chrome

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/vendor/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-emerald-600/20">
              V
            </div>
            <div>
              <span className="font-bold text-base text-gray-900 tracking-tight">VendorHub</span>
              <span className="block text-[10px] text-emerald-600 -mt-0.5">Setup Wizard</span>
            </div>
          </Link>

          <div className="hidden sm:flex items-center gap-1 text-xs text-gray-500">
            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Complete all steps to activate your account
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}
