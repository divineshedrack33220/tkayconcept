"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ChevronDown, BookOpen, Shirt, Gamepad2, Gem, Heart, Headphones } from "lucide-react";
import { ProductCard } from "@/components/shop/product-card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollReveal, ScrollRevealStagger, StaggerItem } from "@/components/ui/scroll-reveal";
import api from "@/lib/api";
import type { Product, Category, PaginatedResponse } from "@/types";

const SORT_OPTIONS = [
  { value: "-createdAt", label: "Newest" },
  { value: "price", label: "Price: Low to High" },
  { value: "-price", label: "Price: High to Low" },
  { value: "-averageRating", label: "Top Rated" },
];

const CATEGORY_META: Record<string, {
  title: string;
  description: string;
  gradient: string;
  icon: React.ElementType;
}> = {
  books: {
    title: "Books",
    description: "Faith-driven reads that challenge, inspire, and equip you for your purpose.",
    gradient: "from-amber-600 via-amber-700 to-orange-800",
    icon: BookOpen,
  },
  games: {
    title: "Games",
    description: "Board games and card games built for connection, laughter, and meaningful moments.",
    gradient: "from-violet-600 via-purple-700 to-indigo-800",
    icon: Gamepad2,
  },
  apparel: {
    title: "Apparel",
    description: "Wear your identity. Bold designs for those who refuse to blend in.",
    gradient: "from-rose-600 via-pink-700 to-red-800",
    icon: Shirt,
  },
  merchandise: {
    title: "Merchandise",
    description: "Premium accessories and lifestyle products for the faith-driven community.",
    gradient: "from-emerald-600 via-teal-700 to-cyan-800",
    icon: Gem,
  },
  devotionals: {
    title: "Devotionals",
    description: "Daily devotionals and journals to deepen your spiritual journey.",
    gradient: "from-sky-600 via-blue-700 to-indigo-800",
    icon: Heart,
  },
  accessories: {
    title: "Accessories",
    description: "Complete your look with curated accessories that speak to your identity.",
    gradient: "from-slate-600 via-gray-700 to-zinc-800",
    icon: Headphones,
  },
};

const DEFAULT_META = {
  title: "Collection",
  description: "Explore our curated collections.",
  gradient: "from-gray-600 via-gray-700 to-gray-800",
  icon: Gem,
};

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const categorySlug = params.category as string;
  const meta = CATEGORY_META[categorySlug] || { ...DEFAULT_META, title: categorySlug };
  const Icon = meta.icon;

  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState(searchParams.get("sort") || "-createdAt");
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      p.set("category", categorySlug);
      p.set("sort", sort);
      p.set("page", page.toString());
      p.set("limit", "12");

      const res = await api.get(`/products?${p.toString()}`);
      const data: PaginatedResponse<Product> = res.data;
      setProducts(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [categorySlug, sort, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await api.get(`/categories/${categorySlug}`);
        setCategory(res.data.data);
      } catch {
        // silent
      }
    };
    fetchCategory();
  }, [categorySlug]);

  return (
    <div>
      {/* Hero Banner */}
      <section className={`relative overflow-hidden bg-gradient-to-br ${meta.gradient} py-12 sm:py-20`}>
        <div className="absolute inset-0">
          <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="container-custom relative z-10">
          <nav className="mb-4 sm:mb-6 flex items-center gap-2 text-xs sm:text-sm text-white/60">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/shop" className="hover:text-white transition-colors">Shop</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white font-medium">{meta.title}</span>
          </nav>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
              <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold text-white">{meta.title}</h1>
              <p className="mt-1 max-w-lg text-xs sm:text-sm text-white/70">{meta.description}</p>
            </div>
          </div>

          <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-white/50">
            {total} {total === 1 ? "product" : "products"}
          </p>
        </div>
      </section>

      {/* Products */}
      <div className="section-padding container-custom">
        {/* Sort */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/shop"
            className="text-sm font-medium text-accent hover:text-accent-dark"
          >
            ← View All Products
          </Link>

          <div className="relative">
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-3 pr-8 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-gray-100 bg-white p-3">
                <Skeleton className="mb-3 aspect-square w-full rounded-lg" />
                <Skeleton className="mb-2 h-3 w-16" />
                <Skeleton className="mb-1 h-4 w-3/4" />
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
            <p className="mb-2 text-gray-500">No products in this category yet</p>
            <Link href="/shop" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-light active:scale-[0.98]">
              Browse All Products
            </Link>
          </div>
        ) : (
          <>
            <ScrollRevealStagger className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <StaggerItem key={product._id}>
                  <ProductCard product={product} />
                </StaggerItem>
              ))}
            </ScrollRevealStagger>

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              className="mt-8"
            />
          </>
        )}
      </div>
    </div>
  );
}
