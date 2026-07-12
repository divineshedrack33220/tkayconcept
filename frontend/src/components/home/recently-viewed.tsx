"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/shop/product-card";
import api from "@/lib/api";
import type { Product } from "@/types";

const STORAGE_KEY = "tkay-recently-viewed";
const MAX_ITEMS = 6;

export function getRecentlyViewed(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch { return []; }
}

export function addRecentlyViewed(productId: string) {
  if (typeof window === "undefined") return;
  try {
    const ids = getRecentlyViewed().filter((id) => id !== productId);
    ids.unshift(productId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.slice(0, MAX_ITEMS)));
  } catch { /* */ }
}

export function RecentlyViewed() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const ids = getRecentlyViewed();
    if (ids.length === 0) return;
    api.get(`/products?ids=${ids.join(",")}`)
      .then((res) => {
        const data = res.data.data || [];
        const ordered = ids.map((id) => data.find((p: Product) => p._id === id)).filter(Boolean);
        setProducts(ordered.slice(0, MAX_ITEMS));
      })
      .catch(() => {});
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="mb-8 text-center">
          <h2 className="heading-secondary">Recently Viewed</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
