import Link from "next/link";
import { SITE_NAME } from "@/lib/seo";

export default function Footer() {
  return (
    <footer className="bg-[#0c0c0c] relative overflow-hidden">
      {/* Top glow line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[1px] bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />
      {/* Corner glow */}
      <div className="absolute top-[-50%] right-[-10%] w-[300px] h-[300px] bg-primary-900/10 rounded-full blur-[100px]" />

      <div className="container mx-auto px-4 pt-8 pb-4">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-5 md:gap-6 pb-6 border-b border-white/[0.06]">
          {/* Brand — spans 4 cols */}
          <div className="col-span-2 md:col-span-4 lg:col-span-5">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
                <span className="text-white font-black text-sm">S</span>
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                Service<span className="text-primary-400">Hub</span>
              </span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs mb-6">
              Book trusted home service professionals. Verified, rated, transparent pricing.
            </p>
            {/* Social */}
            <div className="flex gap-2">
              {[
                { l: "X", d: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
                { l: "IG", d: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" },
                { l: "LI", d: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" },
              ].map((s) => (
                <a key={s.l} href="#" className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-primary-500/20 border border-white/[0.06] flex items-center justify-center transition-all" aria-label={s.l}>
                  <svg className="w-3.5 h-3.5 text-gray-600 hover:text-primary-400 transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d={s.d} /></svg>
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="md:col-span-2">
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-4">Services</h4>
            <ul className="space-y-2.5">
              {[
                ["Plumbing", "/services/plumbing-services"],
                ["Electrical", "/services/electrical-services"],
                ["AC Repair", "/services/hvac-services"],
                ["Cleaning", "/services/home-cleaning"],
              ].map(([name, href]) => (
                <li key={href}><Link href={href} className="text-[13px] text-gray-500 hover:text-primary-400 transition-colors">{name}</Link></li>
              ))}
              <li><Link href="/services" className="text-[13px] font-semibold text-primary-500 hover:text-primary-400 inline-flex items-center gap-1 transition-colors">All services <span className="text-xs">→</span></Link></li>
            </ul>
          </div>

          {/* Cities */}
          <div className="md:col-span-2">
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-4">Cities</h4>
            <ul className="space-y-2.5">
              {[
                ["Hyderabad", "/hyderabad"],
                ["Warangal", "/warangal"],
                ["Secunderabad", "/secunderabad"],
                ["Vijayawada", "/vijayawada"],
              ].map(([name, href]) => (
                <li key={href}><Link href={href} className="text-[13px] text-gray-500 hover:text-primary-400 transition-colors">{name}</Link></li>
              ))}
              <li><Link href="/" className="text-[13px] font-semibold text-primary-500 hover:text-primary-400 inline-flex items-center gap-1 transition-colors">More <span className="text-xs">→</span></Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="md:col-span-2 lg:col-span-3">
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-4">Company</h4>
            <ul className="space-y-2.5">
              {[
                ["About", "/about"],
                ["Contact", "/contact"],
                ["Join as Vendor", "/vendor/register"],
                ["Privacy", "/privacy"],
                ["Terms", "/terms"],
              ].map(([name, href]) => (
                <li key={href}><Link href={href} className="text-[13px] text-gray-500 hover:text-primary-400 transition-colors">{name}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-gray-600">&copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px] text-gray-600">
            <Link href="/privacy" className="hover:text-gray-400 transition-colors">Privacy</Link>
            <span className="text-gray-800">·</span>
            <Link href="/terms" className="hover:text-gray-400 transition-colors">Terms</Link>
            <span className="text-gray-800">·</span>
            <Link href="/sitemap.xml" className="hover:text-gray-400 transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
