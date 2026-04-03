"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import type { Service, ServiceVariant, Address, BookingItem, Booking } from "@/types";
import { useAuth } from "@/components/auth/AuthProvider";
import { usePlatform } from "@/components/platform/PlatformProvider";
import {
  getBusinessServices,
  getAddresses,
  createAddress,
  createBooking,
  createPaymentOrder,
} from "@/lib/booking-api";

/* ------------------------------------------------------------------ */
/*  Types local to booking flow                                         */
/* ------------------------------------------------------------------ */

interface CartItem {
  service: Service;
  variant?: ServiceVariant;
  quantity: number;
}

interface NewAddressForm {
  label: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city_name: string;
  pin_code: string;
}

const EMPTY_ADDRESS_FORM: NewAddressForm = {
  label: "Home",
  full_name: "",
  phone: "",
  address_line1: "",
  address_line2: "",
  city_name: "",
  pin_code: "",
};

const STEPS = ["Services", "Date & Time", "Address", "Review"];

/* ------------------------------------------------------------------ */
/*  Helper: generate time slots                                         */
/* ------------------------------------------------------------------ */

function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 8; h <= 19; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
    if (h < 19) slots.push(`${String(h).padStart(2, "0")}:30`);
  }
  return slots;
}

/* ------------------------------------------------------------------ */
/*  Helper: build calendar dates (next 30 days)                         */
/* ------------------------------------------------------------------ */

function getCalendarDates(): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 1; i <= 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

/* ================================================================== */
/*  Page component                                                      */
/* ================================================================== */

export default function BookingPage() {
  const router = useRouter();
  const params = useParams();
  const businessSlug = params.businessSlug as string;

  const [step, setStep] = useState(0);
  const [services, setServices] = useState<Service[]>([]);
  const [businessName, setBusinessName] = useState("");
  const [businessId, setBusinessId] = useState<number>(0);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState<NewAddressForm>(EMPTY_ADDRESS_FORM);
  const [customerNotes, setCustomerNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const calendarDates = getCalendarDates();
  const timeSlots = generateTimeSlots();

  const { user: authUser } = useAuth();

  useEffect(() => {
    if (!authUser) {
      router.push(`/login?redirect=/book/${businessSlug}`);
    }
  }, [authUser, businessSlug, router]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const svcRes = await getBusinessServices(businessSlug);
        if (svcRes.success) {
          setServices(svcRes.data);
          if (svcRes.business) {
            setBusinessName(svcRes.business.name);
            setBusinessId(Number(svcRes.business.id));
          }
        }
        if (!svcRes.business) {
          try {
            const bizResp = await fetch(`/proxy-api/businesses/${businessSlug}`);
            const bizJson = await bizResp.json();
            if (bizJson.status && bizJson.data) {
              setBusinessName(bizJson.data.name);
              setBusinessId(Number(bizJson.data.id));
            }
          } catch {}
        }
      } catch {
        setError("Failed to load services. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    if (businessSlug) load();
  }, [businessSlug]);

  useEffect(() => {
    if (step === 2) {
      getAddresses()
        .then((res) => {
          if (res.success) {
            setAddresses(res.data);
            const def = res.data.find((a) => a.is_default);
            if (def && !selectedAddressId) setSelectedAddressId(def.id);
          }
        })
        .catch(() => {});
    }
  }, [step, selectedAddressId]);

  const addToCart = useCallback(
    (service: Service, variant?: ServiceVariant) => {
      setCart((prev) => {
        const key = `${service.id}-${variant?.id || 0}`;
        const existing = prev.find(
          (c) => `${c.service.id}-${c.variant?.id || 0}` === key
        );
        if (existing) {
          return prev.map((c) =>
            `${c.service.id}-${c.variant?.id || 0}` === key
              ? { ...c, quantity: c.quantity + 1 }
              : c
          );
        }
        return [...prev, { service, variant, quantity: 1 }];
      });
    },
    []
  );

  const updateQuantity = useCallback(
    (serviceId: number, variantId: number | undefined, qty: number) => {
      if (qty <= 0) {
        setCart((prev) =>
          prev.filter(
            (c) => !(c.service.id === serviceId && (c.variant?.id || 0) === (variantId || 0))
          )
        );
      } else {
        setCart((prev) =>
          prev.map((c) =>
            c.service.id === serviceId && (c.variant?.id || 0) === (variantId || 0)
              ? { ...c, quantity: qty }
              : c
          )
        );
      }
    },
    []
  );

  const getItemPrice = (item: CartItem) =>
    item.variant ? item.variant.price : item.service.discounted_price || item.service.base_price;

  const { platform_fee: platformFeeAmount } = usePlatform();
  const subtotal = cart.reduce((s, c) => s + getItemPrice(c) * c.quantity, 0);
  const taxRate = 0.18;
  const tax = Math.round(subtotal * taxRate * 100) / 100;
  const total = subtotal + tax + platformFeeAmount;

  const canProceed = (): boolean => {
    switch (step) {
      case 0: return cart.length > 0;
      case 1: return !!selectedDate && !!selectedTime;
      case 2: return !!selectedAddressId;
      case 3: return true;
      default: return false;
    }
  };

  const { cod_enabled: codEnabled, online_payment_enabled: onlineEnabled } = usePlatform();
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");

  useEffect(() => {
    if (codEnabled && !onlineEnabled) setPaymentMethod("cod");
    else if (onlineEnabled && !codEnabled) setPaymentMethod("online");
    else if (onlineEnabled) setPaymentMethod("online");
    else setPaymentMethod("cod");
  }, [codEnabled, onlineEnabled]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const items = cart.map((c) => ({
        service_id: c.service.id,
        variant_id: c.variant?.id,
        quantity: c.quantity,
      }));

      const bookingRes = await createBooking({
        business_id: businessId,
        items,
        scheduled_date: selectedDate,
        scheduled_time: selectedTime,
        address_id: selectedAddressId ?? undefined,
        customer_notes: customerNotes || undefined,
        payment_method: paymentMethod,
      } as any);

      if (!bookingRes.success) {
        setError(bookingRes.message || "Failed to create booking.");
        setSubmitting(false);
        return;
      }

      const booking = bookingRes.data;

      if (paymentMethod === "online") {
        try {
          await createPaymentOrder(booking.id);
        } catch {}
      }

      router.push(`/book/confirmation/${booking.id}`);
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.includes("401") || msg.includes("Authentication")) {
        setError("Session expired. Please login again.");
        router.push(`/login?redirect=/book/${businessSlug}`);
      } else {
        setError(msg || "Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveAddress = async () => {
    try {
      const res = await createAddress({
        label: newAddress.label,
        full_name: newAddress.full_name,
        phone: newAddress.phone,
        address_line1: newAddress.address_line1,
        address_line2: newAddress.address_line2 || undefined,
        city_name: newAddress.city_name,
        pin_code: newAddress.pin_code,
      } as any);
      if (res.success) {
        setAddresses((prev) => [...prev, res.data]);
        setSelectedAddressId(res.data.id);
        setShowNewAddress(false);
        setNewAddress(EMPTY_ADDRESS_FORM);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("401") || msg.includes("Authentication") || msg.includes("Unauthorized")) {
        setError("Session expired. Please login again.");
        router.push(`/login?redirect=/book/${businessSlug}`);
      } else {
        setError(msg || "Failed to save address. Please try again.");
      }
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Render                                                            */
  /* ---------------------------------------------------------------- */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-[3px] border-accent-200" />
            <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-primary-600 animate-spin" />
          </div>
          <p className="text-sm text-primary-700/50 font-medium">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ── Header ── */}
      <div className="bg-accent-200">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <p className="text-xs font-semibold text-primary-600 uppercase tracking-widest mb-1">Book a Service</p>
          {businessName && (
            <h1 className="text-xl font-heading font-medium text-primary-700 tracking-tight">{businessName}</h1>
          )}
        </div>
      </div>

      {/* ── Stepper ── */}
      <div className="max-w-3xl mx-auto px-4 pt-6">
        <div className="flex items-center mb-8">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center flex-1">
              <div className="flex items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    i < step
                      ? "bg-primary-600 text-white"
                      : i === step
                        ? "bg-primary-600 text-white ring-4 ring-primary-600/20"
                        : "bg-accent-200 text-primary-700/40"
                  }`}
                >
                  {i < step ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={`ml-2 text-sm font-semibold hidden sm:inline transition-colors ${
                    i <= step ? "text-primary-700" : "text-primary-700/40"
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-[2px] mx-3 rounded-full transition-all duration-300 ${
                    i < step ? "bg-primary-600" : "bg-surface-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-card text-sm font-medium flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            {error}
          </div>
        )}

        {/* ── Step 0: Select Services ───────────────────── */}
        {step === 0 && (() => {
          const grouped: Record<string, { name: string; services: typeof services }> = {};
          services.forEach((svc) => {
            const key = svc.category_name || "Other";
            if (!grouped[key]) grouped[key] = { name: key, services: [] };
            grouped[key].services.push(svc);
          });
          const groups = Object.values(grouped);

          return (
          <div>
            <h2 className="text-base font-heading font-medium text-primary-700 mb-4">Select Services</h2>
            {services.length === 0 ? (
              <p className="text-primary-700/40 text-sm">No services available.</p>
            ) : (
              <div className="space-y-6">
                {groups.map((group) => (
                <div key={group.name}>
                  {groups.length > 1 && (
                    <h3 className="text-xs font-semibold text-primary-700/50 uppercase tracking-widest mb-3">{group.name}</h3>
                  )}
                  <div className="space-y-3">
                {group.services.map((svc) => (
                  <div
                    key={svc.id}
                    className="bg-white rounded-card border border-surface-200 p-5 hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="font-heading font-medium text-primary-700 text-[15px]">
                          {svc.name}
                        </h3>
                        {svc.short_description && (
                          <p className="text-sm text-primary-700/50 mt-1 leading-relaxed">{svc.short_description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2.5">
                          <span className="text-primary-600 font-semibold text-lg">
                            &#8377;{svc.discounted_price || svc.base_price}
                          </span>
                          {svc.discounted_price && svc.discounted_price < svc.base_price && (
                            <span className="text-primary-700/30 text-sm line-through">
                              &#8377;{svc.base_price}
                            </span>
                          )}
                          {svc.duration_minutes > 0 && (
                            <span className="text-xs text-primary-700/50 bg-accent-100 px-2.5 py-1 rounded-full font-medium">
                              ~{svc.duration_minutes} min
                            </span>
                          )}
                        </div>
                      </div>
                      {(() => {
                        const inCart = cart.find(
                          (c) => c.service.id === svc.id && !c.variant
                        );
                        return inCart ? (
                          <div className="flex items-center gap-2.5">
                            <button
                              onClick={() => updateQuantity(svc.id, undefined, inCart.quantity - 1)}
                              className="w-9 h-9 rounded-full border-2 border-primary-600 flex items-center justify-center text-primary-600 font-bold hover:bg-accent-100 transition-all"
                            >
                              -
                            </button>
                            <span className="w-5 text-center font-bold text-primary-700">
                              {inCart.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(svc.id, undefined, inCart.quantity + 1)}
                              className="w-9 h-9 rounded-full border-2 border-primary-600 flex items-center justify-center text-primary-600 font-bold hover:bg-accent-100 transition-all"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(svc)}
                            className="btn-primary text-sm min-h-[40px]"
                          >
                            Add
                          </button>
                        );
                      })()}
                    </div>

                    {svc.variants && svc.variants.length > 0 && (
                      <div className="mt-4 pl-4 border-l-2 border-accent-200 space-y-2.5">
                        {svc.variants
                          .filter((v) => v.is_active)
                          .map((v) => {
                            const vInCart = cart.find(
                              (c) => c.service.id === svc.id && c.variant?.id === v.id
                            );
                            return (
                              <div key={v.id} className="flex items-center justify-between">
                                <div>
                                  <span className="text-sm text-primary-700/70">{v.name}</span>
                                  <span className="ml-2 text-sm text-primary-600 font-semibold">&#8377;{v.price}</span>
                                </div>
                                {vInCart ? (
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => updateQuantity(svc.id, v.id, vInCart.quantity - 1)}
                                      className="w-7 h-7 rounded-full border-2 border-primary-600 flex items-center justify-center text-primary-600 text-xs hover:bg-accent-100 transition-all"
                                    >
                                      -
                                    </button>
                                    <span className="w-5 text-center text-sm font-bold text-primary-700">
                                      {vInCart.quantity}
                                    </span>
                                    <button
                                      onClick={() => updateQuantity(svc.id, v.id, vInCart.quantity + 1)}
                                      className="w-7 h-7 rounded-full border-2 border-primary-600 flex items-center justify-center text-primary-600 text-xs hover:bg-accent-100 transition-all"
                                    >
                                      +
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => addToCart(svc, v)}
                                    className="btn-primary text-xs px-3.5 py-1.5"
                                  >
                                    Add
                                  </button>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                ))}
                  </div>
                </div>
                ))}
              </div>
            )}

            {/* Cart summary */}
            {cart.length > 0 && (
              <div className="mt-6 bg-accent-100 rounded-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-heading font-medium text-primary-700">
                    Selected ({cart.reduce((s, c) => s + c.quantity, 0)} items)
                  </h3>
                  <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-sm text-primary-700/60 space-y-2">
                  {cart.map((c, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>
                        {c.service.name}
                        {c.variant ? ` - ${c.variant.name}` : ""} x{c.quantity}
                      </span>
                      <span className="font-semibold text-primary-700">&#8377;{getItemPrice(c) * c.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-primary-700/10 mt-3 pt-3 flex justify-between font-semibold">
                  <span className="text-primary-700">Subtotal</span>
                  <span className="text-primary-600 text-lg">&#8377;{subtotal}</span>
                </div>
              </div>
            )}
          </div>
          );
        })()}

        {/* ── Step 1: Date & Time ────────────────────────── */}
        {step === 1 && (
          <div>
            <h2 className="text-base font-heading font-medium text-primary-700 mb-5">Choose Date & Time</h2>

            <div className="mb-6">
              <h3 className="text-xs font-semibold text-primary-700/50 uppercase tracking-widest mb-3">Select Date</h3>
              <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
                {calendarDates.map((d) => {
                  const ds = formatDate(d);
                  return (
                    <button
                      key={ds}
                      onClick={() => setSelectedDate(ds)}
                      className={`flex-shrink-0 w-[72px] h-[88px] rounded-card border text-center text-sm transition-all duration-200 flex flex-col items-center justify-center ${
                        selectedDate === ds
                          ? "border-primary-600 bg-primary-600 text-white shadow-md"
                          : "border-accent-200 hover:border-primary-600/30 text-primary-700 bg-white"
                      }`}
                    >
                      <div className={`text-xs font-medium ${selectedDate === ds ? "text-white/70" : "text-primary-700/40"}`}>
                        {d.toLocaleDateString("en-IN", { weekday: "short" })}
                      </div>
                      <div className={`font-bold text-lg mt-0.5 ${selectedDate === ds ? "text-white" : "text-primary-700"}`}>
                        {d.getDate()}
                      </div>
                      <div className={`text-xs font-medium ${selectedDate === ds ? "text-white/70" : "text-primary-700/40"}`}>
                        {d.toLocaleDateString("en-IN", { month: "short" })}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-primary-700/50 uppercase tracking-widest mb-3">Select Time</h3>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedTime(slot)}
                    className={`py-3 rounded-card border text-sm font-semibold transition-all duration-200 min-h-[44px] ${
                      selectedTime === slot
                        ? "border-primary-600 bg-primary-600 text-white shadow-md"
                        : "border-accent-200 hover:border-primary-600/30 text-primary-700/70 bg-white"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Address ────────────────────────────── */}
        {step === 2 && (
          <div>
            <h2 className="text-base font-heading font-medium text-primary-700 mb-5">Select Address</h2>

            {addresses.length === 0 && !showNewAddress && (
              <p className="text-primary-700/40 text-sm mb-4">No saved addresses. Please add one.</p>
            )}

            <div className="space-y-3">
              {addresses.map((addr) => (
                <label
                  key={addr.id}
                  className={`flex items-start gap-4 p-5 bg-white rounded-card border cursor-pointer transition-all duration-200 ${
                    selectedAddressId === addr.id
                      ? "border-primary-600 ring-2 ring-primary-600/20"
                      : "border-surface-200 hover:border-primary-600/30"
                  }`}
                >
                  <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    selectedAddressId === addr.id ? "border-primary-600" : "border-surface-300"
                  }`}>
                    {selectedAddressId === addr.id && (
                      <div className="w-2.5 h-2.5 rounded-full bg-primary-600" />
                    )}
                  </div>
                  <input
                    type="radio"
                    name="address"
                    checked={selectedAddressId === addr.id}
                    onChange={() => setSelectedAddressId(addr.id)}
                    className="sr-only"
                  />
                  <div>
                    <div className="font-semibold text-primary-700 text-sm">
                      {addr.label}
                      {addr.is_default && (
                        <span className="ml-2 text-[10px] font-bold text-primary-600 bg-accent-100 px-1.5 py-0.5 rounded uppercase tracking-wider">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-primary-700/60 mt-0.5">
                      {addr.address_line1}
                      {addr.address_line2 ? `, ${addr.address_line2}` : ""}
                    </p>
                    <p className="text-sm text-primary-700/40">
                      {addr.city_name} - {addr.pin_code}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            {showNewAddress ? (
              <div className="mt-4 bg-white rounded-card border border-surface-200 p-5 space-y-3.5">
                <h3 className="font-heading font-medium text-primary-700 text-sm">New Address</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-primary-700/50 uppercase tracking-widest mb-1.5">Label</label>
                    <select
                      value={newAddress.label}
                      onChange={(e) => setNewAddress((p) => ({ ...p, label: e.target.value }))}
                      className="w-full border border-surface-200 rounded-card px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-all bg-white text-primary-700"
                    >
                      <option>Home</option>
                      <option>Office</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-primary-700/50 uppercase tracking-widest mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={newAddress.full_name}
                      onChange={(e) => setNewAddress((p) => ({ ...p, full_name: e.target.value }))}
                      className="w-full border border-surface-200 rounded-card px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-all text-primary-700"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary-700/50 uppercase tracking-widest mb-1.5">Phone</label>
                  <input
                    type="tel"
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress((p) => ({ ...p, phone: e.target.value }))}
                    className="w-full border border-surface-200 rounded-card px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-all text-primary-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary-700/50 uppercase tracking-widest mb-1.5">Address Line 1</label>
                  <input
                    type="text"
                    value={newAddress.address_line1}
                    onChange={(e) => setNewAddress((p) => ({ ...p, address_line1: e.target.value }))}
                    className="w-full border border-surface-200 rounded-card px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-all text-primary-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary-700/50 uppercase tracking-widest mb-1.5">Address Line 2 (optional)</label>
                  <input
                    type="text"
                    value={newAddress.address_line2}
                    onChange={(e) => setNewAddress((p) => ({ ...p, address_line2: e.target.value }))}
                    className="w-full border border-surface-200 rounded-card px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-all text-primary-700"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-primary-700/50 uppercase tracking-widest mb-1.5">City</label>
                    <input
                      type="text"
                      value={newAddress.city_name}
                      onChange={(e) => setNewAddress((p) => ({ ...p, city_name: e.target.value }))}
                      className="w-full border border-surface-200 rounded-card px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-all text-primary-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-primary-700/50 uppercase tracking-widest mb-1.5">PIN Code</label>
                    <input
                      type="text"
                      value={newAddress.pin_code}
                      onChange={(e) => setNewAddress((p) => ({ ...p, pin_code: e.target.value }))}
                      className="w-full border border-surface-200 rounded-card px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-all text-primary-700"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleSaveAddress}
                    className="btn-primary text-sm"
                  >
                    Save Address
                  </button>
                  <button
                    onClick={() => setShowNewAddress(false)}
                    className="btn-secondary text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowNewAddress(true)}
                className="mt-4 flex items-center gap-2 text-primary-600 text-sm font-semibold hover:text-primary-700 transition-colors group"
              >
                <span className="w-7 h-7 rounded-full bg-accent-100 flex items-center justify-center group-hover:bg-accent-200 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </span>
                Add New Address
              </button>
            )}
          </div>
        )}

        {/* ── Step 3: Review & Confirm ───────────────────── */}
        {step === 3 && (
          <div>
            <h2 className="text-base font-heading font-medium text-primary-700 mb-5">Review & Confirm</h2>

            <div className="space-y-3">
              {/* Services */}
              <div className="bg-white rounded-card border border-surface-200 p-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-accent-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                    </svg>
                  </div>
                  <h3 className="text-xs font-semibold text-primary-700/50 uppercase tracking-widest">Services</h3>
                </div>
                <div className="divide-y divide-surface-100">
                  {cart.map((c, idx) => (
                    <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex justify-between text-sm">
                      <span className="text-primary-700/70">
                        {c.service.name}
                        {c.variant ? ` - ${c.variant.name}` : ""}{" "}
                        <span className="text-primary-700/40">x{c.quantity}</span>
                      </span>
                      <span className="font-semibold text-primary-600">
                        &#8377;{getItemPrice(c) * c.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Schedule */}
              <div className="bg-white rounded-card border border-surface-200 p-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-accent-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                  </div>
                  <h3 className="text-xs font-semibold text-primary-700/50 uppercase tracking-widest">Schedule</h3>
                </div>
                <p className="text-sm font-medium text-primary-700">
                  {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-IN", {
                    weekday: "long", year: "numeric", month: "long", day: "numeric",
                  })}{" "}
                  at <span className="text-primary-600 font-semibold">{selectedTime}</span>
                </p>
              </div>

              {/* Address */}
              <div className="bg-white rounded-card border border-surface-200 p-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-accent-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xs font-semibold text-primary-700/50 uppercase tracking-widest">Address</h3>
                </div>
                {(() => {
                  const addr = addresses.find((a) => a.id === selectedAddressId);
                  return addr ? (
                    <div className="text-sm">
                      <p className="font-semibold text-primary-700">{addr.label}</p>
                      <p className="text-primary-700/60">
                        {addr.address_line1}
                        {addr.address_line2 ? `, ${addr.address_line2}` : ""}
                      </p>
                      <p className="text-primary-700/40">{addr.city_name} - {addr.pin_code}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-primary-700/40">-</p>
                  );
                })()}
              </div>

              {/* Notes */}
              <div className="bg-white rounded-card border border-surface-200 p-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-accent-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" />
                    </svg>
                  </div>
                  <h3 className="text-xs font-semibold text-primary-700/50 uppercase tracking-widest">Notes (optional)</h3>
                </div>
                <textarea
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  rows={3}
                  placeholder="Any special instructions..."
                  className="w-full border border-surface-200 rounded-card px-3.5 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-all text-primary-700"
                />
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-card border border-surface-200 p-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-accent-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                    </svg>
                  </div>
                  <h3 className="text-xs font-semibold text-primary-700/50 uppercase tracking-widest">Payment Method</h3>
                </div>
                <div className="space-y-2.5">
                  {codEnabled && (
                    <label className={`flex items-center gap-3 p-4 rounded-card border cursor-pointer transition-all duration-200 ${
                      paymentMethod === "cod"
                        ? "border-primary-600 ring-2 ring-primary-600/20 bg-accent-50"
                        : "border-surface-200 hover:border-primary-600/30 bg-white"
                    }`}>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        paymentMethod === "cod" ? "border-primary-600" : "border-surface-300"
                      }`}>
                        {paymentMethod === "cod" && <div className="w-2.5 h-2.5 rounded-full bg-primary-600" />}
                      </div>
                      <input type="radio" name="payment" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} className="sr-only" />
                      <div className="flex-1">
                        <span className="text-sm font-semibold text-primary-700 flex items-center gap-2">
                          <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75" /></svg>
                          Pay After Service
                        </span>
                        <span className="text-xs text-primary-700/40 mt-0.5 block">Pay cash or UPI directly to the provider</span>
                      </div>
                    </label>
                  )}
                  {onlineEnabled && (
                    <label className={`flex items-center gap-3 p-4 rounded-card border cursor-pointer transition-all duration-200 ${
                      paymentMethod === "online"
                        ? "border-primary-600 ring-2 ring-primary-600/20 bg-accent-50"
                        : "border-surface-200 hover:border-primary-600/30 bg-white"
                    }`}>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        paymentMethod === "online" ? "border-primary-600" : "border-surface-300"
                      }`}>
                        {paymentMethod === "online" && <div className="w-2.5 h-2.5 rounded-full bg-primary-600" />}
                      </div>
                      <input type="radio" name="payment" checked={paymentMethod === "online"} onChange={() => setPaymentMethod("online")} className="sr-only" />
                      <div className="flex-1">
                        <span className="text-sm font-semibold text-primary-700 flex items-center gap-2">
                          <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" /></svg>
                          Pay Online Now
                        </span>
                        <span className="text-xs text-primary-700/40 mt-0.5 block">UPI, Card, Net Banking, Wallets</span>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              {/* Price breakdown */}
              <div className="bg-white rounded-card border border-surface-200 p-5">
                <h3 className="text-xs font-semibold text-primary-700/50 uppercase tracking-widest mb-3">Price Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-primary-700/60">
                    <span>Subtotal</span>
                    <span>&#8377;{subtotal.toFixed(2)}</span>
                  </div>
                  {platformFeeAmount > 0 && (
                    <div className="flex justify-between text-primary-700/60">
                      <span>Platform Fee</span>
                      <span>&#8377;{platformFeeAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-primary-700/60">
                    <span>Tax (18% GST)</span>
                    <span>&#8377;{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-surface-200 pt-3 mt-3">
                    <span className="text-xl font-heading font-medium text-primary-700">Total</span>
                    <span className="text-xl font-heading font-medium text-primary-700">&#8377;{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Navigation ─────────────────────────────────── */}
        <div className="flex justify-between mt-8 pb-8 gap-4">
          {step > 0 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="btn-secondary min-h-[48px]"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
              className="btn-primary min-h-[48px] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary min-h-[48px] disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {submitting ? "Placing Order..." : paymentMethod === "cod" ? "Confirm Booking" : "Confirm & Pay"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
