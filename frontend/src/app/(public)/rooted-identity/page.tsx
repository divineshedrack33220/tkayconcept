"use client";

import { useEffect, useState } from "react";
import { Package, ArrowRight } from "lucide-react";
import Link from "next/link";
import { ProductCard } from "@/components/shop/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ScrollReveal, ScrollRevealStagger, StaggerItem } from "@/components/ui/scroll-reveal";
import api from "@/lib/api";
import type { Product } from "@/types";

export default function RootedIdentityPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/products?brand=Rooted+Identity&limit=12");
        setProducts(res.data.data);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-primary py-24 text-white">
        <div className="container-custom text-center">
          <p className="mb-3 text-sm font-semibold tracking-widest text-accent uppercase">
            Collection
          </p>
          <h1 className="mb-4 text-4xl font-bold md:text-5xl lg:text-6xl">
            Rooted Identity
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-300">
            Faith. Culture. Identity. Wear your roots with pride. Each piece is a
            declaration of who you are and whose you are.
          </p>
          <div className="flex justify-center gap-3">
            <a href="#products" className="btn-primary">
              Shop Collection
            </a>
            <a href="#manifesto" className="rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10">
              Our Story
            </a>
          </div>
        </div>
      </section>

      {/* Products — at the top */}
      <section id="products" className="section-padding container-custom">
        <h2 className="heading-secondary mb-8 text-center">The Collection</h2>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-gray-100 bg-white p-3">
                <Skeleton className="mb-3 aspect-square w-full rounded-lg" />
                <Skeleton className="mb-2 h-4 w-3/4" />
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
            <Package className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <h3 className="mb-2 text-lg font-semibold text-gray-700">Collection Coming Soon</h3>
            <p className="mb-6 max-w-md mx-auto text-sm text-gray-500">
              We&apos;re curating something special for the Rooted Identity collection.
              Stay connected to be the first to know when it launches.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link href="/contact">
                <Button variant="accent">Get Notified</Button>
              </Link>
              <Link href="/shop">
                <Button variant="ghost" className="flex items-center gap-1">
                  Browse All Products <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <ScrollRevealStagger className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <StaggerItem key={product._id}>
                <ProductCard product={product} />
              </StaggerItem>
            ))}
          </ScrollRevealStagger>
        )}
      </section>

      {/* Manifesto — below products */}
      <section id="manifesto" className="section-padding bg-accent/5">
        <div className="container-custom text-center">
          <ScrollReveal>
            <h2 className="heading-secondary mb-6">The Rooted Identity Manifesto</h2>
            <div className="mx-auto max-w-2xl space-y-4 text-gray-600">
              <p>
                We are rooted in Christ. Our identity is not defined by the world, but
                by the One who created us. We wear our faith boldly — not as a fashion
                statement, but as a declaration of purpose.
              </p>
              <p>
                Rooted Identity is for those who know who they are. For those who walk
                in faith, live with purpose, and refuse to be defined by anything less
                than God&apos;s truth.
              </p>
              <p className="font-semibold text-primary">
                Be Rooted. Be Bold. Be You.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
