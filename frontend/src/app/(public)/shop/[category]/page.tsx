"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Loader2, Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shop/product-card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import type { Product, Category, PaginatedResponse } from "@/types";

const SORT_OPTIONS = [
  { value: "-createdAt", label: "Newest" },
  { value: "price", label: "Price: Low to High" },
  { value: "-price", label: "Price: High to Low" },
  { value: "-averageRating", label: "Top Rated" },
];

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const categorySlug = params.category as string;

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
      const params = new URLSearchParams();
      params.set("category", categorySlug);
      params.set("sort", sort);
      params.set("page", page.toString());
      params.set("limit", "12");

      const res = await api.get(`/products?${params.toString()}`);
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
    <div className="section-padding container-custom">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-accent">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/shop" className="hover:text-accent">
          Shop
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="capitalize text-gray-900">{categorySlug}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="heading-primary mb-2 capitalize">{categorySlug}</h1>
        {category?.description && (
          <p className="text-gray-600">{category.description}</p>
        )}
        <p className="text-sm text-gray-500">
          {total} {total === 1 ? "product" : "products"}
        </p>
      </div>

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
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
          <p className="mb-2 text-gray-500">No products in this category yet</p>
          <Link href="/shop">
            <Button variant="outline" size="sm">
              Browse All Products
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            className="mt-8"
          />
        </>
      )}
    </div>
  );
}
