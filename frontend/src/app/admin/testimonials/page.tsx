"use client";

import { AdminLayout } from "@/components/layout/admin-layout";
import { Construction } from "lucide-react";

export default function AdminTestimonialsPage() {
  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">Testimonials</h1>
        <p className="mt-1 text-gray-500">Manage customer testimonials and reviews</p>
      </div>
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
        <Construction className="mx-auto mb-3 h-12 w-12 text-gray-300" />
        <p className="mb-2 text-lg font-medium text-gray-500">Coming Soon</p>
        <p className="text-sm text-gray-400">Display, moderate, and feature customer testimonials.</p>
      </div>
    </AdminLayout>
  );
}
