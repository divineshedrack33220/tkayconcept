"use client";

import { useState } from "react";
import { Package, Search, Loader2, CheckCircle2, Clock, Truck, MapPin, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import api from "@/lib/api";
import type { Order } from "@/types";

const STATUS_STEPS = [
  { key: "pending", label: "Order Placed", icon: Package },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { key: "processing", label: "Processing", icon: Clock },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: MapPin },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "text-yellow-600 bg-yellow-50",
  confirmed: "text-blue-600 bg-blue-50",
  processing: "text-indigo-600 bg-indigo-50",
  shipped: "text-purple-600 bg-purple-50",
  delivered: "text-green-600 bg-green-50",
  cancelled: "text-red-600 bg-red-50",
};

export default function OrderTrackingPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber || !email) {
      setError("Please enter both order number and email");
      return;
    }
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const res = await api.get(`/track?orderNumber=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(email)}`);
      setOrder(res.data.data);
    } catch {
      setError("Order not found. Please check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  const currentStepIndex = order ? STATUS_STEPS.findIndex((s) => s.key === order.orderStatus) : -1;

  return (
    <div>
      <section className="bg-primary py-16 text-white">
        <div className="container-custom text-center">
          <Package className="mx-auto mb-4 h-12 w-12 text-accent" />
          <h1 className="mb-2 text-4xl font-bold">Track Your Order</h1>
          <p className="text-gray-300">Enter your order number and email to see the latest status</p>
        </div>
      </section>

      <section className="section-padding container-custom">
        <div className="mx-auto max-w-lg">
          <form onSubmit={handleTrack} className="mb-10 space-y-4 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Order Number</label>
              <Input
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g. TK-260712-ABCD"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email Address</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button variant="accent" type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Track Order
            </Button>
          </form>

          {order && (
            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
              {/* Header */}
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500">ORDER NUMBER</p>
                  <p className="text-lg font-bold text-primary">{order.orderNumber}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_COLORS[order.orderStatus] || "bg-gray-100 text-gray-600"}`}>
                  {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                </span>
              </div>

              {/* Progress Timeline */}
              <div className="mb-8">
                <div className="relative flex items-center justify-between">
                  {/* Connecting line */}
                  <div className="absolute left-0 right-0 top-4 h-0.5 bg-gray-200" />
                  <div
                    className="absolute left-0 top-4 h-0.5 bg-accent transition-all duration-500"
                    style={{ width: `${currentStepIndex >= 0 ? (currentStepIndex / (STATUS_STEPS.length - 1)) * 100 : 0}%` }}
                  />

                  {STATUS_STEPS.map((step, i) => {
                    const isActive = i <= currentStepIndex;
                    const isCurrent = i === currentStepIndex;
                    return (
                      <div key={step.key} className="relative z-10 flex flex-col items-center">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                          isActive ? "bg-accent text-white shadow-md shadow-accent/20" : "bg-gray-100 text-gray-400"
                        } ${isCurrent ? "ring-4 ring-accent/20" : ""}`}>
                          <step.icon className="h-4 w-4" />
                        </div>
                        <p className={`mt-2 text-[10px] font-medium ${isActive ? "text-accent" : "text-gray-400"}`}>
                          {step.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cancelled notice */}
              {order.orderStatus === "cancelled" && (
                <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-600">
                  <XCircle className="h-5 w-5" />
                  This order has been cancelled.
                </div>
              )}

              {/* Tracking Info */}
              {order.trackingNumber && (
                <div className="mb-6 rounded-xl bg-gray-50 p-4">
                  <p className="mb-1 text-xs font-medium text-gray-500">TRACKING</p>
                  <p className="text-sm font-bold text-gray-900">{order.trackingNumber}</p>
                  {order.carrier && <p className="text-xs text-gray-500">Carrier: {order.carrier}</p>}
                  {order.trackingUrl && (
                    <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs font-semibold text-accent hover:underline">
                      Track on carrier website →
                    </a>
                  )}
                </div>
              )}

              {/* Items */}
              <div className="mb-4">
                <p className="mb-2 text-xs font-medium text-gray-500">ITEMS</p>
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        <img src={item.image || "/placeholder-book.svg"} alt={item.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total</span>
                  <span className="font-bold text-primary">{formatPrice(order.total)}</span>
                </div>
              </div>

              {/* Shipping Address */}
              {order.shippingAddress && (
                <div className="mt-4 rounded-xl bg-gray-50 p-4">
                  <p className="mb-1 text-xs font-medium text-gray-500">SHIPPING TO</p>
                  <p className="text-sm text-gray-700">
                    {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
