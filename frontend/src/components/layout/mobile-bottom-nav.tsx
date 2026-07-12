"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ShoppingBag, Heart, User } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useUIStore } from "@/stores/uiStore";
import { useAuth } from "@clerk/nextjs";

const navItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Search, label: "Search", action: "search" },
  { icon: ShoppingBag, label: "Cart", action: "cart" },
  { icon: Heart, label: "Wishlist", href: "/wishlist" },
  { icon: User, label: "Account", href: "/account" },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const totalItems = useCartStore((s) => s.items.reduce((sum, item) => sum + item.quantity, 0));
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const { toggleSearch, toggleCart } = useUIStore();
  const { isSignedIn } = useAuth();

  const handleAction = (action?: string) => {
    if (action === "search") toggleSearch();
    else if (action === "cart") toggleCart();
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-100 bg-white/95 backdrop-blur-sm safe-area-inset lg:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href && pathname === item.href;

          if (item.action) {
            return (
              <button
                key={item.label}
                onClick={() => handleAction(item.action)}
                className="flex flex-col items-center gap-0.5 px-4 py-1 text-gray-500"
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
                {item.action === "cart" && totalItems > 0 && (
                  <span className="absolute -mt-5 ml-3 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[8px] font-bold text-white">
                    {totalItems}
                  </span>
                )}
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              href={isSignedIn || item.href === "/" ? item.href : "/sign-in"}
              className={`flex flex-col items-center gap-0.5 px-4 py-1 ${
                isActive ? "text-accent" : "text-gray-500"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
              {item.label === "Wishlist" && wishlistCount > 0 && (
                <span className="absolute -mt-5 ml-3 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
