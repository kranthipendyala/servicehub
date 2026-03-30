"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import { LocationProvider } from "@/lib/location";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { PlatformProvider } from "@/components/platform/PlatformProvider";

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Admin and Vendor portals have their own layouts — no header/footer
  const isAdmin = pathname.startsWith("/admin");
  const isVendor = pathname.startsWith("/vendor");

  if (isAdmin || isVendor) {
    return <>{children}</>;
  }

  return (
    <PlatformProvider>
      <AuthProvider>
        <LocationProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </LocationProvider>
      </AuthProvider>
    </PlatformProvider>
  );
}
