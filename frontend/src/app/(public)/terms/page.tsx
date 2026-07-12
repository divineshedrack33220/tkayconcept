import { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | TKAYKONCEPTS",
  description: "Terms and conditions governing use of the TKAYKONCEPTS website and services.",
};

export default function TermsPage() {
  return (
    <div className="section-padding container-custom max-w-3xl">
      <nav className="mb-8 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-accent">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-gray-900">Terms of Service</span>
      </nav>
      <h1 className="heading-primary mb-6">Terms of Service</h1>
      <p className="mb-6 text-sm text-gray-400">Last updated: July 2026</p>
      <div className="prose prose-gray max-w-none space-y-6 text-gray-600">
        <section>
          <h2 className="text-xl font-semibold text-primary">Acceptance of Terms</h2>
          <p>By accessing or using the TKAYKONCEPTS website and services, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-primary">Products and Services</h2>
          <p>We strive to display our products as accurately as possible. However, colors and appearance may vary slightly from what you see on screen. All products are subject to availability.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-primary">Pricing</h2>
          <p>All prices are listed in USD unless otherwise stated. We reserve the right to change prices at any time. Orders are not binding until confirmed and shipped.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-primary">Orders</h2>
          <p>By placing an order, you represent that all information provided is accurate. We reserve the right to cancel orders that appear fraudulent or contain errors.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-primary">Intellectual Property</h2>
          <p>All content on this website, including text, images, logos, designs, and products, is the property of TKAYKONCEPTS and is protected by copyright and trademark laws. You may not reproduce or distribute our content without written permission.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-primary">User Content</h2>
          <p>Reviews and communications you submit become non-confidential. By submitting content, you grant TKAYKONCEPTS the right to use, modify, and display such content.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-primary">Limitation of Liability</h2>
          <p>TKAYKONCEPTS shall not be liable for any indirect, incidental, or consequential damages arising from use of our products or services. Our total liability shall not exceed the purchase price of the product.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-primary">Governing Law</h2>
          <p>These terms are governed by applicable laws. Any disputes shall be resolved in the appropriate courts of jurisdiction.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-primary">Contact</h2>
          <p>For questions about these terms, contact us at <a href="mailto:info@tkaykoncepts.com" className="text-accent hover:underline">info@tkaykoncepts.com</a>.</p>
        </section>
      </div>
    </div>
  );
}
