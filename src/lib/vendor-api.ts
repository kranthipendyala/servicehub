const IS_SERVER = typeof window === "undefined";
const API_BASE_URL = IS_SERVER
  ? (process.env.NEXT_PUBLIC_API_URL || "https://obesityworldconference.com/api/m2/index.php/api")
  : "/proxy-api";

/* ------------------------------------------------------------------ */
/*  Token helpers                                                      */
/* ------------------------------------------------------------------ */

export function getVendorToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("vendor_token");
}

export function getVendorUser(): {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  onboarding_completed?: boolean;
} | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("vendor_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setVendorAuth(token: string, user: Record<string, unknown>) {
  localStorage.setItem("vendor_token", token);
  localStorage.setItem("vendor_user", JSON.stringify(user));
}

export function clearVendorAuth() {
  localStorage.removeItem("vendor_token");
  localStorage.removeItem("vendor_user");
}

export function isVendorLoggedIn(): boolean {
  return !!getVendorToken();
}

/* ------------------------------------------------------------------ */
/*  Core fetch wrapper                                                 */
/* ------------------------------------------------------------------ */

interface VendorFetchOptions extends Omit<RequestInit, "body"> {
  params?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
}

export interface ApiResult<T = unknown> {
  status: boolean;
  message: string;
  data: T;
}

export async function vendorFetch<T = unknown>(
  endpoint: string,
  options: VendorFetchOptions = {}
): Promise<ApiResult<T>> {
  const { params, body, ...rest } = options;
  const token = getVendorToken();

  let url = `${API_BASE_URL}${endpoint}`;

  if (params) {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") sp.append(k, String(v));
    });
    const qs = sp.toString();
    if (qs) url += `?${qs}`;
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(rest.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    headers["X-Auth-Token"] = token;
  }

  const response = await fetch(url, {
    ...rest,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401) {
    clearVendorAuth();
    if (typeof window !== "undefined") {
      window.location.href = "/vendor/login";
    }
    throw new Error("Unauthorized");
  }

  // Safely parse JSON — handle HTML error responses
  const text = await response.text();
  let json: ApiResult<T>;
  try {
    json = JSON.parse(text);
  } catch {
    console.error("vendorFetch: Non-JSON response from", url, "→", text.slice(0, 200));
    throw new Error(`Server error (${response.status}). Please try again.`);
  }

  if (!response.ok) {
    throw new Error(json.message || `API error ${response.status}`);
  }

  return json as ApiResult<T>;
}

/* ------------------------------------------------------------------ */
/*  Auth                                                               */
/* ------------------------------------------------------------------ */

export async function vendorLogin(email: string, password: string) {
  const res = await vendorFetch<{
    id: number;
    name: string;
    email: string;
    phone: string;
    role: string;
    token: string;
    token_expires_at: string;
  }>("/auth/login", {
    method: "POST",
    body: { email, password },
  });

  if (!["vendor", "business_owner"].includes(res.data.role)) {
    if (res.data.role === "user") {
      throw new Error("This is a customer account. Please login at the main website.");
    }
    throw new Error("This account does not have vendor access. Please contact support.");
  }

  setVendorAuth(res.data.token, {
    id: res.data.id,
    name: res.data.name,
    email: res.data.email,
    role: res.data.role,
  });

  return res.data;
}

export async function vendorLogout() {
  try {
    await vendorFetch("/auth/logout", { method: "POST" });
  } catch {
    // ignore
  } finally {
    clearVendorAuth();
  }
}

/* ------------------------------------------------------------------ */
/*  Dashboard / Stats                                                  */
/* ------------------------------------------------------------------ */

import type { VendorStats, Booking, Service } from "@/types";

export async function getVendorStats() {
  return vendorFetch<VendorStats>("/vendor/stats");
}

/* ------------------------------------------------------------------ */
/*  Bookings                                                           */
/* ------------------------------------------------------------------ */

export async function getVendorBookings(params?: {
  page?: number;
  per_page?: number;
  status?: string;
  search?: string;
}) {
  return vendorFetch<{
    bookings: Booking[];
    pagination: {
      total: number;
      page: number;
      per_page: number;
      pages: number;
    };
  }>("/vendor/bookings", { params });
}

export async function getVendorBooking(id: number | string) {
  return vendorFetch<Booking>(`/vendor/bookings/${id}`);
}

export async function acceptBooking(id: number | string) {
  return vendorFetch(`/vendor/bookings/${id}/accept`, { method: "POST" });
}

export async function rejectBooking(id: number | string, reason?: string) {
  return vendorFetch(`/vendor/bookings/${id}/reject`, {
    method: "POST",
    body: reason ? { reason } : undefined,
  });
}

export async function startBooking(id: number | string) {
  return vendorFetch(`/vendor/bookings/${id}/start`, { method: "POST" });
}

export async function completeBooking(id: number | string, notes?: string) {
  return vendorFetch(`/vendor/bookings/${id}/complete`, {
    method: "POST",
    body: notes ? { notes } : undefined,
  });
}

export async function collectPayment(id: number | string, method: string = "cash") {
  return vendorFetch(`/vendor/bookings/${id}/collect-payment`, {
    method: "POST",
    body: { method },
  });
}

/* ------------------------------------------------------------------ */
/*  Services                                                           */
/* ------------------------------------------------------------------ */

export async function getVendorServices() {
  return vendorFetch<Service[]>("/vendor/services");
}

export async function createVendorService(data: Partial<Service>) {
  return vendorFetch("/vendor/services", {
    method: "POST",
    body: data,
  });
}

export async function updateVendorService(
  id: number | string,
  data: Partial<Service>
) {
  return vendorFetch(`/vendor/services/${id}`, {
    method: "PUT",
    body: data,
  });
}

export async function deleteVendorService(id: number | string) {
  return vendorFetch(`/vendor/services/${id}`, { method: "DELETE" });
}

/* ------------------------------------------------------------------ */
/*  Service Areas                                                      */
/* ------------------------------------------------------------------ */

export interface ServiceArea {
  id: number;
  city_id: number;
  city_name: string;
  city_slug: string;
  is_active: number;
}

export async function getServiceAreas() {
  return vendorFetch<ServiceArea[]>("/vendor/service-areas");
}

export async function updateServiceAreas(cityIds: number[]) {
  return vendorFetch<ServiceArea[]>("/vendor/service-areas", {
    method: "POST",
    body: { city_ids: cityIds },
  });
}

/* ------------------------------------------------------------------ */
/*  Business Categories                                                */
/* ------------------------------------------------------------------ */

export interface VendorCategory {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  is_primary: number;
}

export async function getVendorCategories() {
  return vendorFetch<VendorCategory[]>("/vendor/categories");
}

export async function updateVendorCategories(categoryIds: number[]) {
  return vendorFetch<VendorCategory[]>("/vendor/categories", {
    method: "POST",
    body: { category_ids: categoryIds },
  });
}

/* ------------------------------------------------------------------ */
/*  Availability                                                       */
/* ------------------------------------------------------------------ */

export interface VendorAvailability {
  day: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export async function getVendorAvailability() {
  return vendorFetch<VendorAvailability[]>("/vendor/availability");
}

export async function updateVendorAvailability(data: VendorAvailability[]) {
  return vendorFetch("/vendor/availability", {
    method: "PUT",
    body: { availability: data },
  });
}

/* ------------------------------------------------------------------ */
/*  Subscription Plans                                                 */
/* ------------------------------------------------------------------ */

export interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  monthly_price: number;
  annual_price: number;
  features: string[];
  max_services: number;
  commission_discount: number;
  is_popular?: boolean;
  is_active: boolean;
}

export interface VendorSubscription {
  id: number;
  vendor_id: number;
  plan_id: number;
  plan_name?: string;
  status: string;
  billing_cycle: "monthly" | "annual";
  starts_at: string;
  ends_at: string;
  auto_renew: boolean;
  created_at: string;
}

export async function getSubscriptionPlans() {
  return vendorFetch<SubscriptionPlan[]>("/vendor/subscriptions/plans");
}

export async function getCurrentSubscription() {
  return vendorFetch<VendorSubscription | null>("/vendor/subscriptions/current");
}

export async function subscribePlan(planId: number, cycle: "monthly" | "annual") {
  return vendorFetch("/vendor/subscriptions/subscribe", {
    method: "POST",
    body: { plan_id: planId, billing_cycle: cycle },
  });
}

export async function cancelSubscription() {
  return vendorFetch("/vendor/subscriptions/cancel", { method: "POST" });
}

/* ------------------------------------------------------------------ */
/*  Payouts                                                            */
/* ------------------------------------------------------------------ */

export interface Payout {
  id: number;
  vendor_id: number;
  amount: number;
  status: string;
  period_start: string;
  period_end: string;
  bookings_count: number;
  reference_id?: string;
  paid_at?: string;
  created_at: string;
}

export async function getPayouts(page?: number) {
  return vendorFetch<{
    payouts: Payout[];
    pagination: { total: number; page: number; per_page: number; pages: number };
  }>("/vendor/payouts", { params: { page } });
}

/* ------------------------------------------------------------------ */
/*  Bank Details                                                       */
/* ------------------------------------------------------------------ */

export interface BankDetails {
  id?: number;
  vendor_id?: number;
  account_holder_name: string;
  account_number: string;
  ifsc_code: string;
  bank_name: string;
  branch_name: string;
  upi_id?: string;
}

export async function getBankDetails() {
  return vendorFetch<BankDetails | null>("/vendor/bank-details");
}

export async function saveBankDetails(data: BankDetails) {
  return vendorFetch("/vendor/bank-details", {
    method: "POST",
    body: data,
  });
}

/* ------------------------------------------------------------------ */
/*  Documents (KYC)                                                    */
/* ------------------------------------------------------------------ */

export interface VendorDocument {
  id: number;
  vendor_id: number;
  document_type: string;
  document_url: string;
  status: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export async function uploadDocument(type: string, url: string) {
  return vendorFetch("/vendor/documents", {
    method: "POST",
    body: { document_type: type, document_url: url },
  });
}

export async function getMyDocuments() {
  return vendorFetch<VendorDocument[]>("/vendor/documents");
}

/* ------------------------------------------------------------------ */
/*  Reviews                                                            */
/* ------------------------------------------------------------------ */

export interface VendorReview {
  id: number;
  booking_id?: number;
  customer_name: string;
  rating: number;
  comment: string;
  vendor_reply?: string;
  created_at: string;
}

export async function getVendorReviews(page?: number) {
  return vendorFetch<{
    reviews: VendorReview[];
    pagination: { total: number; page: number; per_page: number; pages: number };
  }>("/vendor/reviews", { params: { page } });
}

export async function replyToReview(id: number, reply: string) {
  return vendorFetch(`/vendor/reviews/${id}/reply`, {
    method: "POST",
    body: { reply },
  });
}

/* ------------------------------------------------------------------ */
/*  Chat                                                               */
/* ------------------------------------------------------------------ */

export interface ChatMessage {
  id: number;
  booking_id: number;
  sender_id: number;
  sender_name: string;
  sender_role: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export async function getVendorChatMessages(bookingId: number | string) {
  return vendorFetch<ChatMessage[]>(`/vendor/bookings/${bookingId}/chat`);
}

export async function sendVendorChatMessage(bookingId: number | string, message: string) {
  return vendorFetch(`/vendor/bookings/${bookingId}/chat`, {
    method: "POST",
    body: { message },
  });
}

/* ------------------------------------------------------------------ */
/*  Phone OTP Auth                                                     */
/* ------------------------------------------------------------------ */

export async function sendVendorOtp(phone: string) {
  return vendorFetch<{ message: string }>("/otp/send", {
    method: "POST",
    body: { phone, purpose: "login" },
  });
}

export async function vendorPhoneLogin(phone: string, otp: string) {
  const res = await vendorFetch<{
    id: number;
    name: string;
    email: string;
    phone: string;
    role: string;
    token: string;
    token_expires_at: string;
    is_new_user?: boolean;
    onboarding_completed?: boolean;
  }>("/auth/phone-login", {
    method: "POST",
    body: { phone, otp },
  });

  return res.data;
}

/* ------------------------------------------------------------------ */
/*  Vendor Registration                                                */
/* ------------------------------------------------------------------ */

export async function vendorRegister(data: {
  phone: string;
  name: string;
  email: string;
  business_name: string;
  city_id: number;
}) {
  const res = await vendorFetch<{
    id: number;
    name: string;
    email: string;
    phone: string;
    role: string;
    token: string;
    onboarding_completed: boolean;
  }>("/vendor/register", {
    method: "POST",
    body: data,
  });

  setVendorAuth(res.data.token, {
    id: res.data.id,
    name: res.data.name,
    email: data.email,
    phone: data.phone,
    role: res.data.role,
    onboarding_completed: res.data.onboarding_completed,
  });

  return res.data;
}

/* ------------------------------------------------------------------ */
/*  Onboarding                                                         */
/* ------------------------------------------------------------------ */

export interface OnboardingStatus {
  profile_complete: boolean;
  services_added: boolean;
  services_count: number;
  documents_submitted: boolean;
  has_aadhaar: boolean;
  has_pan: boolean;
  bank_added: boolean;
  approved: boolean;
  business_status: string;
  business_id: number | null;
  business?: {
    name?: string;
    description?: string;
    short_description?: string;
    address?: string;
    city?: string;
    locality?: string;
    pin_code?: string;
    phone?: string;
    email?: string;
    website?: string;
    logo?: string;
    business_hours?: string;
  };
}

export async function getOnboardingStatus() {
  return vendorFetch<OnboardingStatus>("/vendor/onboarding/status");
}

export async function saveOnboardingStep(step: string, data: Record<string, unknown>) {
  return vendorFetch(`/vendor/onboarding/${step}`, {
    method: "POST",
    body: data,
  });
}

export async function completeOnboarding() {
  return vendorFetch("/vendor/onboarding/complete", {
    method: "POST",
  });
}
