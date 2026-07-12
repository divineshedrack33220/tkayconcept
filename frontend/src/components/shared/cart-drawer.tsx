"use client";

import Link from "next/link";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useUIStore } from "@/stores/uiStore";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const { isCartOpen, toggleCart } = useUIStore();
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const subtotal = useCartStore((s) => s.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0));

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={toggleCart} />
      <div className="absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-primary">Your Cart</h2>
            <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
              {items.length} {items.length === 1 ? "item" : "items"}
            </span>
          </div>
          <button onClick={toggleCart} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <ShoppingBag className="mb-4 h-12 w-12 text-gray-200" />
              <p className="text-gray-500">Your cart is empty</p>
              <button onClick={toggleCart} className="mt-3 text-sm font-medium text-accent hover:underline">
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const image =
                  item.product.images.find((i) => i.isPrimary)?.url ||
                  item.product.images[0]?.url ||
                  "/placeholder-book.svg";
                return (
                  <div key={item.product._id} className="flex gap-4">
                    <img src={image} alt={item.product.name} className="h-20 w-20 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.product.name}</p>
                      {item.variant && (
                        <p className="text-xs text-gray-500">{item.variant.name}: {item.variant.value}</p>
                      )}
                      <p className="mt-1 text-sm font-semibold text-primary">{formatPrice(item.product.price)}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.product._id, item.quantity - 1, item.variant)}
                          disabled={item.quantity <= 1}
                          className="rounded border border-gray-200 p-0.5 text-gray-500 hover:bg-gray-50 disabled:opacity-30"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product._id, item.quantity + 1, item.variant)}
                          className="rounded border border-gray-200 p-0.5 text-gray-500 hover:bg-gray-50"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => removeItem(item.product._id, item.variant)}
                          className="ml-auto text-xs text-gray-400 hover:text-red-500"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-6 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Subtotal</span>
              <span className="text-lg font-bold text-primary">{formatPrice(subtotal)}</span>
            </div>
            <p className="text-xs text-gray-400">Shipping and taxes calculated at checkout</p>
            <Link href="/checkout" onClick={toggleCart}>
              <Button variant="accent" className="w-full" size="lg">
                Proceed to Checkout
              </Button>
            </Link>
            <button onClick={toggleCart} className="block w-full text-center text-sm font-medium text-accent hover:underline">
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
