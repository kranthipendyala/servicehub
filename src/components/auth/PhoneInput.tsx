"use client";

import { useRef, type ChangeEvent } from "react";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  autoFocus?: boolean;
}

export default function PhoneInput({
  value,
  onChange,
  disabled = false,
  error,
  autoFocus = false,
}: PhoneInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Strip everything except digits
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    onChange(digits);
  };

  // Format: "98765 43210"
  const formatted = value.length > 5 ? `${value.slice(0, 5)} ${value.slice(5)}` : value;

  return (
    <div>
      <div
        className={`flex items-stretch rounded-xl border-2 overflow-hidden transition-all ${
          error
            ? "border-red-400 ring-2 ring-red-400/20"
            : "border-surface-300 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20"
        } ${disabled ? "opacity-60 bg-surface-50" : "bg-white"}`}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Country code prefix */}
        <div className="flex items-center gap-1.5 px-4 bg-surface-50 border-r border-surface-200 select-none">
          <span className="text-lg leading-none">🇮🇳</span>
          <span className="text-sm font-semibold text-gray-600">+91</span>
        </div>

        {/* Phone number input */}
        <input
          ref={inputRef}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          autoFocus={autoFocus}
          disabled={disabled}
          value={formatted}
          onChange={handleChange}
          placeholder="98765 43210"
          className="flex-1 px-4 py-3.5 text-base font-medium text-gray-900 placeholder:text-gray-400 outline-none bg-transparent tracking-wide disabled:cursor-not-allowed"
        />

        {/* Checkmark when valid */}
        {value.length === 10 && (
          <div className="flex items-center pr-3">
            <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
