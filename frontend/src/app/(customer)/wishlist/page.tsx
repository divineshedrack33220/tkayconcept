"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { User, MapPin, Package, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function WishlistPage() {
  const { isSignedIn } = useUser();

  if (!isSignedIn) {
    return (
      <div className="section-padding container-custom">
        <div className="mx-auto max-w-md text-center">
          <h1 className="heading-secondary mb-4">Sign In Required</h1>
          <Link href="/sign-in">
            <Button variant="primary">Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: "Profile", href: "/account", icon: User },
    { label: "Addresses", href: "/account/addresses", icon: MapPin },
    { label: "Orders", href: "/orders", icon: Package },
    { label: "Wishlist", href: "/wishlist", icon: Heart, active: true },
  ];

  return (
    <div className="section-padding container-custom">
      <div className="mx-auto max-w-4xl">
        <h1 className="heading-secondary mb-8">My Wishlist</h1>

        <div className="grid gap-8 md:grid-cols-[240px_1fr]">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  item.active
                    ? "bg-accent/10 text-accent"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div>
            <EmptyState
              icon={<Heart className="h-12 w-12" />}
              title="Your wishlist is empty"
              description="Save items you love to your wishlist."
              action={{
                label: "Explore Products",
                href: "/shop",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
