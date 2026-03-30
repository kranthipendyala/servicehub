"use client";

import { useState, useRef, useEffect, useCallback, type KeyboardEvent, type ClipboardEvent, type ChangeEvent } from "react";

interface OtpInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  onResend: () => void;
  loading?: boolean;
  error?: string;
  phone?: string;
}

export default function OtpInput({
  length = 4,
  onComplete,
  onResend,
  loading = false,
  error,
  phone,
}: OtpInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(""));
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const focusInput = (index: number) => {
    if (index >= 0 && index < length) {
      inputRefs.current[index]?.focus();
      inputRefs.current[index]?.select();
    }
  };

  const submitOtp = useCallback(
    (otp: string) => {
      if (otp.length === length) {
        onComplete(otp);
      }
    },
    [length, onComplete]
  );

  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const digit = e.target.value.replace(/\D/g, "").slice(-1);
    const newValues = [...values];
    newValues[index] = digit;
    setValues(newValues);

    if (digit && index < length - 1) {
      focusInput(index + 1);
    }

    // Auto-submit if all filled
    const otp = newValues.join("");
    if (otp.length === length && newValues.every((v) => v !== "")) {
      submitOtp(otp);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (values[index]) {
        const newValues = [...values];
        newValues[index] = "";
        setValues(newValues);
      } else if (index > 0) {
        focusInput(index - 1);
        const newValues = [...values];
        newValues[index - 1] = "";
        setValues(newValues);
      }
      e.preventDefault();
    } else if (e.key === "ArrowLeft") {
      focusInput(index - 1);
    } else if (e.key === "ArrowRight") {
      focusInput(index + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (pasted.length === 0) return;

    const newValues = [...values];
    for (let i = 0; i < length; i++) {
      newValues[i] = pasted[i] || "";
    }
    setValues(newValues);

    const lastFilled = Math.min(pasted.length, length) - 1;
    focusInput(lastFilled < length - 1 ? lastFilled + 1 : lastFilled);

    if (pasted.length === length) {
      submitOtp(pasted);
    }
  };

  const handleResend = () => {
    setValues(Array(length).fill(""));
    setCountdown(30);
    setCanResend(false);
    focusInput(0);
    onResend();
  };

  // Masked phone: "+91 98765 ****"
  const maskedPhone = phone
    ? `+91 ${phone.slice(0, 5)} ${phone.slice(5).replace(/./g, "*")}`
    : "";

  return (
    <div className="flex flex-col items-center">
      {/* Phone display */}
      {phone && (
        <p className="text-sm text-gray-500 mb-5">
          OTP sent to <span className="font-semibold text-gray-700">{maskedPhone}</span>
        </p>
      )}

      {/* OTP Boxes */}
      <div className="flex items-center gap-3 sm:gap-4 mb-4">
        {Array.from({ length }).map((_, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={1}
            value={values[i]}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            disabled={loading}
            className={`w-14 h-16 sm:w-16 sm:h-[4.5rem] text-center text-2xl sm:text-3xl font-bold rounded-xl border-2 outline-none transition-all
              ${error
                ? "border-red-400 bg-red-50/50 text-red-600"
                : values[i]
                  ? "border-primary-500 bg-primary-50/30 text-gray-900"
                  : "border-surface-300 bg-white text-gray-900"
              }
              ${!error && "focus:border-primary-500 focus:ring-3 focus:ring-primary-500/20 focus:bg-primary-50/30"}
              ${loading ? "opacity-60 cursor-not-allowed" : ""}
              tracking-widest`}
          />
        ))}
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1.5 mb-3">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </p>
      )}

      {/* Loading spinner */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-primary-600 mb-3">
          <div className="w-4 h-4 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin" />
          Verifying...
        </div>
      )}

      {/* Countdown + Resend */}
      <div className="text-center mt-2">
        {canResend ? (
          <button
            type="button"
            onClick={handleResend}
            disabled={loading}
            className="text-sm font-semibold text-primary-600 hover:text-primary-700 underline underline-offset-2 transition-colors disabled:opacity-50"
          >
            Resend OTP
          </button>
        ) : (
          <p className="text-sm text-gray-400">
            Resend OTP in{" "}
            <span className="font-semibold text-gray-600 tabular-nums">
              0:{countdown.toString().padStart(2, "0")}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
