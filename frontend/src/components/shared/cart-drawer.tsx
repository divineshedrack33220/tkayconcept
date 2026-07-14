"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import { X, Minus, Plus, ShoppingBag, Truck, Trash2, PlusCircle } from "lucide-react";
import { useUIStore } from "@/stores/uiStore";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useTranslation } from "@/i18n";
import api from "@/lib/api";
import type { Product } from "@/types";

const FREE_SHIPPING_THRESHOLD = 75;

export function CartDrawer() {
  const { isCartOpen, toggleCart } = useUIStore();
  const { t } = useTranslation();
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const subtotal = useCartStore((s) => s.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0));
  const totalItems = useCartStore((s) => s.items.reduce((sum, item) => sum + item.quantity, 0));
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const addItem = useCartStore((s) => s.addItem);
  const cartProductIds = useMemo(() => items.map((i) => i.product._id), [items]);
  const drawerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);

  useEffect(() => {
    if (!isCartOpen || items.length === 0) {
      setRecommendations([]);
      return;
    }
    api.get("/products?limit=8&sort=-createdAt")
      .then((res) => {
        const recs = (res.data.data || res.data || [])
          .filter((p: Product) => !cartProductIds.includes(p._id))
          .slice(0, 4);
        setRecommendations(recs);
      })
      .catch(() => {});
  }, [isCartOpen, items.length, cartProductIds]);

  const shippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
  const qualifiesForFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;

  useEffect(() => {
    if (!isCartOpen) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [isCartOpen]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientY - touchStartY.current;
    if (diff > 80) toggleCart();
  }, [toggleCart]);

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={toggleCart}
      />

      {/* Drawer - full height slide up on mobile, slide in from right on desktop */}
      <div
        ref={drawerRef}
        className="absolute inset-x-0 bottom-0 top-8 sm:inset-y-0 sm:right-0 sm:left-auto sm:w-full sm:max-w-md flex flex-col bg-white sm:rounded-t-3xl shadow-2xl animate-slide-in-bottom sm:animate-slide-in-right"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Mobile drag handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4 safe-area-top">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-primary text-white">
              <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">{t("cart.title")}</h2>
              <p className="text-[11px] sm:text-xs text-gray-500">{totalItems === 1 ? t("cart.item") : t("cart.items", { count: totalItems })}</p>
            </div>
          </div>
          <button
            onClick={toggleCart}
            aria-label="Close cart"
            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 active:bg-gray-200 touch-feedback"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Free Shipping Progress */}
        <div className="border-b border-gray-100 px-4 sm:px-6 py-2.5 sm:py-3">
          <div className="flex items-center justify-between text-[11px] sm:text-xs">
            {qualifiesForFreeShipping ? (
              <span className="flex items-center gap-1.5 font-semibold text-emerald-600">
                <Truck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {t("cart.freeShipping")}
              </span>
            ) : (
              <span className="text-gray-600">
                {t("cart.addMore", { amount: formatPrice(remaining) })}
              </span>
            )}
          </div>
          <div className="mt-2 h-1.5 sm:h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                qualifiesForFreeShipping ? "bg-emerald-500" : "bg-gradient-to-r from-accent to-accent-light"
              }`}
              style={{ width: `${shippingProgress}%` }}
            />
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 sm:py-4 scroll-y-momentum">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20">
              <div className="mb-4 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-gray-50">
                <ShoppingBag className="h-8 w-8 sm:h-10 sm:w-10 text-gray-200" />
              </div>
              <p className="text-base sm:text-lg font-semibold text-gray-900">{t("cart.empty")}</p>
              <p className="mt-1 text-xs sm:text-sm text-gray-500">{t("cart.emptyDiscover")}</p>
              <button
                onClick={toggleCart}
                className="mt-6 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-light active:scale-[0.98] touch-feedback"
              >
                {t("cart.continueShopping")}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => {
                const image =
                  item.product.images?.find((i) => i.isPrimary)?.url ||
                  item.product.images?.[0]?.url ||
                  "/placeholder-book.svg";
                return (
                  <div
                    key={`${item.product._id}-${JSON.stringify(item.variant)}`}
                    className="flex gap-3 rounded-xl border border-gray-100/80 p-3 elevation-1"
                  >
                    <Link
                      href={`/shop/${item.product.category?.slug}/${item.product._id}`}
                      onClick={toggleCart}
                      className="h-[72px] w-[72px] flex-shrink-0 overflow-hidden rounded-lg bg-gray-50"
                    >
                      <img
                        src={image}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <p className="text-[13px] sm:text-sm font-semibold text-gray-900 line-clamp-1">{item.product.name}</p>
                      {item.variant && (
                        <p className="mt-0.5 text-[11px] sm:text-xs text-gray-500">{Object.entries(item.variant).map(([k, v]) => `${k}: ${v}`).join(" · ")}</p>
                      )}
                      <p className="mt-auto pt-1 text-[13px] sm:text-sm font-bold text-primary">{formatPrice(item.product.price)}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50">
                          <button
                            onClick={() => updateQuantity(item.product._id, item.quantity - 1, item.variant)}
                            disabled={item.quantity <= 1}
                            aria-label="Decrease quantity"
                            className="flex h-9 w-9 items-center justify-center text-gray-500 active:text-accent disabled:opacity-30 touch-feedback"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="min-w-[32px] text-center text-[13px] font-bold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product._id, item.quantity + 1, item.variant)}
                            aria-label="Increase quantity"
                            className="flex h-9 w-9 items-center justify-center text-gray-500 active:text-accent touch-feedback"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.product._id, item.variant)}
                          aria-label={`Remove ${item.product.name} from cart`}
                          className="ml-auto flex h-9 w-9 items-center justify-center rounded-lg text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500 active:bg-red-100 touch-feedback"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Cross-sell */}
          {items.length > 0 && recommendations.length > 0 && (
            <div className="mt-5 border-t border-gray-100 pt-4">
              <p className="mb-3 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-400">{t("cart.youMayAlsoLike")}</p>
              <div className="grid grid-cols-2 gap-2.5">
                {recommendations.map((rec) => {
                  const recImage = rec.images?.find((i) => i.isPrimary)?.url || rec.images?.[0]?.url || "/placeholder-book.svg";
                  return (
                    <button
                      key={rec._id}
                      onClick={() => addItem(rec)}
                      className="group/rec flex gap-2.5 rounded-xl border border-gray-100/80 p-2.5 text-left elevation-1 touch-feedback active:border-accent/30 active:bg-accent/5"
                    >
                      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-50">
                        <img src={recImage} alt={rec.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex min-w-0 flex-col">
                        <p className="text-[11px] sm:text-xs font-semibold text-gray-900 line-clamp-2 group-hover/rec:text-accent transition-colors">{rec.name}</p>
                        <p className="mt-auto pt-1 text-[11px] sm:text-xs font-bold text-primary">{formatPrice(rec.price)}</p>
                        <span className="mt-0.5 flex items-center gap-0.5 text-[9px] sm:text-[10px] font-medium text-accent">
                          <PlusCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          {t("cart.add")}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-4 sm:px-6 py-4 sm:py-5 space-y-2.5 sm:space-y-3 safe-area-bottom bg-white">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[13px] sm:text-sm">
                <span className="text-gray-500">{t("cart.subtotal")}</span>
                <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] sm:text-xs text-gray-400">
                <span>{t("cart.shipping")}</span>
                <span>{qualifiesForFreeShipping ? t("cart.free") : t("cart.calculatedAt")}</span>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-gray-100 pt-2.5 sm:pt-3">
              <span className="text-[13px] sm:text-sm font-bold text-gray-900">{t("cart.total")}</span>
              <span className="text-lg sm:text-xl font-bold text-primary">{formatPrice(subtotal)}</span>
            </div>
            <Link href="/checkout" onClick={toggleCart}>
              <button className="w-full rounded-xl bg-accent px-6 py-3.5 sm:py-4 text-[15px] sm:text-base font-semibold text-white transition-all hover:bg-accent-dark active:scale-[0.98] touch-feedback elevation-2">
                {t("cart.checkout")}
              </button>
            </Link>
            <button
              onClick={toggleCart}
              className="block w-full text-center text-[13px] sm:text-sm font-medium text-gray-500 active:text-accent py-1"
            >
              {t("cart.continueShopping")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
