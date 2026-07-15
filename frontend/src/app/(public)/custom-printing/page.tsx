"use client";

import { useEffect } from "react";
import { ArrowRight, ExternalLink } from "lucide-react";

export default function CustomPrintingPage() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = "https://rootedidentity.com";
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      <section className="bg-primary py-16 text-white">
        <div className="container-custom text-center">
          <h1 className="mb-3 text-4xl font-bold">Custom Printing</h1>
          <p className="text-gray-300">This service has moved to Rooted Identity</p>
        </div>
      </section>

      <section className="section-padding container-custom">
        <div className="mx-auto max-w-lg text-center">
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-6">
            <h2 className="mb-2 text-lg font-bold text-primary">Redirecting to Rooted Identity...</h2>
            <p className="text-sm text-gray-600">
              All custom printing services — t-shirts, hoodies, mugs, banners, and more —
              are now handled by our Rooted Identity brand.
            </p>
            <p className="mt-2 text-xs text-gray-400">You will be redirected in 3 seconds.</p>
          </div>

          <a
            href="https://rootedidentity.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-3 text-base font-semibold text-white transition-colors hover:bg-accent/90"
          >
            Visit Rooted Identity Now
            <ExternalLink className="h-4 w-4" />
          </a>

          <p className="mt-6 text-sm text-gray-500">
            You can also{" "}
            <a href="/contact" className="text-accent hover:underline">
              contact us
            </a>{" "}
            for any questions about custom orders.
          </p>
        </div>
      </section>
    </div>
  );
}
