"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, Send, Loader2, DollarSign, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthenticatedApi } from "@/hooks/useAuthenticatedApi";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";

interface AbandonedCart {
  _id: string;
  email: string;
  user?: { firstName: string; lastName: string; email: string };
  items: { name: string; price: number; quantity: number; image: string }[];
  subtotal: number;
  recoveryEmailSent: boolean;
  createdAt: string;
}

interface Stats {
  total: number;
  totalValue: number;
}

export default function AbandonedCartsPage() {
  const authApi = useAuthenticatedApi();
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, totalValue: 0 });
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchCarts = async () => {
    setLoading(true);
    try {
      const res = await authApi.get("/abandoned-carts/admin");
      setCarts(res.data.data);
      setStats(res.data.stats);
    } catch {
      toast.error("Failed to load abandoned carts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCarts(); }, []);

  const handleSendRecovery = async () => {
    setSending(true);
    try {
      const res = await authApi.post("/abandoned-carts/send-recovery");
      toast.success(res.data.message || `Sent ${res.data.data.sentCount} recovery emails`);
      fetchCarts();
    } catch {
      toast.error("Failed to send recovery emails");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Abandoned Carts</h1>
        <Button onClick={handleSendRecovery} disabled={sending || carts.length === 0}>
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Send Recovery Emails
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
              <ShoppingCart className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Abandoned Carts</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <DollarSign className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalValue)}</p>
              <p className="text-xs text-gray-500">Lost Revenue</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <AlertTriangle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {carts.filter((c) => !c.recoveryEmailSent).length}
              </p>
              <p className="text-xs text-gray-500">Pending Recovery</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cart List */}
      <div className="rounded-xl border border-gray-100 bg-white">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Abandoned Carts</h2>
        </div>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-accent" />
          </div>
        ) : carts.length === 0 ? (
          <div className="py-12 text-center text-gray-500">No abandoned carts</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {carts.map((cart) => (
              <div key={cart._id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {cart.user ? `${cart.user.firstName} ${cart.user.lastName}` : cart.email}
                    </p>
                    <p className="text-xs text-gray-500">
                      {cart.items.length} items · {formatPrice(cart.subtotal)} · {new Date(cart.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    cart.recoveryEmailSent ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {cart.recoveryEmailSent ? "Email Sent" : "Pending"}
                  </span>
                </div>
                <div className="mt-2 flex gap-2">
                  {cart.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-2 py-1 text-xs text-gray-600">
                      {item.image && <img src={item.image} alt="" className="h-5 w-5 rounded object-cover" />}
                      {item.name} x{item.quantity}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
