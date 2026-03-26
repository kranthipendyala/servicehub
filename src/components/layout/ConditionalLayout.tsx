"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import { LocationProvider } from "@/lib/location";

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <LocationProvider>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </LocationProvider>
  );
}
