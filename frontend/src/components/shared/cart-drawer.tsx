"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { X, Minus, Plus, ShoppingBag, Truck, Package, PlusCircle } from "lucide-react";
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
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const addItem = useCartStore((s) => s.addItem);
  const cartProductIds = useMemo(() => items.map((i) => i.product._id), [items]);

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

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={toggleCart}
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{t("cart.title")}</h2>
              <p className="text-xs text-gray-500">{totalItems === 1 ? t("cart.item") : t("cart.items", { count: totalItems })}</p>
            </div>
          </div>
          <button
            onClick={toggleCart}
            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Free Shipping Progress */}
        <div className="border-b border-gray-100 px-6 py-3">
          <div className="flex items-center justify-between text-xs">
            {qualifiesForFreeShipping ? (
              <span className="flex items-center gap-1.5 font-semibold text-emerald-600">
                <Truck className="h-4 w-4" />
                {t("cart.freeShipping")}
              </span>
            ) : (
              <span className="text-gray-600">
                {t("cart.addMore", { amount: formatPrice(remaining) })}
              </span>
            )}
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                qualifiesForFreeShipping ? "bg-emerald-500" : "bg-gradient-to-r from-accent to-accent-light"
              }`}
              style={{ width: `${shippingProgress}%` }}
            />
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50">
                <ShoppingBag className="h-10 w-10 text-gray-200" />
              </div>
              <p className="text-lg font-semibold text-gray-900">{t("cart.empty")}</p>
              <p className="mt-1 text-sm text-gray-500">{t("cart.emptyDiscover")}</p>
              <button
                onClick={toggleCart}
                className="mt-6 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-light"
              >
                {t("cart.continueShopping")}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const image =
                  item.product.images?.find((i) => i.isPrimary)?.url ||
                  item.product.images?.[0]?.url ||
                  "/placeholder-book.svg";
                return (
                  <div
                    key={`${item.product._id}-${JSON.stringify(item.variant)}`}
                    className="flex gap-4 rounded-xl border border-gray-100 p-3 transition-colors hover:border-gray-200"
                  >
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-50">
                      <img
                        src={image}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <p className="text-sm font-semibold text-gray-900 line-clamp-1">{item.product.name}</p>
                      {item.variant && (
                        <p className="mt-0.5 text-xs text-gray-500">{item.variant.name}: {item.variant.value}</p>
                      )}
                      <p className="mt-auto pt-1 text-sm font-bold text-primary">{formatPrice(item.product.price)}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex items-center rounded-lg border border-gray-200">
                          <button
                            onClick={() => updateQuantity(item.product._id, item.quantity - 1, item.variant)}
                            disabled={item.quantity <= 1}
                            className="flex h-7 w-7 items-center justify-center text-gray-500 hover:text-accent disabled:opacity-30"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="min-w-[28px] text-center text-xs font-bold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product._id, item.quantity + 1, item.variant)}
                            className="flex h-7 w-7 items-center justify-center text-gray-500 hover:text-accent"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.product._id, item.variant)}
                          className="ml-auto text-xs text-gray-400 transition-colors hover:text-red-500"
                        >
                          {t("cart.remove")}
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
            <div className="mt-6 border-t border-gray-100 pt-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">{t("cart.youMayAlsoLike")}</p>
              <div className="grid grid-cols-2 gap-3">
                {recommendations.map((rec) => {
                  const recImage = rec.images?.find((i) => i.isPrimary)?.url || rec.images?.[0]?.url || "/placeholder-book.svg";
                  return (
                    <button
                      key={rec._id}
                      onClick={() => addItem(rec)}
                      className="group/rec flex gap-3 rounded-xl border border-gray-100 p-2.5 text-left transition-all hover:border-accent/30 hover:bg-accent/5 hover:shadow-sm"
                    >
                      <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-gray-50">
                        <img src={recImage} alt={rec.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex min-w-0 flex-col">
                        <p className="text-xs font-semibold text-gray-900 line-clamp-2 group-hover/rec:text-accent transition-colors">{rec.name}</p>
                        <p className="mt-auto pt-1 text-xs font-bold text-primary">{formatPrice(rec.price)}</p>
                        <span className="mt-0.5 flex items-center gap-0.5 text-[10px] font-medium text-accent">
                          <PlusCircle className="h-3 w-3" />
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
          <div className="border-t border-gray-100 px-6 py-5 space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{t("cart.subtotal")}</span>
                <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{t("cart.shipping")}</span>
                <span>{qualifiesForFreeShipping ? t("cart.free") : t("cart.calculatedAt")}</span>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-gray-100 pt-3">
              <span className="text-sm font-bold text-gray-900">{t("cart.total")}</span>
              <span className="text-xl font-bold text-primary">{formatPrice(subtotal)}</span>
            </div>
            <Link href="/checkout" onClick={toggleCart}>
              <Button variant="accent" className="w-full" size="lg">
                {t("cart.checkout")}
              </Button>
            </Link>
            <button
              onClick={toggleCart}
              className="block w-full text-center text-sm font-medium text-gray-500 hover:text-accent"
            >
              {t("cart.continueShopping")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
