import Link from "next/link";
import { SITE_NAME, SOCIAL_LINKS } from "@/lib/constants";
import { Camera, Globe, Video, AtSign, MessageCircle } from "lucide-react";

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
    { label: "Blog", href: "/blog" },
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

export function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-block">
              <span className="text-2xl font-bold">
                TKAY<span className="text-accent">KONCEPTS</span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-gray-300">
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
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-gray-300 transition-colors hover:bg-accent hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-accent">
              Shop
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-300 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-accent">
              Company
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-300 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-accent">
              Support
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-300 transition-colors hover:text-white">
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
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
          <div className="flex gap-4">
            <span className="text-xs text-gray-500">Visa</span>
            <span className="text-xs text-gray-500">Mastercard</span>
            <span className="text-xs text-gray-500">PayPal</span>
            <span className="text-xs text-gray-500">Stripe</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
