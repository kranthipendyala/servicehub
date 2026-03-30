"use client";

import type { BookingStatus } from "@/types";

const statusConfig: Record<
  BookingStatus,
  { label: string; bg: string; text: string }
> = {
  pending:     { label: "Pending",     bg: "bg-yellow-100",  text: "text-yellow-800" },
  confirmed:   { label: "Confirmed",   bg: "bg-blue-100",    text: "text-blue-800" },
  assigned:    { label: "Assigned",    bg: "bg-cyan-100",    text: "text-cyan-800" },
  in_progress: { label: "In Progress", bg: "bg-indigo-100",  text: "text-indigo-800" },
  completed:   { label: "Completed",   bg: "bg-green-100",   text: "text-green-800" },
  cancelled:   { label: "Cancelled",   bg: "bg-red-100",     text: "text-red-800" },
  refunded:    { label: "Refunded",    bg: "bg-gray-100",    text: "text-gray-800" },
};

interface Props {
  status: BookingStatus;
  className?: string;
}

export default function BookingStatusBadge({ status, className = "" }: Props) {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.bg} ${config.text} ${className}`}
    >
      {config.label}
    </span>
  );
}
