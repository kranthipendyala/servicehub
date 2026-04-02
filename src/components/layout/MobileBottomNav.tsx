"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

const NAV_ITEMS = [
  {
    label: "Home",
    href: "/",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    iconFilled: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    match: (p: string) => p === "/",
  },
  {
    label: "Search",
    href: "/search",
    icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
    iconFilled: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
    match: (p: string) => p === "/search" || p.startsWith("/services"),
  },
  {
    label: "Book",
    href: "/services/home-cleaning",
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    iconFilled: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    match: (p: string) => p.startsWith("/book"),
    accent: true,
  },
  {
    label: "Orders",
    href: "/my-bookings",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
    iconFilled: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
    match: (p: string) => p.startsWith("/my-bookings"),
    requireAuth: true,
  },
  {
    label: "Profile",
    href: "/login",
    icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
    iconFilled: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
    match: (p: string) => p === "/login" || p === "/notifications" || p === "/my-addresses",
    authHref: "/notifications",
  },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Don't show on vendor, admin, or booking confirmation pages
  if (pathname.startsWith("/vendor") || pathname.startsWith("/admin") || pathname.startsWith("/book/confirmation")) {
    return null;
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-1">
        {NAV_ITEMS.map((item) => {
          const isActive = item.match(pathname);
          const href = item.authHref && user ? item.authHref : (item.requireAuth && !user ? "/login" : item.href);

          if (item.accent) {
            return (
              <Link
                key={item.label}
                href={href}
                className="flex flex-col items-center justify-center -mt-5"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center shadow-lg shadow-accent-500/30">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                </div>
                <span className="text-[10px] font-semibold text-accent-600 mt-1">{item.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.label}
              href={href}
              className="flex flex-col items-center justify-center flex-1 py-2 transition-colors"
            >
              <svg
                className={`w-6 h-6 ${isActive ? "text-primary-600" : "text-gray-400"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={isActive ? 2.5 : 1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={isActive ? item.iconFilled : item.icon} />
              </svg>
              <span className={`text-[10px] mt-0.5 ${isActive ? "font-bold text-primary-600" : "font-medium text-gray-400"}`}>
                {item.label === "Profile" && user ? user.name.split(" ")[0] : item.label}
              </span>
              {isActive && <div className="w-1 h-1 rounded-full bg-primary-600 mt-0.5" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
