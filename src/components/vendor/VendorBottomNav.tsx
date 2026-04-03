"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    label: "Home",
    href: "/vendor/dashboard",
    icon: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z",
    match: (p: string) => p === "/vendor/dashboard",
  },
  {
    label: "Bookings",
    href: "/vendor/bookings",
    icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5",
    match: (p: string) => p.startsWith("/vendor/bookings"),
  },
  {
    label: "Services",
    href: "/vendor/services",
    icon: "M11.42 15.17l-5.384-3.08A.5.5 0 005.5 12.5v0a.5.5 0 00.536.49l6.293-.54m-.93 2.72l2.08 3.6a.5.5 0 00.836.06l3.327-4.272a.5.5 0 00-.188-.752l-5.126-2.636m-2.929 4l5.08-7.08a.5.5 0 01.768-.077l2.077 1.927a.5.5 0 01.03.745L13.42 15.17a.5.5 0 01-.698.063l-1.302-1.063z",
    match: (p: string) => p.startsWith("/vendor/services"),
    accent: true,
  },
  {
    label: "Leads",
    href: "/vendor/leads",
    icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
    match: (p: string) => p === "/vendor/leads",
  },
  {
    label: "More",
    href: "/vendor/earnings",
    icon: "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5",
    match: (p: string) => p.startsWith("/vendor/earnings") || p.startsWith("/vendor/subscription") || p.startsWith("/vendor/bank") || p.startsWith("/vendor/documents") || p.startsWith("/vendor/reviews") || p.startsWith("/vendor/payouts"),
  },
];

export default function VendorBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
      <div className="flex items-center justify-around h-16 px-1">
        {NAV_ITEMS.map((item) => {
          const isActive = item.match(pathname);

          if (item.accent) {
            return (
              <Link key={item.label} href={item.href} className="flex flex-col items-center justify-center -mt-5">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg ${isActive ? "bg-primary-600 shadow-primary-500/30" : "bg-gradient-to-br from-primary-500 to-primary-600 shadow-primary-500/30"}`}>
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                </div>
                <span className="text-[10px] font-semibold text-primary-600 mt-1">{item.label}</span>
              </Link>
            );
          }

          return (
            <Link key={item.label} href={item.href} className="flex flex-col items-center justify-center flex-1 py-2">
              <svg className={`w-6 h-6 ${isActive ? "text-primary-600" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive ? 2.5 : 1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              <span className={`text-[10px] mt-0.5 ${isActive ? "font-bold text-primary-600" : "font-medium text-gray-400"}`}>{item.label}</span>
              {isActive && <div className="w-1 h-1 rounded-full bg-primary-600 mt-0.5" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
