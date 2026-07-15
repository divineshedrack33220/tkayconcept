import { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | TK Concepts",
  description: "How TK Concepts collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="section-padding container-custom max-w-3xl">
      <nav className="mb-8 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-accent">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-gray-900">Privacy Policy</span>
      </nav>
      <h1 className="heading-primary mb-6">Privacy Policy</h1>
      <p className="mb-6 text-sm text-gray-400">Last updated: July 2026</p>
      <div className="prose prose-gray max-w-none space-y-6 text-gray-600">
        <section>
          <h2 className="text-xl font-semibold text-primary">Information We Collect</h2>
          <p>We collect information you provide directly, including:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Name, email address, and shipping information</li>
            <li>Payment information (processed securely via Stripe)</li>
            <li>Account credentials (via Clerk authentication)</li>
            <li>Communications you send to us (support, reviews, etc.)</li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-primary">How We Use Your Information</h2>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>To process and fulfill your orders</li>
            <li>To communicate about your orders, products, and services</li>
            <li>To improve our website and products</li>
            <li>To send marketing communications (with your consent)</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-primary">Information Sharing</h2>
          <p>We do not sell your personal information. We may share your information with:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Payment processors (Stripe) to complete transactions</li>
            <li>Shipping carriers to deliver your orders</li>
            <li>Service providers who assist in operating our website</li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-primary">Data Security</h2>
          <p>We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-primary">Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal information. Contact us at <a href="mailto:info@tkconcepts.co.uk" className="text-accent hover:underline">info@tkconcepts.co.uk</a> to exercise these rights.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-primary">Cookies</h2>
          <p>We use cookies to maintain your session and improve your experience. You can control cookie settings in your browser.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-primary">Contact</h2>
          <p>For privacy-related inquiries, contact us at <a href="mailto:info@tkconcepts.co.uk" className="text-accent hover:underline">info@tkconcepts.co.uk</a>.</p>
        </section>
      </div>
    </div>
  );
}
