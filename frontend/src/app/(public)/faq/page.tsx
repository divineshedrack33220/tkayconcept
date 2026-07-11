"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "What is TKAYKONCEPTS?",
    answer: "TKAYKONCEPTS INT'L is a faith-driven creative company producing books, games, apparel, devotionals, and accessories that inspire people to live boldly and purposefully. Our mission is rooted in Faith, Purpose, and Identity.",
  },
  {
    question: "What is Rooted Identity?",
    answer: "Rooted Identity is our flagship apparel collection celebrating faith, culture, and identity. It's more than clothing — it's a declaration of who you are and whose you are. Each piece features meaningful designs rooted in biblical truth.",
  },
  {
    question: "Do you offer custom printing?",
    answer: "Yes! We offer custom printing services for t-shirts, hoodies, mugs, banners, and more. Whether it's for a church event, business, or personal use, we can bring your vision to life. Visit our Custom Printing page to submit a request.",
  },
  {
    question: "How long does shipping take?",
    answer: "Standard shipping typically takes 5-7 business days within the US. Express shipping (2-3 business days) is available at checkout. International shipping times vary by location. Orders over $75 qualify for free standard shipping.",
  },
  {
    question: "What is your return policy?",
    answer: "We offer a 30-day return policy on most items. Products must be in their original condition with tags attached. Contact our support team to initiate a return. Custom printed items are non-refundable unless there's a defect.",
  },
  {
    question: "How can I track my order?",
    answer: "Once your order ships, you'll receive an email with a tracking number. You can also view your order status and tracking information in your account dashboard under 'My Orders'.",
  },
  {
    question: "Do you ship internationally?",
    answer: "Yes, we ship to many countries worldwide. International shipping rates and delivery times vary by destination. You can see shipping options and costs at checkout.",
  },
  {
    question: "How can I become a partner or reseller?",
    answer: "We love working with like-minded organizations! Visit our Contact page and select 'Partnership' as the inquiry type, or email us directly at hello@tkaykoncepts.com to discuss partnership opportunities.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div>
      <section className="bg-primary py-16 text-white">
        <div className="container-custom text-center">
          <h1 className="mb-3 text-4xl font-bold">Frequently Asked Questions</h1>
          <p className="text-gray-300">Find answers to common questions</p>
        </div>
      </section>

      <section className="section-padding container-custom">
        <div className="mx-auto max-w-3xl space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-100 bg-white shadow-sm"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between p-5 text-left"
              >
                <span className="text-sm font-semibold text-primary lg:text-base">
                  {faq.question}
                </span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 flex-shrink-0 text-gray-400 transition-transform",
                    openIndex === i && "rotate-180"
                  )}
                />
              </button>
              {openIndex === i && (
                <div className="border-t px-5 pb-5 pt-4">
                  <p className="text-sm leading-relaxed text-gray-600">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="mb-4 text-gray-600">Still have questions?</p>
          <a href="/contact" className="btn-primary">
            Contact Us
          </a>
        </div>
      </section>
    </div>
  );
}
