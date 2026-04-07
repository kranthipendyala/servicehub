import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: `Terms of Service | ${SITE_NAME}`,
  description: `Terms and conditions for using ${SITE_NAME} platform.`,
};

export default function TermsPage() {
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
            <span className="text-white/80 font-medium">Terms of Service</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-heading font-bold tracking-tight">Terms of Service</h1>
          <p className="mt-3 text-white/70 max-w-2xl">Last updated: April 2026</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-card p-8 md:p-10 shadow-sm border border-gray-100">
          <div className="prose prose-sm md:prose-base max-w-none">
            <p className="text-gray-600 leading-relaxed">
              Welcome to {SITE_NAME}. By accessing or using our platform, you agree to be bound by these
              Terms of Service. Please read them carefully.
            </p>

            <h2 className="text-xl md:text-2xl font-heading font-bold text-primary-800 mt-8 mb-3">1. Acceptance of Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              By creating an account or using {SITE_NAME}, you confirm that you are at least 18 years old
              and agree to comply with these terms and all applicable laws.
            </p>

            <h2 className="text-xl md:text-2xl font-heading font-bold text-primary-800 mt-8 mb-3">2. Service Description</h2>
            <p className="text-gray-600 leading-relaxed">
              {SITE_NAME} is an online marketplace that connects customers with independent service
              providers. We facilitate bookings and payments but are not the actual service provider.
              Service providers are independent contractors responsible for the quality and execution
              of their services.
            </p>

            <h2 className="text-xl md:text-2xl font-heading font-bold text-primary-800 mt-8 mb-3">3. User Accounts</h2>
            <ul className="text-gray-600 space-y-2 list-disc pl-5">
              <li>You must provide accurate and complete information when creating an account</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials</li>
              <li>You are responsible for all activities that occur under your account</li>
              <li>You must notify us immediately of any unauthorized use of your account</li>
            </ul>

            <h2 className="text-xl md:text-2xl font-heading font-bold text-primary-800 mt-8 mb-3">4. Bookings and Payments</h2>
            <p className="text-gray-600 leading-relaxed">
              When you book a service, you agree to pay the listed price plus any applicable fees and
              taxes. Payments are processed securely through our payment partners. Refunds are subject
              to our cancellation policy.
            </p>

            <h2 className="text-xl md:text-2xl font-heading font-bold text-primary-800 mt-8 mb-3">5. Cancellation Policy</h2>
            <ul className="text-gray-600 space-y-2 list-disc pl-5">
              <li>Free cancellation up to 2 hours before the scheduled service time</li>
              <li>Cancellations within 2 hours may incur a partial cancellation fee</li>
              <li>No-shows will be charged the full service amount</li>
            </ul>

            <h2 className="text-xl md:text-2xl font-heading font-bold text-primary-800 mt-8 mb-3">6. Service Provider Responsibilities</h2>
            <p className="text-gray-600 leading-relaxed">
              Service providers must hold valid licenses where required, deliver services with reasonable
              care and skill, and maintain professional conduct at all times. {SITE_NAME} verifies
              providers but is not liable for the quality of work performed.
            </p>

            <h2 className="text-xl md:text-2xl font-heading font-bold text-primary-800 mt-8 mb-3">7. Prohibited Conduct</h2>
            <p className="text-gray-600 leading-relaxed">You agree not to:</p>
            <ul className="text-gray-600 space-y-2 list-disc pl-5">
              <li>Use the platform for any illegal or unauthorized purpose</li>
              <li>Attempt to circumvent our payment system or contact providers off-platform</li>
              <li>Post false reviews or misleading information</li>
              <li>Harass, threaten, or harm other users or service providers</li>
            </ul>

            <h2 className="text-xl md:text-2xl font-heading font-bold text-primary-800 mt-8 mb-3">8. Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed">
              {SITE_NAME} is provided &ldquo;as is&rdquo; without warranties of any kind. We are not liable
              for any indirect, incidental, or consequential damages arising from your use of our platform
              or services obtained through it.
            </p>

            <h2 className="text-xl md:text-2xl font-heading font-bold text-primary-800 mt-8 mb-3">9. Changes to Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              We may modify these terms at any time. Continued use of the platform after changes
              constitutes acceptance of the modified terms.
            </p>

            <h2 className="text-xl md:text-2xl font-heading font-bold text-primary-800 mt-8 mb-3">10. Contact</h2>
            <p className="text-gray-600 leading-relaxed">
              For questions about these Terms, contact us at{" "}
              <a href="mailto:support@servicehub.com" className="text-primary-600 font-bold hover:text-primary-800">support@servicehub.com</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
