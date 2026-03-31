import Link from "next/link";
import { SITE_NAME } from "@/lib/seo";

const POPULAR_CITIES = [
  { name: "Mumbai", slug: "mumbai" },
  { name: "Delhi", slug: "delhi" },
  { name: "Bangalore", slug: "bangalore" },
  { name: "Hyderabad", slug: "hyderabad" },
  { name: "Chennai", slug: "chennai" },
  { name: "Pune", slug: "pune" },
  { name: "Kolkata", slug: "kolkata" },
  { name: "Ahmedabad", slug: "ahmedabad" },
  { name: "Jaipur", slug: "jaipur" },
  { name: "Lucknow", slug: "lucknow" },
  { name: "Chandigarh", slug: "chandigarh" },
  { name: "Indore", slug: "indore" },
];

const POPULAR_CATEGORIES = [
  { name: "Home Cleaning", slug: "home-cleaning" },
  { name: "Electricians", slug: "electrical-services" },
  { name: "Plumbers", slug: "plumbing-services" },
  { name: "AC Repair", slug: "hvac-services" },
  { name: "Appliance Repair", slug: "appliance-repair" },
  { name: "Pest Control", slug: "pest-control" },
  { name: "Painting Services", slug: "painting-services" },
  { name: "Carpentry", slug: "carpentry-services" },
  { name: "Waterproofing", slug: "waterproofing" },
  { name: "CCTV & Security", slug: "cctv-security" },
  { name: "Solar Panel", slug: "solar-panel-services" },
  { name: "Fire Safety", slug: "fire-safety-services" },
];

const QUICK_LINKS = [
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "Join as Vendor", href: "/vendor/register" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Sitemap", href: "/sitemap.xml" },
];

const SEO_COMBOS = [
  { label: "Home Cleaning in Mumbai", href: "/services/home-cleaning/mumbai" },
  { label: "Plumbers in Delhi", href: "/services/plumbing-services/new-delhi" },
  { label: "Electricians in Bangalore", href: "/services/electrical-services/bangalore" },
  { label: "AC Repair in Hyderabad", href: "/services/hvac-services/hyderabad" },
  { label: "Painting in Pune", href: "/services/painting-services/pune" },
  { label: "Pest Control in Chennai", href: "/services/pest-control/chennai" },
  { label: "Plumbers in Kolkata", href: "/services/plumbing-services/kolkata" },
  { label: "Carpentry in Ahmedabad", href: "/services/carpentry-services/ahmedabad" },
  { label: "Electricians in Jaipur", href: "/services/electrical-services/jaipur" },
  { label: "AC Repair in Pune", href: "/services/hvac-services/pune" },
  { label: "Cleaning in Delhi", href: "/services/home-cleaning/new-delhi" },
  { label: "Plumbers in Mumbai", href: "/services/plumbing-services/mumbai" },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* CTA Bar */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-500">
        <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-white font-heading font-bold text-xl">
              Grow your business with ServiceHub
            </h3>
            <p className="text-emerald-100 text-sm mt-1">
              Register as a vendor, get bookings from thousands of customers, and earn ₹50K+ monthly
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/vendor/register"
              className="bg-white text-emerald-700 font-bold px-8 py-3 rounded-xl shadow-md hover:shadow-lg transition-all text-center hover:bg-emerald-50"
            >
              Join as Vendor — Free
            </Link>
            <Link
              href="/vendor/login"
              className="bg-emerald-700/50 text-white font-semibold px-6 py-3 rounded-xl border border-white/30 hover:bg-emerald-700/70 transition-all text-center backdrop-blur-sm"
            >
              Vendor Login
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-500 rounded-xl flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <span className="text-xl font-heading font-bold text-white">
                Service<span className="text-accent-400">Hub</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              India&apos;s largest directory for home and professional
              services. Find verified professionals near you.
            </p>

            {/* Social Icons */}
            <div className="flex gap-3">
              {["facebook", "twitter", "instagram", "linkedin"].map((social) => (
                <a
                  key={social}
                  href={`#${social}`}
                  className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-primary-500 flex items-center justify-center transition-colors"
                  aria-label={social}
                >
                  <svg className="w-4 h-4 text-gray-400 hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10z" />
                  </svg>
                </a>
              ))}
            </div>

            {/* App badges placeholder */}
            <div className="mt-6 flex gap-2">
              <div className="h-10 w-32 bg-gray-800 rounded-lg flex items-center justify-center">
                <span className="text-[10px] text-gray-500">App Store</span>
              </div>
              <div className="h-10 w-32 bg-gray-800 rounded-lg flex items-center justify-center">
                <span className="text-[10px] text-gray-500">Google Play</span>
              </div>
            </div>
          </div>

          {/* Popular Cities */}
          <div>
            <h3 className="text-white font-heading font-semibold mb-4 text-sm uppercase tracking-wider">
              Top Cities
            </h3>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
              {POPULAR_CITIES.map((city) => (
                <li key={city.slug}>
                  <Link
                    href={`/${city.slug}`}
                    className="text-sm text-gray-400 hover:text-accent-400 transition-colors"
                  >
                    {city.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Categories */}
          <div>
            <h3 className="text-white font-heading font-semibold mb-4 text-sm uppercase tracking-wider">
              Popular Services
            </h3>
            <ul className="space-y-2">
              {POPULAR_CATEGORIES.slice(0, 10).map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/services/${cat.slug}`}
                    className="text-sm text-gray-400 hover:text-accent-400 transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Top Searches SEO links */}
          <div>
            <h3 className="text-white font-heading font-semibold mb-4 text-sm uppercase tracking-wider">
              Top Searches
            </h3>
            <ul className="space-y-2">
              {SEO_COMBOS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-accent-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-heading font-semibold mb-4 text-sm uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-accent-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-6 p-4 rounded-xl bg-gray-800/50 border border-gray-700/50">
              <p className="text-xs text-gray-400 leading-relaxed">
                <span className="font-semibold text-gray-300">Need help?</span>
                <br />
                Call us at{" "}
                <a href="tel:1800XXXXXXX" className="text-accent-400 font-medium">
                  1800-XXX-XXXX
                </a>
                <br />
                Mon-Sat, 9AM - 7PM
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved. Made with care in India.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <Link href="/privacy" className="hover:text-gray-300 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-gray-300 transition-colors">
              Terms
            </Link>
            <Link href="/sitemap.xml" className="hover:text-gray-300 transition-colors">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
