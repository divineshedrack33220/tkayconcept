"use client";

import Link from "next/link";
import { useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import {
  Search,
  ShoppingBag,
  User,
  Menu,
  X,
  Heart,
  ChevronDown,
  LogOut,
  Package,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cartStore";
import { useUIStore } from "@/stores/uiStore";
import { PRODUCT_CATEGORIES } from "@/lib/constants";

const navLinks = [
  { label: "Home", href: "/" },
  {
    label: "Shop",
    href: "/shop",
    children: PRODUCT_CATEGORIES.map((cat) => ({
      label: cat.charAt(0).toUpperCase() + cat.slice(1),
      href: `/shop/${cat}`,
    })),
  },
  { label: "Rooted Identity", href: "/rooted-identity" },
  { label: "Custom Printing", href: "/custom-printing" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const totalItems = useCartStore((s) => s.totalItems);
  const { isMobileMenuOpen, toggleMobileMenu, toggleSearch, toggleCart } = useUIStore();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container-custom">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span className="text-xl font-bold text-primary">
              TKAY<span className="text-accent">KONCEPTS</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => link.children && setActiveDropdown(link.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={link.href}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-accent"
                >
                  {link.label}
                  {link.children && <ChevronDown className="h-3 w-3" />}
                </Link>
                {link.children && activeDropdown === link.label && (
                  <div className="absolute left-0 top-full z-50 mt-1 w-48 rounded-lg border border-gray-100 bg-white py-2 shadow-lg">
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-accent"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSearch}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
            >
              <Search className="h-5 w-5" />
            </button>

            {isSignedIn && (
              <Link
                href="/wishlist"
                className="hidden sm:flex rounded-lg p-2 text-gray-600 hover:bg-gray-100"
              >
                <Heart className="h-5 w-5" />
              </Link>
            )}

            <button
              onClick={toggleCart}
              className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                  {totalItems}
                </span>
              )}
            </button>

            {isSignedIn ? (
              <div className="relative group">
                <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                    {user?.firstName?.charAt(0)}
                  </div>
                  <span className="hidden md:inline">{user?.firstName}</span>
                </button>
                <div className="invisible group-hover:visible absolute right-0 top-full z-50 mt-1 w-56 rounded-lg border border-gray-100 bg-white py-2 shadow-lg">
                  <Link href="/account" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <User className="h-4 w-4" /> My Account
                  </Link>
                  <Link href="/orders" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <Package className="h-4 w-4" /> My Orders
                  </Link>
                  <Link href="/wishlist" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <Heart className="h-4 w-4" /> Wishlist
                  </Link>
                  {(user?.publicMetadata?.role === "admin" || user?.publicMetadata?.role === "super_admin") && (
                    <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <Settings className="h-4 w-4" /> Admin Dashboard
                    </Link>
                  )}
                  <hr className="my-1" />
                  <button
                    onClick={() => signOut()}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link href="/sign-in">
                <Button variant="primary" size="sm">
                  Sign In
                </Button>
              </Link>
            )}

            <button
              onClick={toggleMobileMenu}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="border-t py-4 lg:hidden">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={toggleMobileMenu}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
