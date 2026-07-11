"use client";

import { AdminLayout } from "@/components/layout/admin-layout";
import { Construction } from "lucide-react";

export default function AdminCouponsPage() {
  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">Coupons</h1>
        <p className="mt-1 text-gray-500">Create and manage discount codes</p>
      </div>
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
        <Construction className="mx-auto mb-3 h-12 w-12 text-gray-300" />
        <p className="mb-2 text-lg font-medium text-gray-500">Coming Soon</p>
        <p className="text-sm text-gray-400">Create percentage or fixed-amount discount codes with usage limits and expiry dates.</p>
      </div>
    </AdminLayout>
  );
}
