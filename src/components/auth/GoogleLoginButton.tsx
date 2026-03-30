"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// Google Client ID — set in .env.local or fallback
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

interface GoogleLoginButtonProps {
  onSuccess: (credential: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  text?: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (element: HTMLElement, config: Record<string, unknown>) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export default function GoogleLoginButton({
  onSuccess,
  onError,
  disabled,
  text = "Continue with Google",
}: GoogleLoginButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCredentialResponse = useCallback(
    (response: { credential: string }) => {
      if (response.credential) {
        setLoading(true);
        onSuccess(response.credential);
      }
    },
    [onSuccess]
  );

  // Load Google Identity Services SDK
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    // Check if already loaded
    if (window.google?.accounts?.id) {
      setSdkLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setSdkLoaded(true);
    script.onerror = () => onError?.("Failed to load Google Sign-In");
    document.head.appendChild(script);

    return () => {
      // Don't remove — other components may use it
    };
  }, [onError]);

  // Initialize Google button
  useEffect(() => {
    if (!sdkLoaded || !GOOGLE_CLIENT_ID || !window.google || !buttonRef.current)
      return;

    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        width: buttonRef.current.offsetWidth,
        text: "continue_with",
        shape: "pill",
        logo_alignment: "left",
      });
    } catch {
      onError?.("Failed to initialize Google Sign-In");
    }
  }, [sdkLoaded, handleCredentialResponse, onError]);

  // If no client ID configured, show a manual button that tells user to configure
  if (!GOOGLE_CLIENT_ID) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => onError?.("Google Sign-In is not configured. Please add NEXT_PUBLIC_GOOGLE_CLIENT_ID to your environment.")}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border-2 border-surface-200 hover:border-surface-300 hover:bg-surface-50 transition-all text-sm font-medium text-gray-700 bg-white disabled:opacity-50"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        {text}
      </button>
    );
  }

  return (
    <div className="relative w-full">
      {/* Google's rendered button */}
      <div
        ref={buttonRef}
        className={`w-full ${disabled || loading ? "opacity-50 pointer-events-none" : ""}`}
      />

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl">
          <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Fallback if SDK hasn't loaded yet */}
      {!sdkLoaded && (
        <button
          type="button"
          disabled
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border-2 border-surface-200 text-sm font-medium text-gray-400 bg-white cursor-wait"
        >
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
          Loading Google Sign-In...
        </button>
      )}
    </div>
  );
}
