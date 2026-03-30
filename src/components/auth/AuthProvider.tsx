"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { getUserProfile, getUserToken, clearUserAuth, setUserAuth, type UserProfile } from "@/lib/user-auth";

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string, profile: UserProfile) => void;
  logout: () => void;
  refresh: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: () => {},
  logout: () => {},
  refresh: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    const token = getUserToken();
    if (token) {
      const profile = getUserProfile();
      setUser(profile);
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Listen for storage changes (multi-tab sync)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "customer_token" || e.key === "customer_profile") {
        refresh();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [refresh]);

  const login = useCallback((token: string, profile: UserProfile) => {
    setUserAuth(token, profile);
    setUser(profile);
  }, []);

  const logout = useCallback(() => {
    clearUserAuth();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
