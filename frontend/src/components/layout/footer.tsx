"use client";

import Link from "next/link";
import { SITE_NAME, SOCIAL_LINKS } from "@/lib/constants";
import { Camera, Globe, Video, AtSign, MessageCircle, Shield, Truck, RotateCcw, CreditCard } from "lucide-react";
import { useTranslation } from "@/i18n";

const footerLinks = {
  shop: [
    { label: "Books", href: "/shop/books" },
    { label: "Games", href: "/shop/games" },
    { label: "Apparel", href: "/shop/apparel" },
    { label: "Merchandise", href: "/shop/merchandise" },
    { label: "Devotionals", href: "/shop/devotionals" },
    { label: "Accessories", href: "/shop/accessories" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Rooted Identity", href: "/rooted-identity" },
    { label: "Custom Printing", href: "/custom-printing" },
    { label: "Community", href: "/community" },
    { label: "Contact", href: "/contact" },
  ],
  support: [
    { label: "FAQ", href: "/faq" },
    { label: "Track Order", href: "/track" },
    { label: "Shipping Policy", href: "/shipping" },
    { label: "Return Policy", href: "/returns" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

const socialIcons = [
  { icon: Camera, href: SOCIAL_LINKS.instagram, label: "Instagram" },
  { icon: Globe, href: SOCIAL_LINKS.facebook, label: "Facebook" },
  { icon: AtSign, href: SOCIAL_LINKS.twitter, label: "Twitter" },
  { icon: Video, href: SOCIAL_LINKS.youtube, label: "YouTube" },
  { icon: MessageCircle, href: SOCIAL_LINKS.whatsapp, label: "WhatsApp" },
];

const paymentMethods = [
  { name: "Visa", icon: "💳" },
  { name: "Mastercard", icon: "💳" },
  { name: "Apple Pay", icon: "🍎" },
  { name: "Google Pay", icon: "📱" },
  { name: "PayPal", icon: "🅿️" },
  { name: "Stripe", icon: "🔒" },
];

export function Footer() {
  const { t } = useTranslation();

  const footerLinks = {
    shop: [
      { label: "Books", href: "/shop/books" },
      { label: "Games", href: "/shop/games" },
      { label: "Apparel", href: "/shop/apparel" },
      { label: "Merchandise", href: "/shop/merchandise" },
      { label: "Devotionals", href: "/shop/devotionals" },
      { label: "Accessories", href: "/shop/accessories" },
    ],
    company: [
      { label: "About Us", href: "/about" },
      { label: t("nav.rootedIdentity"), href: "/rooted-identity" },
      { label: t("nav.customPrinting"), href: "/custom-printing" },
      { label: "Community", href: "/community" },
      { label: t("nav.contact"), href: "/contact" },
    ],
    support: [
      { label: "FAQ", href: "/faq" },
      { label: "Track Order", href: "/track" },
      { label: t("footer.shippingPolicy"), href: "/shipping" },
      { label: t("footer.returnPolicy"), href: "/returns" },
      { label: t("footer.privacyPolicy"), href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  };

  return (
    <footer className="bg-primary-dark text-white">
      {/* Trust bar */}
      <div className="border-b border-white/10">
        <div className="container-custom py-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { icon: Truck, title: "Free Shipping", desc: "On orders over $75" },
              { icon: Shield, title: "Secure Checkout", desc: "SSL encrypted" },
              { icon: RotateCcw, title: "30-Day Returns", desc: "Hassle free" },
              { icon: CreditCard, title: "Flexible Payment", desc: "Multiple options" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <Icon className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container-custom py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand + Newsletter */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-bold">
                TKAY<span className="text-accent">KONCEPTS</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-gray-400">
              Creating products that inspire people to live boldly and purposefully.
              Faith. Purpose. Identity.
            </p>
            <div className="mt-6 flex gap-3">
              {socialIcons.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-gray-400 transition-all hover:bg-accent hover:text-white hover:scale-110"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>

            {/* Mini newsletter */}
            <div className="mt-6">
              <p className="mb-2 text-sm font-semibold">{t("footer.subscribe")}</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder={t("footer.emailPlaceholder")}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
                <button className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-light">
                  {t("footer.subscribeBtn")}
                </button>
              </div>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-accent">
              Shop
            </h3>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-400 transition-colors hover:text-white hover:pl-1">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-accent">
              Company
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-400 transition-colors hover:text-white hover:pl-1">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-accent">
              Support
            </h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-400 transition-colors hover:text-white hover:pl-1">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container-custom flex flex-col items-center justify-between gap-4 py-6 md:flex-row">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            {paymentMethods.map((pm) => (
              <div
                key={pm.name}
                className="flex h-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-gray-400"
                title={pm.name}
              >
                {pm.icon}
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
