const IS_SERVER = typeof window === "undefined";
const API_BASE_URL = IS_SERVER
  ? (process.env.NEXT_PUBLIC_API_URL || "https://obesityworldconference.com/api/m2/api")
  : "/proxy-api";

/* ------------------------------------------------------------------ */
/*  Token helpers — Customer uses "customer_*" keys                    */
/* ------------------------------------------------------------------ */

const CUSTOMER_TOKEN_KEY = "customer_token";
const CUSTOMER_PROFILE_KEY = "customer_profile";
const ALLOWED_CUSTOMER_ROLES = ["user"];

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
}

export function getUserToken(): string | null {
  if (IS_SERVER) return null;
  return localStorage.getItem(CUSTOMER_TOKEN_KEY);
}

export function getUserProfile(): UserProfile | null {
  if (IS_SERVER) return null;
  const raw = localStorage.getItem(CUSTOMER_PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setUserAuth(token: string, user: UserProfile) {
  localStorage.setItem(CUSTOMER_TOKEN_KEY, token);
  localStorage.setItem(CUSTOMER_PROFILE_KEY, JSON.stringify(user));
}

export function clearUserAuth() {
  localStorage.removeItem(CUSTOMER_TOKEN_KEY);
  localStorage.removeItem(CUSTOMER_PROFILE_KEY);
}

export function isLoggedIn(): boolean {
  return !!getUserToken();
}

/* ------------------------------------------------------------------ */
/*  API helpers                                                        */
/* ------------------------------------------------------------------ */

interface AuthResponse {
  status: boolean;
  message: string;
  data: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    token: string;
    token_expires_at: string;
  };
}

async function authFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<AuthResponse> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getUserToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    headers["X-Auth-Token"] = token;
  }

  const response = await fetch(url, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string>) },
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message || `Error ${response.status}`);
  }

  return json;
}

/* ------------------------------------------------------------------ */
/*  Auth actions                                                       */
/* ------------------------------------------------------------------ */

export async function userLogin(email: string, password: string) {
  const res = await authFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (!res.status || !res.data) {
    throw new Error(res.message || "Login failed");
  }

  // Strict role check: only "user" role allowed on customer portal
  if (!ALLOWED_CUSTOMER_ROLES.includes(res.data.role)) {
    if (res.data.role === "vendor" || res.data.role === "business_owner") {
      throw new Error("This is a vendor account. Please login at the Vendor Portal.");
    }
    throw new Error("This account cannot login here. Please contact support.");
  }

  setUserAuth(res.data.token, {
    id: Number(res.data.id),
    name: res.data.name,
    email: res.data.email,
    phone: res.data.phone,
    role: res.data.role,
  });

  return res.data;
}

export async function userRegister(data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}) {
  const res = await authFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!res.status || !res.data) {
    throw new Error(res.message || "Registration failed");
  }

  setUserAuth(res.data.token, {
    id: Number(res.data.id),
    name: res.data.name,
    email: res.data.email,
    phone: res.data.phone,
    role: res.data.role,
  });

  return res.data;
}

export async function userLogout() {
  try {
    await authFetch("/auth/logout", { method: "POST" });
  } catch {
    // ignore
  } finally {
    clearUserAuth();
  }
}

/* ------------------------------------------------------------------ */
/*  Phone OTP Auth                                                     */
/* ------------------------------------------------------------------ */

interface OtpSendResponse {
  status: boolean;
  message: string;
}

interface PhoneLoginResponse {
  status: boolean;
  message: string;
  data: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    token: string;
    is_new_user: boolean;
  };
  is_new_user?: boolean;
}

interface CompleteProfileResponse {
  status: boolean;
  message: string;
  data: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    token: string;
  };
}

export async function sendOtp(phone: string): Promise<OtpSendResponse> {
  const url = `${API_BASE_URL}/otp/send`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ phone, purpose: "login" }),
  });
  const json = await response.json();
  if (!response.ok || !json.status) {
    throw new Error(json.message || "Failed to send OTP");
  }
  return json;
}

export async function phoneLogin(
  phone: string,
  otp: string
): Promise<{
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  token: string;
  is_new_user: boolean;
}> {
  const url = `${API_BASE_URL}/auth/phone-login`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ phone, otp }),
  });
  const json: PhoneLoginResponse = await response.json();
  if (!response.ok || !json.status) {
    throw new Error(json.message || "OTP verification failed");
  }

  const data = json.data;
  // is_new_user may come from data or top-level
  const isNew = data.is_new_user ?? json.is_new_user ?? false;

  if (!isNew) {
    // Strict role check: only "user" role allowed on customer portal
    if (!ALLOWED_CUSTOMER_ROLES.includes(data.role)) {
      if (data.role === "vendor" || data.role === "business_owner") {
        throw new Error("This is a vendor account. Please login at the Vendor Portal.");
      }
      throw new Error("This account cannot login here. Please contact support.");
    }

    setUserAuth(data.token, {
      id: Number(data.id),
      name: data.name,
      email: data.email,
      phone: data.phone || phone,
      role: data.role,
    });
  }

  return { ...data, is_new_user: isNew };
}

export async function completeProfile(data: {
  phone: string;
  name: string;
  email?: string;
  role?: string;
}): Promise<{
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  token: string;
}> {
  const url = `${API_BASE_URL}/auth/complete-profile`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(data),
  });
  const json: CompleteProfileResponse = await response.json();
  if (!response.ok || !json.status) {
    throw new Error(json.message || "Profile creation failed");
  }

  const result = json.data;

  setUserAuth(result.token, {
    id: Number(result.id),
    name: result.name,
    email: result.email,
    phone: result.phone || data.phone,
    role: result.role,
  });

  return result;
}

/* ------------------------------------------------------------------ */
/*  Google OAuth Login                                                 */
/* ------------------------------------------------------------------ */

export async function googleLogin(googleToken: string): Promise<{
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  token: string;
  is_new_user: boolean;
}> {
  const url = `${API_BASE_URL}/auth/google-login`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ google_token: googleToken }),
  });

  const text = await response.text();
  let json: { status: boolean; message: string; data: any };
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error("Server error. Please try again.");
  }

  if (!response.ok || !json.status) {
    throw new Error(json.message || "Google login failed");
  }

  const data = json.data;

  // Role check — only customers allowed
  if (data.role && !ALLOWED_CUSTOMER_ROLES.includes(data.role)) {
    throw new Error("This Google account is linked to a vendor/admin. Please use the appropriate portal.");
  }

  // Store auth
  if (data.token) {
    setUserAuth(data.token, {
      id: Number(data.id),
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      role: data.role,
    });
  }

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    role: data.role,
    token: data.token,
    is_new_user: data.is_new_user ?? false,
  };
}
