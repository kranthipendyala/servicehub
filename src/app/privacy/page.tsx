import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: `Privacy Policy | ${SITE_NAME}`,
  description: `Learn how ${SITE_NAME} collects, uses, and protects your personal information.`,
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-accent-200">
      {/* Hero */}
      <section className="bg-primary-800 text-white relative overflow-hidden">
        <div className="absolute top-[-30%] right-[-10%] w-[400px] h-[400px] rounded-full bg-white/[0.03]" />
        <div className="container mx-auto px-4 py-12 md:py-14 relative">
          <nav className="flex items-center gap-2 text-sm text-white/50 mb-5">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white/80 font-medium">Privacy Policy</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-heading font-bold tracking-tight">Privacy Policy</h1>
          <p className="mt-3 text-white/70 max-w-2xl">Last updated: April 2026</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-card p-8 md:p-10 shadow-sm border border-gray-100">
          <div className="prose prose-sm md:prose-base max-w-none">
            <p className="text-gray-600 leading-relaxed">
              At {SITE_NAME}, we take your privacy seriously. This Privacy Policy explains how we collect,
              use, and protect your personal information when you use our platform.
            </p>

            <h2 className="text-xl md:text-2xl font-heading font-bold text-primary-800 mt-8 mb-3">1. Information We Collect</h2>
            <p className="text-gray-600 leading-relaxed">
              We collect information you provide directly when you create an account, book a service, or
              contact us. This includes your name, email address, phone number, service address, and
              payment information.
            </p>

            <h2 className="text-xl md:text-2xl font-heading font-bold text-primary-800 mt-8 mb-3">2. How We Use Your Information</h2>
            <ul className="text-gray-600 space-y-2 list-disc pl-5">
              <li>To process and fulfill your service bookings</li>
              <li>To communicate with you about your bookings and account</li>
              <li>To match you with verified service providers</li>
              <li>To improve our platform and services</li>
              <li>To send you important updates and promotional offers (with your consent)</li>
            </ul>

            <h2 className="text-xl md:text-2xl font-heading font-bold text-primary-800 mt-8 mb-3">3. Information Sharing</h2>
            <p className="text-gray-600 leading-relaxed">
              We share your contact details and service address with the service provider you book.
              We do not sell your personal information to third parties. We may share information with
              law enforcement when required by law.
            </p>

            <h2 className="text-xl md:text-2xl font-heading font-bold text-primary-800 mt-8 mb-3">4. Data Security</h2>
            <p className="text-gray-600 leading-relaxed">
              We use industry-standard encryption and security measures to protect your data. All payment
              information is processed through PCI-compliant payment gateways. We regularly review and
              update our security practices.
            </p>

            <h2 className="text-xl md:text-2xl font-heading font-bold text-primary-800 mt-8 mb-3">5. Cookies</h2>
            <p className="text-gray-600 leading-relaxed">
              We use cookies and similar tracking technologies to remember your preferences, analyze site
              usage, and improve our services. You can control cookies through your browser settings.
            </p>

            <h2 className="text-xl md:text-2xl font-heading font-bold text-primary-800 mt-8 mb-3">6. Your Rights</h2>
            <p className="text-gray-600 leading-relaxed">
              You have the right to access, update, or delete your personal information at any time.
              Contact us at <a href="mailto:support@servicehub.com" className="text-primary-600 font-bold hover:text-primary-800">support@servicehub.com</a> to
              exercise these rights.
            </p>

            <h2 className="text-xl md:text-2xl font-heading font-bold text-primary-800 mt-8 mb-3">7. Changes to This Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of significant
              changes via email or a prominent notice on our platform.
            </p>

            <h2 className="text-xl md:text-2xl font-heading font-bold text-primary-800 mt-8 mb-3">8. Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:support@servicehub.com" className="text-primary-600 font-bold hover:text-primary-800">support@servicehub.com</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
