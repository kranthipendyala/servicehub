"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SearchBar from "./SearchBar";
import { useLocation } from "@/lib/location";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Categories", href: "/#categories" },
  { label: "Cities", href: "/#cities" },
];

const POPULAR_CITIES = [
  { name: "Mumbai", slug: "mumbai" },
  { name: "Delhi", slug: "new-delhi" },
  { name: "Bangalore", slug: "bangalore" },
  { name: "Hyderabad", slug: "hyderabad" },
  { name: "Chennai", slug: "chennai" },
  { name: "Pune", slug: "pune" },
  { name: "Kolkata", slug: "kolkata" },
  { name: "Ahmedabad", slug: "ahmedabad" },
  { name: "Jaipur", slug: "jaipur" },
  { name: "Lucknow", slug: "lucknow" },
  { name: "Kochi", slug: "kochi" },
  { name: "Indore", slug: "indore" },
  { name: "Chandigarh", slug: "chandigarh" },
  { name: "Noida", slug: "noida" },
  { name: "Gurgaon", slug: "gurgaon" },
  { name: "Surat", slug: "surat" },
];

export default function Header() {
  const router = useRouter();
  const { location, loading: locationLoading, setCity, detectLocation } = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCityDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleCitySelect = (city: { name: string; slug: string }) => {
    setCity(city.name, city.slug);
    setCityDropdownOpen(false);
    router.push(`/${city.slug}`);
  };

  const handleDetectLocation = () => {
    detectLocation();
    setCityDropdownOpen(false);
  };

  const sourceIcon = {
    gps: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z",
    ip: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064",
    manual: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
    default: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z",
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-header border-b border-surface-200/50"
          : "bg-white border-b border-surface-200"
      }`}
    >
      {/* Top bar */}
      <div className="hidden lg:block bg-primary-500 text-white">
        <div className="container mx-auto px-4 flex items-center justify-between h-8 text-xs">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              1800-XXX-XXXX
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              support@mechanicalhub.in
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:text-accent-300 transition-colors">About</Link>
            <Link href="/contact" className="hover:text-accent-300 transition-colors">Contact</Link>
            <span className="text-primary-200">|</span>
            <Link href="/login" className="hover:text-accent-300 transition-colors">Login</Link>
            <Link href="/register" className="hover:text-accent-300 transition-colors">Register</Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 flex-shrink-0 group"
            aria-label="MechanicalHub Home"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-heading font-bold text-primary-500">
                Mechanical<span className="text-accent-500">Hub</span>
              </span>
              <span className="block text-[10px] text-gray-400 -mt-0.5 tracking-wide">
                India&apos;s #1 Service Directory
              </span>
            </div>
          </Link>

          {/* City Selector */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-primary-50 transition-colors text-sm border border-surface-200 hover:border-primary-200"
            >
              {/* Location pin icon */}
              <svg
                className={`w-4 h-4 flex-shrink-0 ${
                  location.source === "gps" ? "text-green-500" :
                  location.source === "ip" ? "text-blue-500" :
                  "text-gray-400"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sourceIcon[location.source]} />
                {(location.source === "gps" || location.source === "default") && (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                )}
              </svg>

              {locationLoading ? (
                <span className="text-gray-400 flex items-center gap-1">
                  <span className="w-3 h-3 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
                  Detecting...
                </span>
              ) : (
                <span className="font-medium text-gray-700 max-w-[100px] truncate">
                  {location.city}
                </span>
              )}

              <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${cityDropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* City Dropdown */}
            {cityDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-72 bg-white rounded-xl shadow-lg border border-surface-200 z-50 animate-slide-down overflow-hidden">
                {/* Detect Location Button */}
                <button
                  onClick={handleDetectLocation}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-primary-600 hover:bg-primary-50 transition-colors border-b border-surface-100 font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="flex flex-col items-start">
                    <span>Detect My Location</span>
                    <span className="text-[10px] text-gray-400 font-normal">Uses GPS / IP address</span>
                  </span>
                  {location.source === "gps" && (
                    <span className="ml-auto text-[10px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full font-medium">GPS</span>
                  )}
                  {location.source === "ip" && (
                    <span className="ml-auto text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-medium">IP</span>
                  )}
                </button>

                {/* Current Location */}
                {location.source !== "default" && (
                  <div className="px-4 py-2 bg-surface-50 border-b border-surface-100">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Current Location</p>
                    <p className="text-sm font-medium text-gray-800 flex items-center gap-1.5 mt-0.5">
                      <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {location.city}
                    </p>
                  </div>
                )}

                {/* Popular Cities */}
                <div className="px-4 pt-2 pb-1">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Popular Cities</p>
                </div>
                <div className="grid grid-cols-2 gap-0 max-h-64 overflow-y-auto">
                  {POPULAR_CITIES.map((city) => (
                    <button
                      key={city.slug}
                      onClick={() => handleCitySelect(city)}
                      className={`text-left px-4 py-2 text-sm hover:bg-primary-50 hover:text-primary-600 transition-colors ${
                        location.citySlug === city.slug
                          ? "text-primary-600 bg-primary-50 font-medium"
                          : "text-gray-600"
                      }`}
                    >
                      {city.name}
                    </button>
                  ))}
                </div>

                {/* Browse All Cities */}
                <Link
                  href="/#cities"
                  onClick={() => setCityDropdownOpen(false)}
                  className="block text-center py-2.5 text-xs font-medium text-primary-500 hover:bg-primary-50 border-t border-surface-100 transition-colors"
                >
                  Browse All 36+ Cities →
                </Link>
              </div>
            )}
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-4">
            <SearchBar variant="header" />
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary-500 rounded-lg hover:bg-primary-50 transition-all"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/list-business"
              className="ml-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-500 text-white text-sm font-bold hover:bg-accent-600 transition-all shadow-sm hover:shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              List Business
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-surface-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-3">
          <SearchBar variant="header" />
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-surface-200 animate-slide-down">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-700 hover:text-primary-500 hover:bg-primary-50 py-3 px-4 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-2 border-surface-200" />
            <Link
              href="/login"
              className="text-sm font-medium text-gray-700 hover:text-primary-500 py-3 px-4 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Login / Register
            </Link>
            <Link
              href="/list-business"
              className="mt-2 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-accent-500 text-white text-sm font-bold hover:bg-accent-600 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              List Your Business - Free
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
