import { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Return Policy | TK Concepts",
  description: "How to return or exchange items purchased from TK Concepts.",
};

export default function ReturnsPage() {
  return (
    <div className="section-padding container-custom max-w-3xl">
      <nav className="mb-8 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-accent">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-gray-900">Return Policy</span>
      </nav>
      <h1 className="heading-primary mb-6">Return Policy</h1>
      <div className="prose prose-gray max-w-none space-y-6 text-gray-600">
        <section>
          <h2 className="text-xl font-semibold text-primary">30-Day Returns</h2>
          <p>We offer a 30-day return policy on most items. If you are not satisfied with your purchase, you may return it within 30 days of delivery for a full refund or exchange.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-primary">Eligibility</h2>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Items must be unused and in original packaging</li>
            <li>Items must be in the same condition as received</li>
            <li>Custom printed items are non-refundable unless defective</li>
            <li>Digital products are non-refundable</li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-primary">How to Initiate a Return</h2>
          <ol className="list-decimal pl-6 mt-2 space-y-1">
            <li>Contact us at <a href="mailto:info@tkconcepts.co.uk" className="text-accent hover:underline">info@tkconcepts.co.uk</a> with your order number</li>
            <li>Receive return authorization and shipping instructions</li>
            <li>Pack the item(s) securely and ship using the provided label</li>
            <li>Refund will be processed within 5-7 business days of receiving the return</li>
          </ol>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-primary">Exchanges</h2>
          <p>We offer free exchanges for defective or incorrect items. Contact us to arrange an exchange.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-primary">Refund Method</h2>
          <p>Refunds will be credited to the original payment method. Shipping costs are non-refundable unless the return is due to our error.</p>
        </section>
      </div>
    </div>
  );
}
