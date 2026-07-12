"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shop/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import type { Product } from "@/types";

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/products/featured");
        setProducts(res.data.data);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <section className="section-padding">
        <div className="container-custom">
          <div className="mb-12 text-center">
            <Skeleton className="mx-auto mb-3 h-8 w-48" />
            <Skeleton className="mx-auto h-4 w-64" />
          </div>
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
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="section-padding">
      <div className="container-custom">
        <div className="mb-12 text-center">
          <h2 className="heading-secondary">Featured Products</h2>
          <p className="mt-3 text-gray-600">Our most loved items</p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/shop">
            <Button variant="secondary" size="lg">
              View All Products
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
