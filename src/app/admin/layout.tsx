"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getAdminToken, getAdminUser } from "@/lib/admin-api";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { ToastProvider } from "@/components/admin/Toast";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setReady(true);
      return;
    }

    const token = getAdminToken();
    const user = getAdminUser();

    if (!token || !user || !["admin", "super_admin"].includes(user.role)) {
      router.replace("/admin/login");
      return;
    }

    setReady(true);
  }, [pathname, isLoginPage, router]);

  // Detect sidebar collapsed state from DOM for margin adjustments
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const sidebar = document.querySelector("aside");
      if (sidebar) {
        setSidebarCollapsed(sidebar.classList.contains("w-[68px]"));
      }
    });

    const sidebar = document.querySelector("aside");
    if (sidebar) {
      observer.observe(sidebar, { attributes: true, attributeFilter: ["class"] });
      setSidebarCollapsed(sidebar.classList.contains("w-[68px]"));
    }

    return () => observer.disconnect();
  });

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (isLoginPage) {
    return (
      <ToastProvider>
        <div className="min-h-screen bg-gray-100">{children}</div>
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-100">
        <AdminSidebar />
        <div
          className={`transition-all duration-300 ${
            sidebarCollapsed ? "ml-[68px]" : "ml-64"
          }`}
        >
          {/* Top bar */}
          <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
            <div>
              <h1 className="text-lg font-semibold text-gray-900 capitalize">
                {pathname
                  .replace("/admin/", "")
                  .replace("/", " / ")
                  .replace(/-/g, " ") || "Dashboard"}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-500 hover:text-primary-600 transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
                View Site
              </a>
              <div className="h-6 w-px bg-gray-200" />
              <div className="text-sm text-gray-600">
                {getAdminUser()?.name || "Admin"}
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="p-6">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
