import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: `About Us | ${SITE_NAME}`,
  description: `Learn about ${SITE_NAME} — your trusted platform for booking verified home service professionals across India. Our mission, values, and the team behind it all.`,
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-accent-200">
      {/* Hero */}
      <section className="bg-primary-800 text-white relative overflow-hidden">
        <div className="absolute top-[-30%] right-[-10%] w-[400px] h-[400px] rounded-full bg-white/[0.03]" />
        <div className="absolute bottom-[-40%] left-[-5%] w-[300px] h-[300px] rounded-full bg-white/[0.02]" />

        <div className="container mx-auto px-4 py-12 md:py-16 relative">
          <nav className="flex items-center gap-2 text-sm text-white/50 mb-5">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white/80 font-medium">About</span>
          </nav>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold tracking-tight">
            About {SITE_NAME}
          </h1>
          <p className="mt-3 text-white/70 max-w-2xl text-lg leading-relaxed">
            Your trusted partner for booking verified home and professional services across India.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
        {/* Mission */}
        <div className="bg-white rounded-card p-8 md:p-10 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-primary-800 mb-4">Our Mission</h2>
          <p className="text-gray-600 leading-relaxed text-lg">
            We&apos;re building India&apos;s most trusted home services platform — connecting customers with verified
            professionals for every household need. From plumbing emergencies to deep cleaning, AC repair to
            painting, we make it simple to find, book, and pay for quality services.
          </p>
        </div>

        {/* Values grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {[
            { title: "Verified Professionals", desc: "Every service provider is background-checked and identity-verified before joining.", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
            { title: "Transparent Pricing", desc: "No hidden charges. See exact prices upfront before you book any service.", icon: "M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
            { title: "Instant Booking", desc: "Book a professional in minutes. Pick your slot, pay, done — no phone tag.", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
            { title: "Quality Guarantee", desc: "Not satisfied? We&apos;ll make it right. Every booking is backed by our service guarantee.", icon: "M5 13l4 4L19 7" },
          ].map((v) => (
            <div key={v.title} className="bg-white rounded-card p-6 shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-primary-50 border border-primary-100 rounded-2xl flex items-center justify-center text-primary-600 mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={v.icon} />
                </svg>
              </div>
              <h3 className="text-lg font-heading font-bold text-primary-800 mb-2">{v.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-primary-50 border border-primary-100 rounded-card p-8 text-center">
          <h3 className="text-xl font-heading font-bold text-primary-800 mb-2">
            Ready to get started?
          </h3>
          <p className="text-gray-600 mb-5">Join thousands of customers who trust us for their home service needs.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-bold hover:bg-primary-800 transition-colors"
            >
              Browse Services
            </Link>
            <Link
              href="/vendor/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-primary-200 text-primary-700 text-sm font-bold hover:bg-primary-50 transition-colors"
            >
              Become a Provider
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
