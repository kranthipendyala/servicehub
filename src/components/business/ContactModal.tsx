"use client";

import { useState } from "react";

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
  business: {
    id: number;
    name: string;
    phone?: string;
    mobile?: string;
  };
}

export default function ContactModal({ open, onClose, business }: ContactModalProps) {
  const [showCallback, setShowCallback] = useState(false);
  const [callbackName, setCallbackName] = useState("");
  const [callbackPhone, setCallbackPhone] = useState("");
  const [callbackSent, setCallbackSent] = useState(false);
  const [sending, setSending] = useState(false);

  const phone = business.phone || business.mobile || "";

  const logLead = async (method: "call" | "whatsapp" | "enquiry", extraData?: Record<string, string>) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("customer_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json", Accept: "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
        headers["X-Auth-Token"] = token;
      }

      await fetch("/proxy-api/leads", {
        method: "POST",
        headers,
        body: JSON.stringify({
          business_id: business.id,
          contact_method: method,
          ...extraData,
        }),
      });
    } catch {}
  };

  const handleCall = () => {
    logLead("call");
    window.location.href = `tel:${phone}`;
  };

  const handleWhatsApp = () => {
    logLead("whatsapp");
    const cleanPhone = phone.replace(/\D/g, "");
    const waPhone = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;
    window.open(`https://wa.me/${waPhone}?text=Hi, I found your business on ServiceHub. I need your services.`, "_blank");
  };

  const handleCallback = async () => {
    if (!callbackName || !callbackPhone) return;
    setSending(true);
    await logLead("enquiry", { customer_name: callbackName, customer_phone: callbackPhone, message: "Callback request" });
    setCallbackSent(true);
    setSending(false);
  };

  if (!open) return null;

  const formatPhone = (p: string) => {
    const digits = p.replace(/\D/g, "");
    if (digits.length === 10) {
      return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
    }
    return `+91 ${p}`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal card */}
      <div className="relative bg-white w-full sm:max-w-md sm:rounded-card rounded-t-card shadow-2xl overflow-hidden animate-[slideUp_0.3s_ease-out]">

        {/* Header */}
        <div className="relative bg-primary-800 px-6 pt-7 pb-6 overflow-hidden">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/15 hover:bg-white/25 transition-colors duration-200 ease-advia"
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="relative flex items-center gap-4">
            {/* Initial circle */}
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-bold">
              {business.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-white text-lg leading-tight">{business.name}</h3>
              <p className="text-white/70 text-sm mt-0.5">Contact directly</p>
            </div>
          </div>
        </div>

        {/* Phone number display */}
        <div className="px-6 py-4 bg-white border-b border-surface-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-card bg-accent-200 flex items-center justify-center flex-shrink-0">
              <svg className="w-4.5 h-4.5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Phone Number</p>
              <p className="text-xl font-bold text-surface-900 tracking-wide">{formatPhone(phone)}</p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="px-6 py-4 space-y-3">
          {/* Call Now */}
          <button
            onClick={handleCall}
            className="btn-primary w-full flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Call Now
          </button>

          {/* WhatsApp */}
          <button
            onClick={handleWhatsApp}
            className="w-full flex items-center justify-center gap-3 py-3.5 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-btn font-semibold transition-all duration-200 ease-advia active:scale-[0.98]"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp
          </button>
        </div>

        {/* Callback section */}
        <div className="px-6 pb-6">
          {!showCallback && !callbackSent && (
            <button
              onClick={() => setShowCallback(true)}
              className="w-full text-center py-2.5 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors duration-200 ease-advia"
            >
              Or request a callback &rarr;
            </button>
          )}

          {showCallback && !callbackSent && (
            <div className="space-y-3 pt-4 border-t border-surface-200">
              <p className="text-sm font-bold text-surface-900">Request a callback</p>
              <input
                type="text"
                placeholder="Your name"
                value={callbackName}
                onChange={(e) => setCallbackName(e.target.value)}
                className="w-full border border-surface-200 rounded-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all duration-200 ease-advia"
              />
              <input
                type="tel"
                placeholder="Your phone number"
                value={callbackPhone}
                onChange={(e) => setCallbackPhone(e.target.value)}
                className="w-full border border-surface-200 rounded-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all duration-200 ease-advia"
              />
              <button
                onClick={handleCallback}
                disabled={sending || !callbackName || !callbackPhone}
                className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending...
                  </span>
                ) : (
                  "Request Callback"
                )}
              </button>
            </div>
          )}

          {callbackSent && (
            <div className="flex items-center gap-3 p-4 bg-accent-200 rounded-card border border-primary-200">
              <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-primary-800">Request sent!</p>
                <p className="text-xs text-primary-600 mt-0.5">They will call you back soon.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
