"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSafeUser, useSafeClerk, CLERK_ENABLED } from "@/lib/safe-clerk";
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
  Gift,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useUIStore } from "@/stores/uiStore";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { SearchPanel } from "@/components/shared/search-panel";
import { CartDrawer } from "@/components/shared/cart-drawer";
import { CurrencySelector } from "@/components/shared/currency-selector";
import { LanguageSelector } from "@/components/shared/language-selector";
import { useTranslation } from "@/i18n";

const CLERK_ENABLED_EXPORT = CLERK_ENABLED;

const megaMenuData = {
  categories: PRODUCT_CATEGORIES.map((cat) => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    href: `/shop/${cat}`,
    image: `https://picsum.photos/seed/tkay-${cat}/200/200`,
  })),
};

function UserAvatar({ className = "" }: { className?: string }) {
  const { user } = useSafeUser();
  if (user?.imageUrl) {
    return <img src={user.imageUrl} alt="" className={`rounded-full object-cover ${className}`} />;
  }
  return (
    <div className={`flex items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-dark text-xs font-bold text-white ${className}`}>
      {user?.firstName?.charAt(0)}
    </div>
  );
}

function DesktopUserMenu() {
  const { isSignedIn, user } = useSafeUser();
  const { signOut } = useSafeClerk();
  const { t } = useTranslation();
  const wishlistCount = useWishlistStore((s) => s.items.length);

  if (!isSignedIn) {
    return (
      <Link href="/sign-in">
        <Button variant="primary" size="sm" className="hidden sm:flex">{t("auth.signIn")}</Button>
      </Link>
    );
  }

  return (
    <>
      <Link href="/wishlist" className="relative hidden sm:flex rounded-lg p-2.5 text-gray-600 hover:bg-gray-100 transition-colors">
        <Heart className="h-5 w-5" />
        {wishlistCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-fade-in">
            {wishlistCount}
          </span>
        )}
      </Link>
      <div className="relative group">
        <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
          <UserAvatar className="h-7 w-7" />
          <span className="hidden md:inline">{user?.firstName}</span>
        </button>
        <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 absolute right-0 top-full z-50 mt-1 w-56 rounded-xl border border-gray-100 bg-white py-2 shadow-xl shadow-gray-200/50 transition-all duration-200">
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="text-sm font-semibold text-gray-900">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-gray-500">{user?.primaryEmailAddress?.emailAddress}</p>
          </div>
          <Link href="/account" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
            <User className="h-4 w-4" /> {t("auth.myAccount")}
          </Link>
          <Link href="/orders" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
            <Package className="h-4 w-4" /> {t("auth.myOrders")}
          </Link>
          <Link href="/wishlist" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
            <Heart className="h-4 w-4" /> {t("auth.wishlist")}
          </Link>
          <Link href="/gift-cards" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
            <Gift className="h-4 w-4" /> Gift Cards
          </Link>
          <Link href="/track" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
            <Truck className="h-4 w-4" /> Track Order
          </Link>
          {(user?.publicMetadata?.role === "admin" || user?.publicMetadata?.role === "super_admin") && (
            <Link href="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
              <Settings className="h-4 w-4" /> Admin Dashboard
            </Link>
          )}
          <hr className="my-1" />
          <button onClick={() => signOut()} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-gray-50">
            <LogOut className="h-4 w-4" /> {t("auth.signOut")}
          </button>
        </div>
      </div>
    </>
  );
}

function MobileUserDrawer() {
  const { isSignedIn, user } = useSafeUser();
  const { signOut } = useSafeClerk();
  const { toggleMobileMenu } = useUIStore();
  const { t } = useTranslation();

  if (!isSignedIn) {
    return (
      <Link href="/sign-in" onClick={toggleMobileMenu}>
        <Button variant="accent" className="w-full">{t("auth.signIn")}</Button>
      </Link>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3 mb-2">
        <UserAvatar className="h-9 w-9" />
        <div>
          <p className="text-sm font-semibold">{user?.firstName}</p>
          <p className="text-xs text-gray-500">{user?.primaryEmailAddress?.emailAddress}</p>
        </div>
      </div>
      <Link href="/account" onClick={toggleMobileMenu} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
        <User className="h-4 w-4" /> {t("auth.myAccount")}
      </Link>
      <Link href="/orders" onClick={toggleMobileMenu} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
        <Package className="h-4 w-4" /> {t("auth.myOrders")}
      </Link>
      <Link href="/wishlist" onClick={toggleMobileMenu} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
        <Heart className="h-4 w-4" /> {t("auth.wishlist")}
      </Link>
      <button onClick={() => { signOut(); toggleMobileMenu(); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 hover:bg-gray-50">
        <LogOut className="h-4 w-4" /> {t("auth.signOut")}
      </button>
    </div>
  );
}

export function Header() {
  const totalItems = useCartStore((s) => s.items.reduce((sum, item) => sum + item.quantity, 0));
  const { isMobileMenuOpen, toggleMobileMenu, toggleSearch, toggleCart } = useUIStore();
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const { t } = useTranslation();

  const navLinks = [
    { label: t("nav.home"), href: "/" },
    { label: t("nav.shop"), href: "/shop", hasMega: true },
    { label: t("nav.rootedIdentity"), href: "/rooted-identity" },
    { label: t("nav.customPrinting"), href: "/custom-printing" },
    { label: t("nav.contact"), href: "/contact" },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header className={`sticky top-0 z-50 border-b bg-white transition-shadow duration-300 ${
        scrolled ? "shadow-md border-gray-100" : "border-gray-100"
      }`}>
        <div className="container-custom">
          <div className="flex h-16 items-center justify-between gap-4">
            <Link href="/" className="flex-shrink-0">
              <span className="text-xl font-bold text-primary">
                TKAY<span className="text-accent">KONCEPTS</span>
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => link.hasMega && setMegaOpen(true)}
                  onMouseLeave={() => link.hasMega && setMegaOpen(false)}
                >
                  <Link
                    href={link.href}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-accent rounded-lg hover:bg-accent/5"
                  >
                    {link.label}
                    {link.hasMega && <ChevronDown className="h-3 w-3 transition-transform" style={{ transform: megaOpen ? "rotate(180deg)" : "" }} />}
                  </Link>

                  {link.hasMega && megaOpen && (
                    <div
                      className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3"
                      onMouseEnter={() => setMegaOpen(true)}
                      onMouseLeave={() => setMegaOpen(false)}
                    >
                      <div className="w-[min(600px,calc(100vw-3rem))] rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl shadow-gray-200/50">
                        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">Categories</p>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                          {megaMenuData.categories.map((cat) => (
                            <Link
                              key={cat.name}
                              href={cat.href}
                              className="group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-accent/5"
                            >
                              <img
                                src={cat.image}
                                alt={cat.name}
                                className="h-10 w-10 rounded-lg object-cover"
                              />
                              <span className="text-sm font-medium text-gray-700 group-hover:text-accent">{cat.name}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            <div className="flex items-center gap-1">
              <div className="hidden lg:block">
                <CurrencySelector />
              </div>
              <div className="hidden lg:block">
                <LanguageSelector />
              </div>

              <button onClick={toggleSearch} className="rounded-lg p-2.5 text-gray-600 hover:bg-gray-100 transition-colors">
                <Search className="h-5 w-5" />
              </button>

              {CLERK_ENABLED_EXPORT && <DesktopUserMenu />}

              {!CLERK_ENABLED_EXPORT && (
                <Link href="/sign-in">
                  <Button variant="primary" size="sm" className="hidden sm:flex">{t("auth.signIn")}</Button>
                </Link>
              )}

              <button onClick={toggleCart} className="relative rounded-lg p-2.5 text-gray-600 hover:bg-gray-100 transition-colors">
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white animate-fade-in">
                    {totalItems}
                  </span>
                )}
              </button>

              <button onClick={toggleMobileMenu} className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden">
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" onClick={toggleMobileMenu} />
        )}

        <div
          className={`fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-2xl transition-transform duration-300 ease-out lg:hidden ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <Link href="/" onClick={toggleMobileMenu} className="text-lg font-bold text-primary">
                TKAY<span className="text-accent">KONCEPTS</span>
              </Link>
              <button onClick={toggleMobileMenu} className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4">
              {navLinks.map((link) => (
                <div key={link.label}>
                  {link.hasMega ? (
                    <>
                      <button
                        onClick={() => setMobileExpanded(mobileExpanded === link.label ? null : link.label)}
                        className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        {link.label}
                        <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${mobileExpanded === link.label ? "rotate-90" : ""}`} />
                      </button>
                      {mobileExpanded === link.label && (
                        <div className="ml-4 border-l-2 border-accent/20 pl-4 pb-2">
                          <Link href={link.href} onClick={toggleMobileMenu} className="block rounded-lg px-3 py-2 text-sm font-semibold text-accent hover:bg-accent/5">
                            View All Products
                          </Link>
                          {megaMenuData.categories.map((cat) => (
                            <Link key={cat.name} href={cat.href} onClick={toggleMobileMenu} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-accent">
                              <img src={cat.image} alt={cat.name} className="h-8 w-8 rounded-lg object-cover" />
                              {cat.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={link.href}
                      onClick={toggleMobileMenu}
                      className="block rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      {link.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            <div className="border-t border-gray-100 px-5 py-4">
              {CLERK_ENABLED_EXPORT && <MobileUserDrawer />}
              {!CLERK_ENABLED_EXPORT && (
                <Link href="/sign-in" onClick={toggleMobileMenu}>
                  <Button variant="accent" className="w-full">{t("auth.signIn")}</Button>
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
