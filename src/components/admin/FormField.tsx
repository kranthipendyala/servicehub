"use client";

import { ChangeEvent, ReactNode } from "react";

interface BaseProps {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  className?: string;
  helpText?: string;
}

interface TextFieldProps extends BaseProps {
  type: "text" | "email" | "password" | "url" | "number" | "tel";
  value: string | number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

interface TextareaFieldProps extends BaseProps {
  type: "textarea";
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
}

interface SelectFieldProps extends BaseProps {
  type: "select";
  value: string | number;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: { label: string; value: string | number }[];
}

interface ToggleFieldProps extends BaseProps {
  type: "toggle";
  checked: boolean;
  onChange: (checked: boolean) => void;
}

interface FileFieldProps extends BaseProps {
  type: "file";
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  accept?: string;
}

interface CustomFieldProps extends BaseProps {
  type: "custom";
  children: ReactNode;
}

type FormFieldProps =
  | TextFieldProps
  | TextareaFieldProps
  | SelectFieldProps
  | ToggleFieldProps
  | FileFieldProps
  | CustomFieldProps;

export default function FormField(props: FormFieldProps) {
  const { label, name, error, required, className = "", helpText } = props;

  const labelEl = (
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );

  const errorEl = error ? (
    <p className="mt-1 text-sm text-red-600">{error}</p>
  ) : null;

  const helpEl = helpText ? (
    <p className="mt-1 text-xs text-gray-400">{helpText}</p>
  ) : null;

  const inputClasses =
    "block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors";

  if (props.type === "toggle") {
    return (
      <div className={`flex items-center justify-between ${className}`}>
        <span className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={props.checked}
          onClick={() => props.onChange(!props.checked)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
            props.checked ? "bg-primary-600" : "bg-gray-200"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white transition-transform shadow ${
              props.checked ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    );
  }

  if (props.type === "custom") {
    return (
      <div className={className}>
        {labelEl}
        {props.children}
        {errorEl}
        {helpEl}
      </div>
    );
  }

  if (props.type === "textarea") {
    return (
      <div className={className}>
        {labelEl}
        <textarea
          id={name}
          name={name}
          value={props.value}
          onChange={props.onChange}
          placeholder={props.placeholder}
          rows={props.rows || 4}
          className={inputClasses}
        />
        {errorEl}
        {helpEl}
      </div>
    );
  }

  if (props.type === "select") {
    return (
      <div className={className}>
        {labelEl}
        <select
          id={name}
          name={name}
          value={props.value}
          onChange={props.onChange}
          className={inputClasses}
        >
          {props.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {errorEl}
        {helpEl}
      </div>
    );
  }

  if (props.type === "file") {
    return (
      <div className={className}>
        {labelEl}
        <input
          id={name}
          name={name}
          type="file"
          onChange={props.onChange}
          accept={props.accept}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
        />
        {errorEl}
        {helpEl}
      </div>
    );
  }

  return (
    <div className={className}>
      {labelEl}
      <input
        id={name}
        name={name}
        type={props.type}
        value={props.value}
        onChange={props.onChange}
        placeholder={props.placeholder}
        className={inputClasses}
      />
      {errorEl}
      {helpEl}
    </div>
  );
}
