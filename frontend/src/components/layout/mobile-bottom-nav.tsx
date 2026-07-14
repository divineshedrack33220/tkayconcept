"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ShoppingBag, Heart, User } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useUIStore } from "@/stores/uiStore";
import { useSafeAuth } from "@/lib/safe-clerk";

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
  const { isSignedIn } = useSafeAuth();

  const handleAction = (action?: string) => {
    if (action === "search") toggleSearch();
    else if (action === "cart") toggleCart();
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-100/50 bg-white/95 backdrop-blur-xl lg:hidden safe-area-bottom">
      <div className="flex items-center justify-around px-2 pb-1 pt-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href && pathname === item.href;

          if (item.action) {
            return (
              <button
                key={item.label}
                onClick={() => handleAction(item.action)}
                className="relative flex flex-col items-center justify-center gap-0.5 rounded-2xl px-4 py-2 text-gray-400 transition-all duration-200 active:scale-90 active:text-accent"
                style={{ minWidth: 56, minHeight: 48 }}
              >
                <Icon className="h-[22px] w-[22px] transition-transform duration-200" strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="text-[10px] font-medium leading-none">{item.label}</span>
                {item.action === "cart" && totalItems > 0 && (
                  <span className="absolute -top-0.5 right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-white shadow-sm elevation-1">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              href={(isSignedIn || item.href === "/") && item.href ? item.href : "/sign-in"}
              className="relative flex flex-col items-center justify-center gap-0.5 rounded-2xl px-4 py-2 transition-all duration-200 active:scale-90"
              style={{ minWidth: 56, minHeight: 48 }}
            >
              <div className={`relative flex items-center justify-center transition-all duration-200 ${
                isActive ? "text-accent" : "text-gray-400"
              }`}>
                {isActive && (
                  <div className="absolute -inset-2 -top-1 rounded-2xl bg-accent/10" />
                )}
                <Icon className="relative h-[22px] w-[22px]" strokeWidth={isActive ? 2.5 : 1.8} />
              </div>
              <span className={`text-[10px] font-medium leading-none transition-colors ${
                isActive ? "text-accent" : "text-gray-400"
              }`}>{item.label}</span>
              {item.label === "Wishlist" && wishlistCount > 0 && (
                <span className="absolute -top-0.5 right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white shadow-sm elevation-1">
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
