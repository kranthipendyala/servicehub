"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { getVendorToken, getVendorUser, vendorLogout } from "@/lib/vendor-api";
import { ToastProvider } from "@/components/admin/Toast";
import LogoutModal from "@/components/common/LogoutModal";
import { PlatformProvider } from "@/components/platform/PlatformProvider";

/* ------------------------------------------------------------------ */
/*  Sidebar context — shared collapse state                            */
/* ------------------------------------------------------------------ */

const SidebarCtx = createContext({ collapsed: false, toggle: () => {} });

/* ------------------------------------------------------------------ */
/*  Nav items                                                          */
/* ------------------------------------------------------------------ */

const NAV_ITEMS = [
  { label: "Dashboard", href: "/vendor/dashboard", icon: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" },
  { label: "Bookings", href: "/vendor/bookings", icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" },
  { label: "Services", href: "/vendor/services", icon: "M11.42 15.17l-5.384-3.08A.5.5 0 005.5 12.5v0a.5.5 0 00.536.49l6.293-.54m-.93 2.72l2.08 3.6a.5.5 0 00.836.06l3.327-4.272a.5.5 0 00-.188-.752l-5.126-2.636m-2.929 4l5.08-7.08a.5.5 0 01.768-.077l2.077 1.927a.5.5 0 01.03.745L13.42 15.17a.5.5 0 01-.698.063l-1.302-1.063z" },
  { label: "Earnings", href: "/vendor/earnings", icon: "M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" },
  { label: "Reviews", href: "/vendor/reviews", icon: "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" },
  { label: "Subscription", href: "/vendor/subscription", icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" },
  { label: "Bank Details", href: "/vendor/bank-details", icon: "M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" },
  { label: "Documents", href: "/vendor/documents", icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" },
];

/* ------------------------------------------------------------------ */
/*  Sidebar Component                                                  */
/* ------------------------------------------------------------------ */

function VendorSidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useContext(SidebarCtx);
  const user = getVendorUser();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setLoggingOut(true);
    await vendorLogout();
    window.location.href = "/vendor/login";
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-gradient-to-b from-[#003366] to-[#002244] text-white transition-all duration-300 ${
        collapsed ? "w-[72px]" : "w-64"
      }`}
    >
      {/* Logo header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
        {!collapsed && (
          <Link href="/vendor/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-emerald-600/20">
              V
            </div>
            <div>
              <span className="font-bold text-base tracking-tight">VendorHub</span>
              <span className="block text-[10px] text-emerald-300/80 -mt-0.5">Home Services</span>
            </div>
          </Link>
        )}
        {collapsed && (
          <div className="mx-auto">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
              V
            </div>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggle}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors z-50"
      >
        <svg className={`w-3 h-3 text-gray-600 transition-transform ${collapsed ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-white/15 text-white shadow-sm backdrop-blur-sm"
                  : "text-blue-100/70 hover:bg-white/10 hover:text-white"
              } ${collapsed ? "justify-center px-2" : ""}`}
              title={collapsed ? item.label : undefined}
            >
              <div className={`flex-shrink-0 ${isActive ? "text-emerald-400" : ""}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
              </div>
              {!collapsed && <span>{item.label}</span>}
              {isActive && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-white/10 p-3">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-sm font-bold shadow-sm">
              {user?.name?.charAt(0)?.toUpperCase() || "V"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name || "Vendor"}</p>
              <p className="text-xs text-blue-200/60 truncate">{user?.email || ""}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-white/10 text-blue-200/60 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="w-full flex justify-center p-2 rounded-lg hover:bg-white/10 text-blue-200/60 hover:text-red-400 transition-colors"
            title="Logout"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
          </button>
        )}
      </div>
      <LogoutModal
        open={showLogoutModal}
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutModal(false)}
        loading={loggingOut}
      />
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/*  Layout                                                             */
/* ------------------------------------------------------------------ */

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [approved, setApproved] = useState<boolean | null>(null);

  const isLoginPage = pathname === "/vendor/login";
  const isRegisterPage = pathname === "/vendor/register";
  const isOnboardingPage = pathname.startsWith("/vendor/onboarding");
  const isStandalonePage = isLoginPage || isRegisterPage || isOnboardingPage;

  // Auth check
  useEffect(() => {
    if (isLoginPage || isRegisterPage) {
      setReady(true);
      return;
    }

    const token = getVendorToken();
    const u = getVendorUser();

    if (!token || !u || !["vendor", "business_owner"].includes(u.role)) {
      router.replace("/vendor/login");
      return;
    }

    if (!isOnboardingPage && u && (u as Record<string, unknown>).onboarding_completed === false) {
      router.replace("/vendor/onboarding");
      return;
    }

    setReady(true);
  }, [pathname, isLoginPage, isRegisterPage, isOnboardingPage, router]);

  // Approval check — runs after ready
  useEffect(() => {
    if (!ready || isStandalonePage) return;
    const checkApproval = async () => {
      try {
        const token = getVendorToken();
        const res = await fetch("/proxy-api/vendor/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Auth-Token": token || "",
            Accept: "application/json",
          },
        });
        const json = await res.json();
        if (json.status && json.data) {
          setApproved(json.data.is_approved === true);
        } else {
          setApproved(false);
        }
      } catch {
        setApproved(false);
      }
    };
    checkApproval();
  }, [ready, isStandalonePage]);

  const user = getVendorUser();
  const showSidebar = ready && !isStandalonePage && approved === true;

  // Single return — no conditional returns to break hooks
  return (
    <PlatformProvider>
    <ToastProvider>
      <SidebarCtx.Provider value={{ collapsed, toggle: () => setCollapsed((c) => !c) }}>

        {/* Loading spinner */}
        {!ready && (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-400">Loading vendor portal...</p>
            </div>
          </div>
        )}

        {/* Standalone pages (login, register, onboarding) */}
        {ready && isStandalonePage && (
          <div className="min-h-screen">{children}</div>
        )}

        {/* Checking approval */}
        {ready && !isStandalonePage && approved === null && (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* NOT approved — no sidebar */}
        {ready && !isStandalonePage && approved === false && (
          <div className="min-h-screen bg-gray-50">
            <main>{children}</main>
          </div>
        )}

        {/* APPROVED — full layout with sidebar */}
        {showSidebar && (
        <div className="min-h-screen bg-gray-50">
          {/* Sidebar — hidden on mobile, visible on md+ */}
          <div className="hidden md:block">
            <VendorSidebar />
          </div>

          {/* Mobile sidebar overlay */}
          {mobileMenuOpen && (
            <div className="md:hidden fixed inset-0 z-50">
              <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
              <div className="relative w-64">
                <VendorSidebar />
              </div>
            </div>
          )}

          {/* Main content — no margin on mobile, sidebar margin on md+ */}
          <div className={`transition-all duration-300 md:${collapsed ? "ml-[72px]" : "ml-64"}`} style={{ marginLeft: typeof window !== "undefined" && window.innerWidth >= 768 ? (collapsed ? 72 : 256) : 0 }}>
            {/* Top header bar */}
            <header className="sticky top-0 z-30 h-14 md:h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6">
              <div className="flex items-center gap-3">
                {/* Mobile hamburger */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                {/* Mobile logo */}
                <div className="md:hidden flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-xs">V</div>
                  <span className="font-bold text-sm text-gray-800">VendorHub</span>
                </div>
                {/* Desktop page title */}
                <h1 className="hidden md:block text-lg font-semibold text-gray-800 capitalize">
                  {pathname.replace("/vendor/", "").replace("/", " / ").replace(/-/g, " ") || "Dashboard"}
                </h1>
              </div>
              <div className="flex items-center gap-2 md:gap-4">
                <Link
                  href="/vendor/subscription"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full hover:bg-emerald-100 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                  Upgrade
                </Link>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || "V"}
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden sm:inline">{user?.name || "Vendor"}</span>
                </div>
              </div>
            </header>

            {/* Page content — less padding on mobile */}
            <main className="p-3 md:p-6">{children}</main>
          </div>
        </div>
        )}

      </SidebarCtx.Provider>
    </ToastProvider>
    </PlatformProvider>
  );
}
