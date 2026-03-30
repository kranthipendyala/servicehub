import type {
  ApiResponse,
  PaginatedResponse,
  Service,
  Booking,
  Address,
  PaymentOrder,
  Notification,
  CreateBookingRequest,
} from "@/types";

const IS_SERVER = typeof window === "undefined";
const API_BASE_URL = IS_SERVER
  ? (process.env.NEXT_PUBLIC_API_URL || "http://localhost/Mechanical/api/api")
  : "/proxy-api";

/* ------------------------------------------------------------------ */
/*  Auth fetch helper                                                   */
/* ------------------------------------------------------------------ */

function getToken(): string | null {
  if (IS_SERVER) return null;
  return localStorage.getItem("customer_token");
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    headers["X-Auth-Token"] = token;
  }
  return headers;
}

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit & { params?: Record<string, string | number | undefined> } = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;

  let url = `${API_BASE_URL}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers: { ...authHeaders(), ...(fetchOptions.headers as Record<string, string>) },
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message || `Error ${response.status}`);
  }

  // Normalize CI3 {status: true} → {success: true}
  if (json && typeof json === "object" && "status" in json) {
    return { ...json, success: json.status === true } as T;
  }
  return json as T;
}

/* ------------------------------------------------------------------ */
/*  Business services                                                   */
/* ------------------------------------------------------------------ */

export async function getBusinessServices(
  slug: string
): Promise<ApiResponse<Service[]> & { business?: { id: number; name: string; slug: string } }> {
  const res = await apiFetch<any>(`/businesses/${slug}/services`);
  return {
    success: res.success,
    data: res.data?.services || res.data || [],
    business: res.data?.business || null,
  };
}

/* ------------------------------------------------------------------ */
/*  Bookings                                                            */
/* ------------------------------------------------------------------ */

export async function createBooking(
  data: CreateBookingRequest
): Promise<ApiResponse<Booking>> {
  return apiFetch<ApiResponse<Booking>>("/bookings", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getMyBookings(
  page?: number,
  status?: string
): Promise<PaginatedResponse<Booking>> {
  const res = await apiFetch<any>("/bookings", {
    params: { page, status } as Record<string, string | number | undefined>,
  });
  return {
    success: res.success,
    data: res.data?.bookings || res.data || [],
    pagination: res.data?.pagination || res.pagination || {
      current_page: 1,
      per_page: 10,
      total_items: 0,
      total_pages: 1,
      has_next: false,
      has_prev: false,
    },
  };
}

export async function getBookingDetail(
  id: number
): Promise<ApiResponse<Booking>> {
  return apiFetch<ApiResponse<Booking>>(`/bookings/${id}`);
}

export async function cancelBooking(
  id: number,
  reason: string
): Promise<ApiResponse<Booking>> {
  return apiFetch<ApiResponse<Booking>>(`/bookings/${id}/cancel`, {
    method: "POST",
    body: JSON.stringify({ cancellation_reason: reason }),
  });
}

/* ------------------------------------------------------------------ */
/*  Payments                                                            */
/* ------------------------------------------------------------------ */

export async function createPaymentOrder(
  bookingId: number
): Promise<ApiResponse<PaymentOrder>> {
  return apiFetch<ApiResponse<PaymentOrder>>("/payments/create-order", {
    method: "POST",
    body: JSON.stringify({ booking_id: bookingId }),
  });
}

export async function verifyPayment(data: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  booking_id: number;
}): Promise<ApiResponse<{ booking_id: number; payment_status: string }>> {
  return apiFetch("/payments/verify", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/* ------------------------------------------------------------------ */
/*  Addresses                                                           */
/* ------------------------------------------------------------------ */

export async function getAddresses(): Promise<ApiResponse<Address[]>> {
  const res = await apiFetch<any>("/addresses");
  return {
    success: res.success,
    data: res.data?.addresses || res.data || [],
  };
}

export async function createAddress(
  data: Omit<Address, "id" | "user_id" | "is_default"> & { is_default?: boolean }
): Promise<ApiResponse<Address>> {
  return apiFetch<ApiResponse<Address>>("/addresses", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateAddress(
  id: number,
  data: Partial<Address>
): Promise<ApiResponse<Address>> {
  return apiFetch<ApiResponse<Address>>(`/addresses/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteAddress(
  id: number
): Promise<ApiResponse<null>> {
  return apiFetch<ApiResponse<null>>(`/addresses/${id}`, {
    method: "DELETE",
  });
}

/* ------------------------------------------------------------------ */
/*  Notifications                                                       */
/* ------------------------------------------------------------------ */

export async function getNotifications(
  page?: number
): Promise<PaginatedResponse<Notification>> {
  const res = await apiFetch<any>("/notifications", {
    params: { page } as Record<string, string | number | undefined>,
  });
  return {
    success: res.success,
    data: res.data?.notifications || res.data || [],
    pagination: res.data?.pagination || res.pagination || {
      current_page: 1,
      per_page: 20,
      total_items: 0,
      total_pages: 1,
      has_next: false,
      has_prev: false,
    },
  };
}

export async function getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
  return apiFetch<ApiResponse<{ count: number }>>("/notifications/unread-count");
}

export async function markNotificationRead(id: number): Promise<ApiResponse<null>> {
  return apiFetch<ApiResponse<null>>(`/notifications/${id}/read`, { method: "POST" });
}
