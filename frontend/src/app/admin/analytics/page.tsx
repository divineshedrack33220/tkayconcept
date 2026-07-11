"use client";

import { useEffect, useState, useCallback } from "react";
import { BarChart3, DollarSign, ShoppingCart, Users, Package, TrendingUp } from "lucide-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthenticatedApi } from "@/hooks/useAuthenticatedApi";
import { toast } from "sonner";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  recentOrders: { _id: string; orderNumber: string; total: number; status: string; createdAt: string }[];
  topProducts: { name: string; totalSold: number; revenue: number }[];
}

export default function AdminAnalyticsPage() {
  const authApi = useAuthenticatedApi();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await authApi.get("/admin/dashboard");
      setStats(res.data.data);
    } catch {
      setStats({
        totalProducts: 0, totalOrders: 0, totalUsers: 0, totalRevenue: 0,
        recentOrders: [], topProducts: [],
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const statCards = stats ? [
    { label: "Total Revenue", value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "bg-green-50 text-green-600" },
    { label: "Total Orders", value: stats.totalOrders, icon: ShoppingCart, color: "bg-blue-50 text-blue-600" },
    { label: "Total Products", value: stats.totalProducts, icon: Package, color: "bg-purple-50 text-purple-600" },
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "bg-amber-50 text-amber-600" },
  ] : [];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">Analytics Dashboard</h1>
        <p className="mt-1 text-gray-500">Sales overview and key metrics</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-100 bg-white p-5">
              <Skeleton className="mb-3 h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card) => (
              <div key={card.label} className="rounded-xl border border-gray-100 bg-white p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{card.label}</span>
                  <div className={`rounded-lg p-2 ${card.color}`}>
                    <card.icon className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-2 text-2xl font-bold text-primary">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-gray-100 bg-white p-6">
              <h3 className="mb-4 font-semibold text-primary">Recent Orders</h3>
              {stats?.recentOrders?.length ? (
                <div className="space-y-3">
                  {stats.recentOrders.map((order) => (
                    <div key={order._id} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2">
                      <div>
                        <span className="text-sm font-medium">{order.orderNumber}</span>
                        <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                          order.status === "delivered" ? "bg-green-100 text-green-700" :
                          order.status === "shipped" ? "bg-blue-100 text-blue-700" :
                          "bg-gray-100 text-gray-600"
                        }`}>{order.status}</span>
                      </div>
                      <span className="font-medium">${order.total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No orders yet</p>
              )}
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-6">
              <h3 className="mb-4 font-semibold text-primary">Top Products</h3>
              {stats?.topProducts?.length ? (
                <div className="space-y-3">
                  {stats.topProducts.map((p, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2">
                      <span className="text-sm font-medium">{p.name}</span>
                      <div className="text-right">
                        <span className="text-sm text-gray-500">{p.totalSold} sold</span>
                        <span className="ml-2 text-sm font-medium">${p.revenue.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No product data yet</p>
              )}
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
