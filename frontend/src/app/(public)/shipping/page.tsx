import { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Shipping Policy | TK Concepts",
  description: "Shipping rates, delivery times, and policies for TK Concepts orders.",
};

export default function ShippingPage() {
  return (
    <div className="section-padding container-custom max-w-3xl">
      <nav className="mb-8 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-accent">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-gray-900">Shipping Policy</span>
      </nav>
      <h1 className="heading-primary mb-6">Shipping Policy</h1>
      <div className="prose prose-gray max-w-none space-y-6 text-gray-600">
        <section>
          <h2 className="text-xl font-semibold text-primary">Processing Time</h2>
          <p>Orders are typically processed within 1-3 business days. You will receive a confirmation email once your order has shipped.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-primary">Shipping Rates</h2>
          <p>Shipping costs are calculated at checkout based on your location and chosen shipping method. We offer:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li><strong>Standard Shipping:</strong> 5-7 business days</li>
            <li><strong>Express Shipping:</strong> 2-3 business days</li>
              <li><strong>Free Standard Shipping</strong> on orders over £75</li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-primary">International Shipping</h2>
          <p>We ship worldwide. International shipping rates and delivery times vary by destination. Customs duties and taxes may apply and are the responsibility of the customer.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-primary">Order Tracking</h2>
          <p>Once your order ships, you will receive an email with a tracking number. You can track your order at any time by visiting our <Link href="/track" className="text-accent hover:underline">Order Tracking</Link> page.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-primary">Lost or Damaged Packages</h2>
          <p>If your package appears to be lost or arrives damaged, please contact us at <a href="mailto:info@tkconcepts.co.uk" className="text-accent hover:underline">info@tkconcepts.co.uk</a> within 7 days of the expected delivery date.</p>
        </section>
      </div>
    </div>
  );
}
