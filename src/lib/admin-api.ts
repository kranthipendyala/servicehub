const IS_SERVER = typeof window === "undefined";
const API_BASE_URL = IS_SERVER
  ? (process.env.NEXT_PUBLIC_API_URL || "https://obesityworldconference.com/api/m2/index.php/api")
  : "/proxy-api";

/* ------------------------------------------------------------------ */
/*  Token helpers                                                      */
/* ------------------------------------------------------------------ */

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_token");
}

export function getAdminUser(): {
  id: number;
  name: string;
  email: string;
  role: string;
} | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("admin_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setAdminAuth(token: string, user: Record<string, unknown>) {
  localStorage.setItem("admin_token", token);
  localStorage.setItem("admin_user", JSON.stringify(user));
}

export function clearAdminAuth() {
  localStorage.removeItem("admin_token");
  localStorage.removeItem("admin_user");
}

/* ------------------------------------------------------------------ */
/*  Core fetch wrapper                                                 */
/* ------------------------------------------------------------------ */

interface AdminFetchOptions extends Omit<RequestInit, "body"> {
  params?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
}

export interface ApiResult<T = unknown> {
  status: boolean;
  message: string;
  data: T;
}

export async function adminFetch<T = unknown>(
  endpoint: string,
  options: AdminFetchOptions = {}
): Promise<ApiResult<T>> {
  const { params, body, ...rest } = options;
  const token = getAdminToken();

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
    clearAdminAuth();
    if (typeof window !== "undefined") {
      window.location.href = "/admin/login";
    }
    throw new Error("Unauthorized");
  }

  const text = await response.text();
  let json: ApiResult<T>;
  try {
    json = JSON.parse(text);
  } catch {
    console.error("adminFetch: Non-JSON response from", url, "→", text.slice(0, 200));
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

export async function adminLogin(email: string, password: string) {
  const res = await adminFetch<{
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

  if (!["admin", "super_admin"].includes(res.data.role)) {
    throw new Error("Access denied. Invalid credentials.");
  }

  setAdminAuth(res.data.token, {
    id: res.data.id,
    name: res.data.name,
    email: res.data.email,
    role: res.data.role,
  });

  return res.data;
}

export async function adminLogout() {
  try {
    await adminFetch("/auth/logout", { method: "POST" });
  } catch {
    // ignore
  } finally {
    clearAdminAuth();
  }
}

/* ------------------------------------------------------------------ */
/*  Dashboard                                                          */
/* ------------------------------------------------------------------ */

export interface DashboardStats {
  total_businesses: number;
  active_businesses: number;
  pending_businesses: number;
  total_users: number;
  total_reviews: number;
  pending_reviews: number;
  total_cities: number;
  total_categories: number;
}

export async function getDashboardStats() {
  return adminFetch<DashboardStats>("/admin/stats");
}

/* ------------------------------------------------------------------ */
/*  Businesses                                                         */
/* ------------------------------------------------------------------ */

export interface AdminBusiness {
  id: number;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  category_id: number;
  category_name?: string;
  category_slug?: string;
  city_id: number;
  city_name?: string;
  city_slug?: string;
  locality_id?: number;
  locality_name?: string;
  locality_slug?: string;
  state_name?: string;
  address?: string;
  pin_code?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  logo_url?: string;
  cover_image_url?: string;
  rating?: number;
  review_count?: number;
  opening_hours?: string;
  established_year?: number;
  is_verified: boolean | number;
  is_featured: boolean | number;
  is_active?: boolean | number;
  status?: string;
  meta_title?: string;
  meta_description?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: number;
}

export interface AdminPagination {
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export async function getAdminBusinesses(params?: {
  page?: number;
  per_page?: number;
  status?: string;
  search?: string;
}) {
  return adminFetch<{
    businesses: AdminBusiness[];
    pagination: AdminPagination;
  }>("/admin/businesses", { params });
}

export async function getBusinessById(id: number | string) {
  return adminFetch<AdminBusiness>(`/admin/businesses/${id}`);
}

export async function updateBusiness(
  id: number | string,
  data: Partial<AdminBusiness>
) {
  return adminFetch(`/admin/businesses/${id}`, {
    method: "PUT",
    body: data,
  });
}

export async function createBusiness(data: Partial<AdminBusiness>) {
  return adminFetch("/admin/businesses", {
    method: "POST",
    body: data,
  });
}

export async function deleteBusiness(id: number) {
  return adminFetch(`/admin/businesses/${id}`, { method: "DELETE" });
}

export async function approveBusiness(id: number) {
  return adminFetch(`/admin/businesses/${id}/approve`, { method: "POST" });
}

/* ------------------------------------------------------------------ */
/*  Categories                                                         */
/* ------------------------------------------------------------------ */

export interface AdminCategory {
  id: number;
  name: string;
  slug: string;
  parent_id?: number | null;
  description?: string;
  icon?: string;
  image_url?: string;
  business_count?: number;
  meta_title?: string;
  meta_description?: string;
  sort_order?: number;
  children?: AdminCategory[];
}

export async function getAdminCategories() {
  return adminFetch<AdminCategory[]>("/admin/categories");
}

export async function createCategory(data: Partial<AdminCategory>) {
  return adminFetch("/admin/categories", {
    method: "POST",
    body: data,
  });
}

export async function updateCategory(
  id: number,
  data: Partial<AdminCategory>
) {
  return adminFetch(`/admin/categories/${id}`, {
    method: "PUT",
    body: data,
  });
}

export async function deleteCategory(id: number) {
  return adminFetch(`/admin/categories/${id}`, { method: "DELETE" });
}

/* ------------------------------------------------------------------ */
/*  Cities                                                             */
/* ------------------------------------------------------------------ */

export interface AdminCity {
  id: number;
  name: string;
  slug: string;
  state_id?: number;
  state_name?: string;
  state_slug?: string;
  latitude?: number;
  longitude?: number;
  business_count?: number;
  locality_count?: number;
  meta_title?: string;
  meta_description?: string;
  is_popular?: boolean;
}

export interface AdminLocality {
  id: number;
  name: string;
  slug: string;
  city_id: number;
  city_name?: string;
  city_slug?: string;
  latitude?: number;
  longitude?: number;
  pincode?: string;
  business_count?: number;
}

export async function getAdminCities() {
  return adminFetch<AdminCity[]>("/admin/cities");
}

export async function createCity(data: Partial<AdminCity>) {
  return adminFetch("/admin/cities", {
    method: "POST",
    body: data,
  });
}

export async function updateCity(id: number, data: Partial<AdminCity>) {
  return adminFetch(`/admin/cities/${id}`, {
    method: "PUT",
    body: data,
  });
}

export async function getLocalities(cityId?: number) {
  return adminFetch<AdminLocality[]>("/admin/localities", {
    params: cityId ? { city_id: cityId } : undefined,
  });
}

/* ------------------------------------------------------------------ */
/*  Reviews                                                            */
/* ------------------------------------------------------------------ */

export interface AdminReview {
  id: number;
  business_id: number;
  business_name?: string;
  business_slug?: string;
  user_id?: number;
  user_name: string;
  user_email?: string;
  rating: number;
  title?: string;
  comment: string;
  status?: string;
  is_verified?: boolean;
  created_at: string;
}

export async function getAdminReviews(params?: {
  page?: number;
  per_page?: number;
  status?: string;
}) {
  return adminFetch<{
    reviews: AdminReview[];
    pagination: AdminPagination;
  }>("/admin/reviews", { params });
}

export async function approveReview(id: number) {
  return adminFetch(`/admin/reviews/${id}/approve`, { method: "POST" });
}

export async function deleteReview(id: number) {
  return adminFetch(`/admin/reviews/${id}`, { method: "DELETE" });
}

/* ------------------------------------------------------------------ */
/*  Users                                                              */
/* ------------------------------------------------------------------ */

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  is_active: boolean | number;
  created_at: string;
  last_login_at?: string;
}

export async function getAdminUsers(params?: {
  page?: number;
  per_page?: number;
}) {
  return adminFetch<{
    users: AdminUser[];
    pagination: AdminPagination;
  }>("/admin/users", { params });
}

export async function updateUser(id: number, data: Partial<AdminUser>) {
  return adminFetch(`/admin/users/${id}`, {
    method: "PUT",
    body: data,
  });
}

/* ------------------------------------------------------------------ */
/*  SEO                                                                */
/* ------------------------------------------------------------------ */

export interface AdminSeoMeta {
  id?: number;
  page_type: string;
  reference_slug?: string;
  meta_title: string;
  meta_description?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  canonical_url?: string;
  h1_override?: string;
  no_index?: boolean;
}

export async function saveSeoMeta(data: Partial<AdminSeoMeta>) {
  return adminFetch("/admin/seo", {
    method: "POST",
    body: data,
  });
}

/* ------------------------------------------------------------------ */
/*  Recent data for dashboard                                          */
/* ------------------------------------------------------------------ */

export async function getRecentBusinesses() {
  return adminFetch<{
    businesses: AdminBusiness[];
    pagination: AdminPagination;
  }>("/admin/businesses", { params: { per_page: 10, page: 1 } });
}

export async function getRecentReviews() {
  return adminFetch<{
    reviews: AdminReview[];
    pagination: AdminPagination;
  }>("/admin/reviews", { params: { per_page: 10, page: 1 } });
}

/* ------------------------------------------------------------------ */
/*  Bookings                                                           */
/* ------------------------------------------------------------------ */

export interface AdminBooking {
  id: number;
  booking_number: string;
  customer_id: number;
  vendor_id: number;
  business_id: number;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  commission_rate: number;
  commission_amount: number;
  vendor_payout_amount: number;
  payment_status: string;
  payment_method?: string;
  cancellation_reason?: string;
  cancelled_by?: string;
  customer_notes?: string;
  vendor_notes?: string;
  started_at?: string;
  completed_at?: string;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  vendor_name?: string;
  vendor_phone?: string;
  business_name?: string;
  business_slug?: string;
  service_address?: string;
  items?: {
    id?: number;
    service_id: number;
    variant_id?: number;
    service_name: string;
    variant_name?: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }[];
}

export async function getAdminBookings(params?: {
  page?: number;
  per_page?: number;
  status?: string;
  search?: string;
}) {
  return adminFetch<{
    bookings: AdminBooking[];
    pagination: AdminPagination;
  }>("/admin/bookings", { params });
}

export async function getAdminBookingDetail(id: number | string) {
  return adminFetch<AdminBooking>(`/admin/bookings/${id}`);
}

export async function updateBookingStatus(
  id: number | string,
  status: string
) {
  return adminFetch(`/admin/bookings/${id}/status`, {
    method: "PUT",
    body: { status },
  });
}

/* ------------------------------------------------------------------ */
/*  Commissions                                                        */
/* ------------------------------------------------------------------ */

export interface AdminCommissionRule {
  id: number;
  category_id?: number;
  category_name?: string;
  commission_percentage: number;
  min_commission: number;
  is_active: boolean;
}

export async function getCommissionRules() {
  return adminFetch<AdminCommissionRule[]>("/admin/commissions");
}

export async function saveCommissionRule(
  data: Partial<AdminCommissionRule>
) {
  return adminFetch("/admin/commissions", {
    method: "POST",
    body: data,
  });
}

export async function updateCommissionRule(
  id: number,
  data: Partial<AdminCommissionRule>
) {
  return adminFetch(`/admin/commissions/${id}`, {
    method: "PUT",
    body: data,
  });
}

export async function deleteCommissionRule(id: number) {
  return adminFetch(`/admin/commissions/${id}`, { method: "DELETE" });
}

/* ------------------------------------------------------------------ */
/*  Admin Services                                                     */
/* ------------------------------------------------------------------ */

export interface AdminService {
  id: number;
  business_id: number;
  category_id: number;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  base_price: number;
  discounted_price?: number;
  price_unit: string;
  duration_minutes: number;
  image?: string;
  is_active: boolean;
  sort_order: number;
  category_name?: string;
  category_slug?: string;
  business_name?: string;
  business_slug?: string;
}

export async function getAdminServices(params?: {
  page?: number;
  per_page?: number;
  category?: string;
  search?: string;
  status?: string;
}) {
  return adminFetch<{
    services: AdminService[];
    pagination: AdminPagination;
  }>("/admin/services", { params });
}

/* ------------------------------------------------------------------ */
/*  Subscription Plans (Admin)                                         */
/* ------------------------------------------------------------------ */

export interface AdminSubscriptionPlan {
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
  created_at?: string;
}

export async function getSubscriptionPlans() {
  return adminFetch<AdminSubscriptionPlan[]>("/admin/subscription-plans");
}

export async function createSubscriptionPlan(data: Partial<AdminSubscriptionPlan>) {
  return adminFetch("/admin/subscription-plans", {
    method: "POST",
    body: data,
  });
}

export async function updateSubscriptionPlan(id: number, data: Partial<AdminSubscriptionPlan>) {
  return adminFetch(`/admin/subscription-plans/${id}`, {
    method: "PUT",
    body: data,
  });
}

/* ------------------------------------------------------------------ */
/*  Vendor Subscriptions                                               */
/* ------------------------------------------------------------------ */

export interface AdminVendorSubscription {
  id: number;
  vendor_id: number;
  vendor_name?: string;
  plan_id: number;
  plan_name?: string;
  status: string;
  billing_cycle: "monthly" | "annual";
  starts_at: string;
  ends_at: string;
  auto_renew: boolean;
  created_at: string;
}

export async function getVendorSubscriptions(params?: {
  page?: number;
  per_page?: number;
  status?: string;
}) {
  return adminFetch<{
    subscriptions: AdminVendorSubscription[];
    pagination: AdminPagination;
  }>("/admin/vendor-subscriptions", { params });
}

/* ------------------------------------------------------------------ */
/*  Payouts (Admin)                                                    */
/* ------------------------------------------------------------------ */

export interface AdminPayout {
  id: number;
  vendor_id: number;
  vendor_name?: string;
  amount: number;
  status: string;
  period_start: string;
  period_end: string;
  bookings_count: number;
  reference_id?: string;
  paid_at?: string;
  created_at: string;
}

export async function getPayouts(params?: {
  page?: number;
  per_page?: number;
  status?: string;
}) {
  return adminFetch<{
    payouts: AdminPayout[];
    pagination: AdminPagination;
  }>("/admin/payouts", { params });
}

export async function processPayout(id: number, referenceId?: string) {
  return adminFetch(`/admin/payouts/${id}/process`, {
    method: "POST",
    body: referenceId ? { reference_id: referenceId } : undefined,
  });
}

/* ------------------------------------------------------------------ */
/*  Vendor Documents (KYC)                                             */
/* ------------------------------------------------------------------ */

export interface AdminVendorDocument {
  id: number;
  vendor_id: number;
  vendor_name?: string;
  document_type: string;
  document_url: string;
  status: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export async function getVendorDocuments(params?: {
  page?: number;
  per_page?: number;
  status?: string;
}) {
  return adminFetch<{
    documents: AdminVendorDocument[];
    pagination: AdminPagination;
  }>("/admin/vendor-documents", { params });
}

export async function approveDocument(id: number) {
  return adminFetch(`/admin/vendor-documents/${id}/approve`, { method: "POST" });
}

export async function rejectDocument(id: number, reason: string) {
  return adminFetch(`/admin/vendor-documents/${id}/reject`, {
    method: "POST",
    body: { reason },
  });
}

/* ------------------------------------------------------------------ */
/*  Coupons                                                            */
/* ------------------------------------------------------------------ */

export interface AdminCoupon {
  id: number;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  min_order_amount?: number;
  max_discount?: number;
  usage_limit?: number;
  used_count: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  created_at?: string;
}

export async function getCoupons(params?: {
  page?: number;
  per_page?: number;
  status?: string;
}) {
  return adminFetch<{
    coupons: AdminCoupon[];
    pagination: AdminPagination;
  }>("/admin/coupons", { params });
}

export async function createCoupon(data: Partial<AdminCoupon>) {
  return adminFetch("/admin/coupons", {
    method: "POST",
    body: data,
  });
}

export async function updateCoupon(id: number, data: Partial<AdminCoupon>) {
  return adminFetch(`/admin/coupons/${id}`, {
    method: "PUT",
    body: data,
  });
}

export async function deleteCoupon(id: number) {
  return adminFetch(`/admin/coupons/${id}`, { method: "DELETE" });
}

/* ------------------------------------------------------------------ */
/*  Analytics                                                          */
/* ------------------------------------------------------------------ */

export interface RevenueAnalytics {
  total_revenue: number;
  total_commission: number;
  total_payouts: number;
  revenue_by_month: { month: string; revenue: number; commission: number; payouts: number }[];
  top_vendors: { vendor_id: number; vendor_name: string; revenue: number; bookings: number }[];
  bookings_by_status: { status: string; count: number }[];
  category_performance: { category_id: number; category_name: string; bookings: number; revenue: number }[];
}

export async function getAnalyticsRevenue(params?: { period?: string }) {
  return adminFetch<RevenueAnalytics>("/admin/analytics/revenue", { params });
}

export async function getAnalyticsBookings(params?: { period?: string }) {
  return adminFetch<{ bookings_by_status: { status: string; count: number }[] }>(
    "/admin/analytics/bookings",
    { params }
  );
}

export async function getAnalyticsVendors(params?: { period?: string }) {
  return adminFetch<{
    top_vendors: { vendor_id: number; vendor_name: string; revenue: number; bookings: number }[];
  }>("/admin/analytics/vendors", { params });
}
