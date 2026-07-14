"use client";

import Link from "next/link";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cartStore";
import { optImg } from "@/lib/opt-img";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const totalItems = useCartStore((s) => s.items.reduce((sum, item) => sum + item.quantity, 0));
  const subtotal = useCartStore((s) => s.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0));

  const shipping = subtotal >= 75 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="section-padding container-custom">
        <div className="mx-auto max-w-lg text-center">
          <div className="mb-6 rounded-full bg-gray-100 p-6">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
          </div>
          <h1 className="heading-secondary mb-3">Your cart is empty</h1>
          <p className="mb-8 text-gray-500">
            Looks like you haven&apos;t added anything yet.
          </p>
          <Link href="/shop">
            <Button variant="accent" size="lg">
              Start Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="section-padding container-custom">
      <h1 className="heading-secondary mb-8">
        Shopping Cart ({totalItems} {totalItems === 1 ? "item" : "items"})
      </h1>

      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        {/* Cart Items */}
        <div className="space-y-4">
          {items.map((item) => {
            const image = optImg(
              item.product.images.find((img) => img.isPrimary)?.url ||
              item.product.images[0]?.url ||
              "/placeholder-product.jpg",
              200, 200
            );

            return (
              <div
                key={`${item.product._id}-${JSON.stringify(item.variant)}`}
                className="flex gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                <Link
                  href={`/shop/${item.product.category?.slug}/${item.product._id}`}
                  className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-50"
                >
                  <img
                    src={image}
                    alt={item.product.name}
                    className="h-full w-full object-cover"
                  />
                </Link>

                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <Link
                      href={`/shop/${item.product.category?.slug}/${item.product._id}`}
                      className="text-sm font-semibold text-primary hover:text-accent"
                    >
                      {item.product.name}
                    </Link>
                    {item.variant && (
                      <p className="mt-0.5 text-xs text-gray-500">
                        {Object.entries(item.variant).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                      </p>
                    )}
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center rounded-lg border border-gray-200">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product._id,
                              item.quantity - 1,
                              item.variant
                            )
                          }
                          disabled={item.quantity <= 1}
                          className="p-2 text-gray-500 hover:text-accent disabled:opacity-30"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="min-w-[36px] text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product._id,
                              item.quantity + 1,
                              item.variant
                            )
                          }
                          className="p-2 text-gray-500 hover:text-accent"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        onClick={() =>
                          removeItem(item.product._id, item.variant)
                        }
                        className="p-2 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <p className="text-sm font-bold text-primary">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent-dark"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>
        </div>

        {/* Order Summary */}
        <div className="h-fit rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-primary">
            Order Summary
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium">
                {shipping === 0 ? (
                  <span className="text-green-600">Free</span>
                ) : (
                  `$${shipping.toFixed(2)}`
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax</span>
              <span className="font-medium">${tax.toFixed(2)}</span>
            </div>
            <hr />
            <div className="flex justify-between text-base">
              <span className="font-semibold text-primary">Total</span>
              <span className="font-bold text-primary">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>

          {subtotal < 75 && (
            <p className="mt-3 rounded-lg bg-green-50 p-3 text-xs text-green-700">
              Add ${(75 - subtotal).toFixed(2)} more for free shipping!
            </p>
          )}

          <Link href="/checkout" className="mt-6 block">
            <Button variant="accent" size="lg" className="w-full">
              Proceed to Checkout
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
