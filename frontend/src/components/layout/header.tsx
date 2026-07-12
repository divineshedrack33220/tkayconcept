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
  ChevronRight,
  LogOut,
  Package,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useUIStore } from "@/stores/uiStore";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { SearchPanel } from "@/components/shared/search-panel";
import { CartDrawer } from "@/components/shared/cart-drawer";

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
  const totalItems = useCartStore((s) => s.items.reduce((sum, item) => sum + item.quantity, 0));
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const { isMobileMenuOpen, toggleMobileMenu, toggleSearch, toggleCart } = useUIStore();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
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
              <button onClick={toggleSearch} className="rounded-lg p-2 text-gray-600 hover:bg-gray-100">
                <Search className="h-5 w-5" />
              </button>

              {isSignedIn && (
                <Link href="/wishlist" className="relative hidden sm:flex rounded-lg p-2 text-gray-600 hover:bg-gray-100">
                  <Heart className="h-5 w-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              )}

              <button onClick={toggleCart} className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100">
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
                    <button onClick={() => signOut()} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <Link href="/sign-in">
                  <Button variant="primary" size="sm">Sign In</Button>
                </Link>
              )}

              <button onClick={toggleMobileMenu} className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden">
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer Backdrop */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={toggleMobileMenu} />
        )}

        {/* Mobile Drawer */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <Link href="/" onClick={toggleMobileMenu} className="text-lg font-bold text-primary">
                TKAY<span className="text-accent">KONCEPTS</span>
              </Link>
              <button onClick={toggleMobileMenu} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Nav */}
            <nav className="flex-1 overflow-y-auto px-3 py-4">
              {navLinks.map((link) => (
                <div key={link.label}>
                  {link.children ? (
                    <>
                      <button
                        onClick={() => setMobileExpanded(mobileExpanded === link.label ? null : link.label)}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        {link.label}
                        <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${mobileExpanded === link.label ? "rotate-90" : ""}`} />
                      </button>
                      {mobileExpanded === link.label && (
                        <div className="ml-3 border-l-2 border-accent/20 pl-3">
                          <Link
                            href={link.href}
                            onClick={toggleMobileMenu}
                            className="block rounded-lg px-3 py-2 text-sm font-medium text-accent hover:bg-gray-50"
                          >
                            View All
                          </Link>
                          {link.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={toggleMobileMenu}
                              className="block rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-accent"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={link.href}
                      onClick={toggleMobileMenu}
                      className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      {link.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            {/* Drawer Footer */}
            <div className="border-t border-gray-100 px-5 py-4">
              {isSignedIn ? (
                <div className="space-y-1">
                  <Link href="/account" onClick={toggleMobileMenu} className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <User className="h-4 w-4" /> My Account
                  </Link>
                  <Link href="/orders" onClick={toggleMobileMenu} className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <Package className="h-4 w-4" /> My Orders
                  </Link>
                  <Link href="/wishlist" onClick={toggleMobileMenu} className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <Heart className="h-4 w-4" /> Wishlist
                  </Link>
                  <button onClick={() => { signOut(); toggleMobileMenu(); }} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-red-600 hover:bg-gray-50">
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              ) : (
                <Link href="/sign-in" onClick={toggleMobileMenu}>
                  <Button variant="accent" className="w-full">Sign In</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <SearchPanel />
      <CartDrawer />
    </>
  );
}
