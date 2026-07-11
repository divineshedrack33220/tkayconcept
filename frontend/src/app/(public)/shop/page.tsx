"use client";

import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import ShopContent from "./shop-content";

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="section-padding container-custom">
          <Skeleton className="mb-8 h-10 w-48" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-gray-100 bg-white p-3">
                <Skeleton className="mb-3 aspect-square w-full rounded-lg" />
                <Skeleton className="mb-2 h-3 w-16" />
                <Skeleton className="mb-1 h-4 w-3/4" />
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </div>
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
