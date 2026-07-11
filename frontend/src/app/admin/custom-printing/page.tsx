"use client";

import { AdminLayout } from "@/components/layout/admin-layout";
import { Construction } from "lucide-react";

export default function AdminCustomPrintingPage() {
  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">Custom Printing</h1>
        <p className="mt-1 text-gray-500">Manage custom printing services and quote requests</p>
      </div>
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
        <Construction className="mx-auto mb-3 h-12 w-12 text-gray-300" />
        <p className="mb-2 text-lg font-medium text-gray-500">Coming Soon</p>
        <p className="text-sm text-gray-400">View and manage custom printing quote requests and service offerings.</p>
      </div>
    </AdminLayout>
  );
}
