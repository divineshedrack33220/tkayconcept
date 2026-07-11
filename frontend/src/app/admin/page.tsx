"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { useAuthenticatedApi } from "@/hooks/useAuthenticatedApi";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  paidOrders: number;
  recentOrders: {
    _id: string;
    orderNumber: string;
    total: number;
    orderStatus: string;
    paymentStatus: string;
    createdAt: string;
    user: { firstName: string; lastName: string; email: string };
  }[];
  lowStockProducts: { _id: string; name: string; stock: number; sku: string }[];
  ordersByStatus: Record<string, number>;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-indigo-100 text-indigo-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function AdminDashboard() {
  const authApi = useAuthenticatedApi();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await authApi.get("/admin/analytics");
        setStats(res.data.data);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = stats
    ? [
        { label: "Total Revenue", value: `$${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, color: "bg-green-500" },
        { label: "Total Orders", value: stats.totalOrders, icon: ShoppingCart, color: "bg-blue-500" },
        { label: "Products", value: stats.totalProducts, icon: Package, color: "bg-purple-500" },
        { label: "Customers", value: stats.totalCustomers, icon: Users, color: "bg-accent" },
      ]
    : [];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
        <p className="mt-1 text-gray-500">Welcome back! Here&apos;s what&apos;s happening.</p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-gray-100 bg-white p-6">
                <Skeleton className="mb-3 h-5 w-24" />
                <Skeleton className="h-8 w-20" />
              </div>
            ))
          : statCards.map((card) => (
              <div key={card.label} className="rounded-xl border border-gray-100 bg-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{card.label}</p>
                    <p className="mt-1 text-2xl font-bold text-primary">{card.value}</p>
                  </div>
                  <div className={`rounded-xl p-3 ${card.color}`}>
                    <card.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="rounded-xl border border-gray-100 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary">Recent Orders</h2>
            <Link href="/admin/orders" className="flex items-center gap-1 text-sm text-accent hover:text-accent-dark">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : stats?.recentOrders.length === 0 ? (
            <p className="py-8 text-center text-gray-400">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {stats?.recentOrders.map((order) => (
                <div key={order._id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                  <div>
                    <p className="text-sm font-medium">{order.orderNumber}</p>
                    <p className="text-xs text-gray-500">
                      {order.user.firstName} {order.user.lastName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">${order.total.toFixed(2)}</p>
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[order.orderStatus] || "bg-gray-100 text-gray-600"}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alert */}
        <div className="rounded-xl border border-gray-100 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-primary">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Low Stock Alert
            </h2>
            <Link href="/admin/products" className="flex items-center gap-1 text-sm text-accent hover:text-accent-dark">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : stats?.lowStockProducts.length === 0 ? (
            <p className="py-8 text-center text-gray-400">All products well stocked</p>
          ) : (
            <div className="space-y-3">
              {stats?.lowStockProducts.map((product) => (
                <div key={product._id} className="flex items-center justify-between rounded-lg bg-orange-50 p-3">
                  <div>
                    <p className="text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.sku}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${product.stock === 0 ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"}`}>
                    {product.stock === 0 ? "Out of Stock" : `${product.stock} left`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order Status Overview */}
      {stats && Object.keys(stats.ordersByStatus).length > 0 && (
        <div className="mt-6 rounded-xl border border-gray-100 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-primary">Orders by Status</h2>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {Object.entries(stats.ordersByStatus).map(([status, count]) => (
              <div key={status} className="rounded-lg bg-gray-50 p-4 text-center">
                <p className="text-2xl font-bold text-primary">{count}</p>
                <p className="mt-1 text-xs capitalize text-gray-500">{status}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
