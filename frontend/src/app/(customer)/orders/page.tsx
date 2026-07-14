"use client";

import { useEffect, useState, useCallback } from "react";
import { useSafeUser } from "@/lib/safe-clerk";
import Link from "next/link";
import { User, MapPin, Package, Heart, Loader2, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthenticatedApi } from "@/hooks/useAuthenticatedApi";
import { toast } from "sonner";
import type { Order } from "@/types";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-indigo-100 text-indigo-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function OrdersPage() {
  const { isSignedIn } = useSafeUser();
  const authApi = useAuthenticatedApi();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!isSignedIn) return;
    setLoading(true);
    try {
      const res = await authApi.get("/orders?limit=50");
      setOrders(res.data.data);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [isSignedIn]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  if (!isSignedIn) {
    return (
      <div className="section-padding container-custom">
        <div className="mx-auto max-w-md text-center">
          <h1 className="heading-secondary mb-4">Sign In Required</h1>
          <Link href="/sign-in"><Button variant="primary">Sign In</Button></Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: "Profile", href: "/account", icon: User },
    { label: "Addresses", href: "/account/addresses", icon: MapPin },
    { label: "Orders", href: "/orders", icon: Package, active: true },
    { label: "Wishlist", href: "/wishlist", icon: Heart },
  ];

  return (
    <div className="section-padding container-custom">
      <div className="mx-auto max-w-4xl">
        <h1 className="heading-secondary mb-8">My Orders</h1>
        <div className="grid gap-8 md:grid-cols-[240px_1fr]">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  item.active ? "bg-accent/10 text-accent" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-gray-100 bg-white p-6">
                    <Skeleton className="mb-2 h-5 w-48" />
                    <Skeleton className="mb-2 h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-12 text-center">
                <Package className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                <p className="mb-2 text-gray-500">No orders yet</p>
                <p className="mb-4 text-sm text-gray-400">When you place an order, it will appear here.</p>
                <Link href="/shop"><Button variant="accent" size="sm">Start Shopping</Button></Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order._id} className="rounded-xl border border-gray-100 bg-white">
                    <div className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-semibold text-primary">{order.orderNumber}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[order.orderStatus] || "bg-gray-100 text-gray-600"}`}>
                          {order.orderStatus}
                        </span>
                        <span className="font-semibold">${order.total.toFixed(2)}</span>
                        <button
                          onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                          className="rounded p-1 hover:bg-gray-100"
                        >
                          {expandedOrder === order._id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {expandedOrder === order._id && (
                      <div className="border-t px-4 pb-4 pt-3">
                        <div className="mb-3 space-y-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                              <span className="text-gray-700">
                                {item.name} x{item.quantity}
                                {item.variant && ` (${Object.values(item.variant).join(", ")})`}
                              </span>
                              <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="space-y-1 border-t pt-2 text-xs text-gray-500">
                          <div className="flex justify-between"><span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span></div>
                          <div className="flex justify-between"><span>Shipping</span><span>{order.shippingCost === 0 ? "Free" : `$${order.shippingCost.toFixed(2)}`}</span></div>
                          <div className="flex justify-between"><span>Tax</span><span>${order.tax.toFixed(2)}</span></div>
                          <div className="flex justify-between font-semibold text-gray-900"><span>Total</span><span>${order.total.toFixed(2)}</span></div>
                        </div>
                        {order.trackingNumber && (
                          <p className="mt-2 text-xs text-gray-500">Tracking: {order.trackingNumber}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
