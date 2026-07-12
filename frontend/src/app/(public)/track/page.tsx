"use client";

import { useState } from "react";
import { Search, Package, Truck, CheckCircle, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import api from "@/lib/api";

interface TrackingOrder {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  trackingNumber: string;
  total: number;
  createdAt: string;
  updatedAt: string;
  items: { name: string; quantity: number; price: number }[];
}

const statusSteps = [
  { key: "pending", label: "Order Placed", icon: Clock },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle },
  { key: "processing", label: "Processing", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
];

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<TrackingOrder | null>(null);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const res = await api.get(`/track?orderNumber=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(email)}`);
      setOrder(res.data.data);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Order not found");
    } finally { setLoading(false); }
  };

  const currentStep = order ? statusSteps.findIndex((s) => s.key === order.status) : -1;

  return (
    <div className="section-padding container-custom max-w-3xl">
      <Breadcrumbs items={[{ label: "Order Tracking" }]} />
      <h1 className="heading-primary mb-2">Track Your Order</h1>
      <p className="mb-8 text-gray-500">Enter your order number and email to see the status of your order.</p>

      <form onSubmit={handleSearch} className="mb-10 rounded-xl border border-gray-100 bg-white p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Order Number</label>
            <Input value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="e.g. TK-2026-0001" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email Address</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required />
          </div>
        </div>
        <Button variant="accent" type="submit" className="mt-4" isLoading={loading}>
          <Search className="mr-2 h-4 w-4" /> Track Order
        </Button>
      </form>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-600">{error}</div>
      )}

      {order && (
        <div className="rounded-xl border border-gray-100 bg-white p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-primary">{order.orderNumber}</h2>
              <p className="text-sm text-gray-500">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <span className="rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent capitalize">{order.status}</span>
          </div>

          {/* Progress Steps */}
          <div className="mb-8 flex items-center justify-between">
            {statusSteps.map((step, i) => {
              const done = i <= currentStep;
              return (
                <div key={step.key} className="flex flex-1 flex-col items-center">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${done ? "bg-accent text-white" : "bg-gray-100 text-gray-400"}`}>
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className={`mt-2 text-center text-xs ${done ? "font-medium text-accent" : "text-gray-400"}`}>{step.label}</span>
                </div>
              );
            })}
          </div>

          {order.trackingNumber && (
            <div className="mb-6 rounded-lg bg-green-50 p-4">
              <p className="text-sm font-medium text-green-800">Tracking Number</p>
              <p className="mt-1 font-mono text-sm text-green-700">{order.trackingNumber}</p>
            </div>
          )}

          <div className="border-t border-gray-100 pt-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">Order Items</h3>
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div>
                  <span className="text-sm text-gray-900">{item.name}</span>
                  <span className="ml-2 text-xs text-gray-400">x{item.quantity}</span>
                </div>
                <span className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="mt-3 flex justify-between border-t border-gray-100 pt-3">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="font-bold text-primary">${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
