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
// Business info comes from getBusinessServices response

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
  return d.toISOString().split("T")[0]; // YYYY-MM-DD
}

function formatDateDisplay(d: Date): string {
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/* ================================================================== */
/*  Page component                                                      */
/* ================================================================== */

export default function BookingPage() {
  const router = useRouter();
  const params = useParams();
  const businessSlug = params.businessSlug as string;

  /* --- state --- */
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

  /* --- auth check --- */
  useEffect(() => {
    if (!authUser) {
      router.push(`/login?redirect=/book/${businessSlug}`);
    }
  }, [authUser, businessSlug, router]);

  /* --- load services + business info --- */
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
        // Fallback: fetch business info via proxy if not in services response
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

  /* --- load addresses when reaching step 2 --- */
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

  /* --- cart helpers --- */
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

  /* --- step validation --- */
  const canProceed = (): boolean => {
    switch (step) {
      case 0:
        return cart.length > 0;
      case 1:
        return !!selectedDate && !!selectedTime;
      case 2:
        return !!selectedAddressId;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const { cod_enabled: codEnabled, online_payment_enabled: onlineEnabled } = usePlatform();
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");

  // Auto-select payment method based on platform config
  useEffect(() => {
    if (codEnabled && !onlineEnabled) setPaymentMethod("cod");
    else if (onlineEnabled && !codEnabled) setPaymentMethod("online");
    else if (onlineEnabled) setPaymentMethod("online");
    else setPaymentMethod("cod");
  }, [codEnabled, onlineEnabled]);

  /* --- submit booking --- */
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

      // Only try Razorpay if online payment
      if (paymentMethod === "online") {
        try {
          await createPaymentOrder(booking.id);
        } catch {
          // Payment order creation may fail — continue to confirmation
        }
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

  /* --- save new address --- */
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-[#0d9488] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#0d9488] text-white py-6">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-2xl font-bold">Book a Service</h1>
          {businessName && (
            <p className="text-blue-200 mt-1">{businessName}</p>
          )}
        </div>
      </div>

      {/* Stepper */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center mb-8">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center flex-1">
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    i <= step
                      ? "bg-[#f97316] text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {i < step ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={`ml-2 text-sm font-medium hidden sm:inline ${
                    i <= step ? "text-[#0d9488]" : "text-gray-400"
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-3 ${
                    i < step ? "bg-[#f97316]" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* ── Step 0: Select Services ─────────────────────────── */}
        {step === 0 && (
          <div>
            <h2 className="text-lg font-semibold text-[#0d9488] mb-4">
              Select Services
            </h2>
            {services.length === 0 ? (
              <p className="text-gray-500">No services available.</p>
            ) : (
              <div className="space-y-3">
                {services.map((svc) => (
                  <div
                    key={svc.id}
                    className="bg-white rounded-lg border p-4 hover:border-[#f97316] transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {svc.name}
                        </h3>
                        {svc.short_description && (
                          <p className="text-sm text-gray-500 mt-1">
                            {svc.short_description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[#f97316] font-bold">
                            ₹{svc.discounted_price || svc.base_price}
                          </span>
                          {svc.discounted_price && svc.discounted_price < svc.base_price && (
                            <span className="text-gray-400 text-sm line-through">
                              ₹{svc.base_price}
                            </span>
                          )}
                          {svc.duration_minutes > 0 && (
                            <span className="text-xs text-gray-400">
                              ~{svc.duration_minutes} min
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Add / quantity controls */}
                      {(() => {
                        const inCart = cart.find(
                          (c) => c.service.id === svc.id && !c.variant
                        );
                        return inCart ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                updateQuantity(svc.id, undefined, inCart.quantity - 1)
                              }
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                            >
                              -
                            </button>
                            <span className="w-6 text-center font-medium">
                              {inCart.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(svc.id, undefined, inCart.quantity + 1)
                              }
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(svc)}
                            className="px-4 py-2 bg-[#f97316] text-white rounded-lg text-sm font-medium hover:bg-[#ea580c] transition-colors"
                          >
                            Add
                          </button>
                        );
                      })()}
                    </div>

                    {/* Variants */}
                    {svc.variants && svc.variants.length > 0 && (
                      <div className="mt-3 pl-4 border-l-2 border-gray-100 space-y-2">
                        {svc.variants
                          .filter((v) => v.is_active)
                          .map((v) => {
                            const vInCart = cart.find(
                              (c) =>
                                c.service.id === svc.id && c.variant?.id === v.id
                            );
                            return (
                              <div
                                key={v.id}
                                className="flex items-center justify-between"
                              >
                                <div>
                                  <span className="text-sm text-gray-700">
                                    {v.name}
                                  </span>
                                  <span className="ml-2 text-sm text-[#f97316] font-medium">
                                    ₹{v.price}
                                  </span>
                                </div>
                                {vInCart ? (
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() =>
                                        updateQuantity(
                                          svc.id,
                                          v.id,
                                          vInCart.quantity - 1
                                        )
                                      }
                                      className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 text-xs hover:bg-gray-100"
                                    >
                                      -
                                    </button>
                                    <span className="w-5 text-center text-sm font-medium">
                                      {vInCart.quantity}
                                    </span>
                                    <button
                                      onClick={() =>
                                        updateQuantity(
                                          svc.id,
                                          v.id,
                                          vInCart.quantity + 1
                                        )
                                      }
                                      className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 text-xs hover:bg-gray-100"
                                    >
                                      +
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => addToCart(svc, v)}
                                    className="px-3 py-1 border border-[#f97316] text-[#f97316] rounded text-xs font-medium hover:bg-orange-50 transition-colors"
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
            )}

            {/* Cart summary */}
            {cart.length > 0 && (
              <div className="mt-6 bg-white rounded-lg border p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Selected ({cart.reduce((s, c) => s + c.quantity, 0)} items)
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  {cart.map((c, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>
                        {c.service.name}
                        {c.variant ? ` - ${c.variant.name}` : ""} x{c.quantity}
                      </span>
                      <span>₹{getItemPrice(c) * c.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t mt-2 pt-2 flex justify-between font-semibold">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Step 1: Date & Time ─────────────────────────────── */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold text-[#0d9488] mb-4">
              Choose Date &amp; Time
            </h2>

            {/* Date picker */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Select Date
              </h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {calendarDates.map((d) => {
                  const ds = formatDate(d);
                  return (
                    <button
                      key={ds}
                      onClick={() => setSelectedDate(ds)}
                      className={`flex-shrink-0 w-20 py-3 rounded-lg border text-center text-sm transition-colors ${
                        selectedDate === ds
                          ? "border-[#f97316] bg-orange-50 text-[#f97316] font-semibold"
                          : "border-gray-200 hover:border-gray-300 text-gray-700"
                      }`}
                    >
                      <div className="text-xs opacity-70">
                        {d.toLocaleDateString("en-IN", { weekday: "short" })}
                      </div>
                      <div className="font-medium">
                        {d.getDate()}
                      </div>
                      <div className="text-xs opacity-70">
                        {d.toLocaleDateString("en-IN", { month: "short" })}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time slots */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Select Time
              </h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedTime(slot)}
                    className={`py-2 rounded-lg border text-sm transition-colors ${
                      selectedTime === slot
                        ? "border-[#f97316] bg-orange-50 text-[#f97316] font-semibold"
                        : "border-gray-200 hover:border-gray-300 text-gray-700"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Address ─────────────────────────────────── */}
        {step === 2 && (
          <div>
            <h2 className="text-lg font-semibold text-[#0d9488] mb-4">
              Select Address
            </h2>

            {addresses.length === 0 && !showNewAddress && (
              <p className="text-gray-500 mb-4">
                No saved addresses. Please add one.
              </p>
            )}

            <div className="space-y-3">
              {addresses.map((addr) => (
                <label
                  key={addr.id}
                  className={`flex items-start gap-3 p-4 bg-white rounded-lg border cursor-pointer transition-colors ${
                    selectedAddressId === addr.id
                      ? "border-[#f97316] ring-1 ring-[#f97316]"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    checked={selectedAddressId === addr.id}
                    onChange={() => setSelectedAddressId(addr.id)}
                    className="mt-1 accent-[#f97316]"
                  />
                  <div>
                    <div className="font-medium text-gray-900">
                      {addr.label}
                      {addr.is_default && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {addr.address_line1}
                      {addr.address_line2 ? `, ${addr.address_line2}` : ""}
                    </p>
                    <p className="text-sm text-gray-500">
                      {addr.city_name} - {addr.pin_code}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            {/* New address form */}
            {showNewAddress ? (
              <div className="mt-4 bg-white rounded-lg border p-4 space-y-3">
                <h3 className="font-medium text-gray-900">New Address</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Label
                    </label>
                    <select
                      value={newAddress.label}
                      onChange={(e) =>
                        setNewAddress((p) => ({ ...p, label: e.target.value }))
                      }
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    >
                      <option>Home</option>
                      <option>Office</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={newAddress.full_name}
                      onChange={(e) =>
                        setNewAddress((p) => ({ ...p, full_name: e.target.value }))
                      }
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={newAddress.phone}
                    onChange={(e) =>
                      setNewAddress((p) => ({ ...p, phone: e.target.value }))
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Address Line 1
                  </label>
                  <input
                    type="text"
                    value={newAddress.address_line1}
                    onChange={(e) =>
                      setNewAddress((p) => ({
                        ...p,
                        address_line1: e.target.value,
                      }))
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Address Line 2 (optional)
                  </label>
                  <input
                    type="text"
                    value={newAddress.address_line2}
                    onChange={(e) =>
                      setNewAddress((p) => ({
                        ...p,
                        address_line2: e.target.value,
                      }))
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={newAddress.city_name}
                      onChange={(e) =>
                        setNewAddress((p) => ({
                          ...p,
                          city_name: e.target.value,
                        }))
                      }
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      PIN Code
                    </label>
                    <input
                      type="text"
                      value={newAddress.pin_code}
                      onChange={(e) =>
                        setNewAddress((p) => ({
                          ...p,
                          pin_code: e.target.value,
                        }))
                      }
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveAddress}
                    className="px-4 py-2 bg-[#f97316] text-white rounded-lg text-sm font-medium hover:bg-[#ea580c]"
                  >
                    Save Address
                  </button>
                  <button
                    onClick={() => setShowNewAddress(false)}
                    className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowNewAddress(true)}
                className="mt-4 flex items-center gap-2 text-[#f97316] text-sm font-medium hover:underline"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add New Address
              </button>
            )}
          </div>
        )}

        {/* ── Step 3: Review & Confirm ────────────────────────── */}
        {step === 3 && (
          <div>
            <h2 className="text-lg font-semibold text-[#0d9488] mb-4">
              Review &amp; Confirm
            </h2>

            <div className="space-y-4">
              {/* Services */}
              <div className="bg-white rounded-lg border p-4">
                <h3 className="font-medium text-gray-900 mb-2">Services</h3>
                <div className="divide-y">
                  {cart.map((c, idx) => (
                    <div key={idx} className="py-2 flex justify-between text-sm">
                      <span className="text-gray-700">
                        {c.service.name}
                        {c.variant ? ` - ${c.variant.name}` : ""}{" "}
                        <span className="text-gray-400">x{c.quantity}</span>
                      </span>
                      <span className="font-medium">
                        ₹{getItemPrice(c) * c.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Schedule */}
              <div className="bg-white rounded-lg border p-4">
                <h3 className="font-medium text-gray-900 mb-2">Schedule</h3>
                <p className="text-sm text-gray-700">
                  {new Date(selectedDate + "T00:00:00").toLocaleDateString(
                    "en-IN",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}{" "}
                  at {selectedTime}
                </p>
              </div>

              {/* Address */}
              <div className="bg-white rounded-lg border p-4">
                <h3 className="font-medium text-gray-900 mb-2">Address</h3>
                {(() => {
                  const addr = addresses.find(
                    (a) => a.id === selectedAddressId
                  );
                  return addr ? (
                    <div className="text-sm text-gray-700">
                      <p className="font-medium">{addr.label}</p>
                      <p>
                        {addr.address_line1}
                        {addr.address_line2 ? `, ${addr.address_line2}` : ""}
                      </p>
                      <p>
                        {addr.city_name} - {addr.pin_code}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">-</p>
                  );
                })()}
              </div>

              {/* Notes */}
              <div className="bg-white rounded-lg border p-4">
                <h3 className="font-medium text-gray-900 mb-2">
                  Notes (optional)
                </h3>
                <textarea
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  rows={3}
                  placeholder="Any special instructions..."
                  className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
                />
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg border p-4">
                <h3 className="font-medium text-gray-900 mb-3">Payment Method</h3>
                <div className="space-y-2">
                  {codEnabled && (
                    <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "cod" ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"}`}>
                      <input type="radio" name="payment" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} className="accent-green-600" />
                      <div className="flex-1">
                        <span className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                          <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75" /></svg>
                          Pay After Service
                        </span>
                        <span className="text-xs text-gray-500 mt-0.5 block">Pay cash or UPI directly to the service provider after work is done</span>
                      </div>
                      {paymentMethod === "cod" && <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Selected</span>}
                    </label>
                  )}
                  {onlineEnabled && (
                    <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "online" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
                      <input type="radio" name="payment" checked={paymentMethod === "online"} onChange={() => setPaymentMethod("online")} className="accent-blue-600" />
                      <div className="flex-1">
                        <span className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" /></svg>
                          Pay Online Now
                        </span>
                        <span className="text-xs text-gray-500 mt-0.5 block">UPI, Credit/Debit Card, Net Banking, Wallets</span>
                      </div>
                      {paymentMethod === "online" && <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">Selected</span>}
                    </label>
                  )}
                </div>
              </div>

              {/* Price breakdown */}
              <div className="bg-white rounded-lg border p-4">
                <h3 className="font-medium text-gray-900 mb-2">
                  Price Summary
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  {platformFeeAmount > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Platform Fee</span>
                      <span>₹{platformFeeAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (18% GST)</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 text-base border-t pt-2 mt-2">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Navigation buttons ──────────────────────────────── */}
        <div className="flex justify-between mt-8">
          {step > 0 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
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
              className="px-6 py-2.5 bg-[#f97316] text-white rounded-lg font-medium hover:bg-[#ea580c] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-8 py-2.5 bg-[#0d9488] text-white rounded-lg font-medium hover:bg-[#0f766e] disabled:opacity-60 transition-colors"
            >
              {submitting ? "Placing Order..." : paymentMethod === "cod" ? "Confirm Booking" : "Confirm & Pay"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
