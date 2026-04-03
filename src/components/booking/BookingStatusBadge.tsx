"use client";

import type { BookingStatus } from "@/types";

const statusConfig: Record<
  BookingStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  pending:     { label: "Pending",     bg: "bg-amber-50 border-amber-200/60",  text: "text-amber-700", dot: "bg-amber-400" },
  confirmed:   { label: "Confirmed",   bg: "bg-blue-50 border-blue-200/60",    text: "text-blue-700", dot: "bg-blue-400" },
  assigned:    { label: "Assigned",    bg: "bg-cyan-50 border-cyan-200/60",    text: "text-cyan-700", dot: "bg-cyan-400" },
  in_progress: { label: "In Progress", bg: "bg-indigo-50 border-indigo-200/60",text: "text-indigo-700", dot: "bg-indigo-400" },
  completed:   { label: "Completed",   bg: "bg-primary-50 border-primary-200/60", text: "text-primary-700", dot: "bg-primary-400" },
  cancelled:   { label: "Cancelled",   bg: "bg-red-50 border-red-200/60",     text: "text-red-700", dot: "bg-red-400" },
  refunded:    { label: "Refunded",    bg: "bg-gray-50 border-gray-200/60",   text: "text-gray-600", dot: "bg-gray-400" },
};

interface Props {
  status: BookingStatus;
  className?: string;
}

export default function BookingStatusBadge({ status, className = "" }: Props) {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-btn px-3 py-1 text-xs font-heading font-medium border ${config.bg} ${config.text} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
