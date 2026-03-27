const IS_SERVER = typeof window === "undefined";
const IS_LOCAL =
  typeof window !== "undefined" && window.location.hostname === "localhost";
const API_BASE_URL = IS_SERVER
  ? (process.env.NEXT_PUBLIC_API_URL || "https://obesityworldconference.com/api/m2/api")
  : IS_LOCAL
    ? "/proxy-api"
    : "https://obesityworldconference.com/api/m2/api";

/* ------------------------------------------------------------------ */
/*  Token helpers                                                      */
/* ------------------------------------------------------------------ */

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
}

export function getUserToken(): string | null {
  if (IS_SERVER) return null;
  return localStorage.getItem("user_token");
}

export function getUserProfile(): UserProfile | null {
  if (IS_SERVER) return null;
  const raw = localStorage.getItem("user_profile");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setUserAuth(token: string, user: UserProfile) {
  localStorage.setItem("user_token", token);
  localStorage.setItem("user_profile", JSON.stringify(user));
}

export function clearUserAuth() {
  localStorage.removeItem("user_token");
  localStorage.removeItem("user_profile");
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

  if (res.status && res.data) {
    setUserAuth(res.data.token, {
      id: Number(res.data.id),
      name: res.data.name,
      email: res.data.email,
      phone: res.data.phone,
      role: res.data.role,
    });
  }

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

  if (res.status && res.data) {
    setUserAuth(res.data.token, {
      id: Number(res.data.id),
      name: res.data.name,
      email: res.data.email,
      phone: res.data.phone,
      role: res.data.role,
    });
  }

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
