import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: `Contact Us | ${SITE_NAME}`,
  description: `Get in touch with ${SITE_NAME}. Email, phone, and support options for customers and service providers.`,
};

export default function ContactPage() {
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
            <span className="text-white/80 font-medium">Contact</span>
          </nav>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold tracking-tight">
            Contact Us
          </h1>
          <p className="mt-3 text-white/70 max-w-2xl text-lg leading-relaxed">
            We&apos;re here to help. Reach out for support, partnerships, or general questions.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 md:py-16 max-w-5xl">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Email card */}
          <div className="bg-white rounded-card p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-primary-50 border border-primary-100 rounded-2xl flex items-center justify-center text-primary-600 mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-heading font-bold text-primary-800 mb-2">Email Us</h3>
            <p className="text-gray-600 text-sm mb-3">For general inquiries and support</p>
            <a href="mailto:support@servicehub.com" className="text-primary-600 font-bold text-sm hover:text-primary-800 transition-colors">
              support@servicehub.com
            </a>
          </div>

          {/* Phone card */}
          <div className="bg-white rounded-card p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-primary-50 border border-primary-100 rounded-2xl flex items-center justify-center text-primary-600 mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h3 className="text-lg font-heading font-bold text-primary-800 mb-2">Call Us</h3>
            <p className="text-gray-600 text-sm mb-3">Mon - Sat, 9 AM to 7 PM</p>
            <a href="tel:+919999999999" className="text-primary-600 font-bold text-sm hover:text-primary-800 transition-colors">
              +91 9999 999 999
            </a>
          </div>

          {/* Address card */}
          <div className="bg-white rounded-card p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-primary-50 border border-primary-100 rounded-2xl flex items-center justify-center text-primary-600 mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-heading font-bold text-primary-800 mb-2">Visit Us</h3>
            <p className="text-gray-600 text-sm mb-3">Our office address</p>
            <p className="text-primary-700 font-medium text-sm">
              Hyderabad, Telangana<br />India
            </p>
          </div>
        </div>

        {/* Contact form */}
        <div className="mt-8 bg-white rounded-card p-8 md:p-10 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-heading font-bold text-primary-800 mb-2">Send us a message</h2>
          <p className="text-gray-600 mb-6">We&apos;ll get back to you within 24 hours.</p>

          <form className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-primary-800 mb-2">Your Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 bg-gray-50 text-gray-800"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-primary-800 mb-2">Email Address</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 bg-gray-50 text-gray-800"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-primary-800 mb-2">Subject</label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 bg-gray-50 text-gray-800"
                placeholder="How can we help?"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-primary-800 mb-2">Message</label>
              <textarea
                rows={5}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 bg-gray-50 text-gray-800 resize-none"
                placeholder="Tell us more..."
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-primary-600 text-white font-bold text-sm hover:bg-primary-800 transition-colors"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
