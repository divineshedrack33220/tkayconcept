"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/shop/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollReveal, ScrollRevealStagger, StaggerItem } from "@/components/ui/scroll-reveal";
import { useTranslation } from "@/i18n";
import { useRefetchOnWakeUp } from "@/hooks/useRefetchOnWakeUp";
import api from "@/lib/api";
import type { Product } from "@/types";

export function NewArrivals() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const refetchKey = useRefetchOnWakeUp();

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    api.get("/products/new-arrivals?limit=8", { signal: controller.signal })
      .then((res) => { if (!controller.signal.aborted) setProducts(res.data.data); })
      .catch(() => {})
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [refetchKey]);

  if (loading) {
    return (
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="mb-12 text-center">
            <Skeleton className="mx-auto mb-3 h-8 w-48" />
            <Skeleton className="mx-auto h-4 w-64" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
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
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <ScrollReveal>
          <div className="mb-8 sm:mb-12 text-center">
            <h2 className="heading-secondary">{t("shop.newArrivals")}</h2>
            <p className="mt-2 sm:mt-3 text-sm sm:text-base text-gray-600">{t("shop.newArrivalsSub")}</p>
          </div>
        </ScrollReveal>

        <ScrollRevealStagger className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {products.map((product) => (
            <StaggerItem key={product._id}>
              <ProductCard product={product} />
            </StaggerItem>
          ))}
        </ScrollRevealStagger>
      </div>
    </section>
  );
}
