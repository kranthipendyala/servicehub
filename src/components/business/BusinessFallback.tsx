"use client";

import dynamic from "next/dynamic";

const ClientBusinessPage = dynamic(
  () => import("@/components/business/ClientBusinessPage"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    ),
  }
);

export default function BusinessFallback() {
  return <ClientBusinessPage />;
}
