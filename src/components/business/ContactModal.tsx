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
  const [logged, setLogged] = useState(false);
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
      setLogged(true);
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

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden animate-[slideUp_0.3s_ease-out]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0d9488] to-[#0d9488] px-6 py-5 text-white relative">
          <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-xl font-bold">
              {business.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-lg">{business.name}</h3>
              <p className="text-blue-200 text-sm">Contact directly</p>
            </div>
          </div>
        </div>

        {/* Phone number display */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Phone Number</p>
          <p className="text-2xl font-bold text-gray-900 tracking-wide">+91 {phone}</p>
        </div>

        {/* Action buttons */}
        <div className="px-6 py-4 space-y-3">
          <button
            onClick={handleCall}
            className="w-full flex items-center justify-center gap-3 py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Call Now
          </button>

          <button
            onClick={handleWhatsApp}
            className="w-full flex items-center justify-center gap-3 py-3.5 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-xl font-semibold transition-all shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp
          </button>
        </div>

        {/* Callback option */}
        <div className="px-6 pb-5">
          {!showCallback && !callbackSent && (
            <button
              onClick={() => setShowCallback(true)}
              className="w-full text-center py-2.5 text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors"
            >
              Or request a callback →
            </button>
          )}

          {showCallback && !callbackSent && (
            <div className="space-y-3 pt-2 border-t">
              <p className="text-sm font-semibold text-gray-700">Request a callback</p>
              <input
                type="text"
                placeholder="Your name"
                value={callbackName}
                onChange={(e) => setCallbackName(e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm"
              />
              <input
                type="tel"
                placeholder="Your phone number"
                value={callbackPhone}
                onChange={(e) => setCallbackPhone(e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm"
              />
              <button
                onClick={handleCallback}
                disabled={sending || !callbackName || !callbackPhone}
                className="w-full py-2.5 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {sending ? "Sending..." : "Request Callback"}
              </button>
            </div>
          )}

          {callbackSent && (
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-200 text-green-700">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span className="text-sm font-medium">Callback request sent! The vendor will call you back soon.</span>
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
