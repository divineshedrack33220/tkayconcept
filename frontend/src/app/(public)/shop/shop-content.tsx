"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shop/product-card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import type { Product, PaginatedResponse } from "@/types";

const SORT_OPTIONS = [
  { value: "-createdAt", label: "Newest" },
  { value: "createdAt", label: "Oldest" },
  { value: "price", label: "Price: Low to High" },
  { value: "-price", label: "Price: High to Low" },
  { value: "-averageRating", label: "Top Rated" },
  { value: "-totalReviews", label: "Most Reviewed" },
];

const PRICE_RANGES = [
  { label: "All Prices", min: 0, max: 0 },
  { label: "Under $15", min: 0, max: 15 },
  { label: "$15 - $25", min: 15, max: 25 },
  { label: "$25 - $50", min: 25, max: 50 },
  { label: "Over $50", min: 50, max: 999 },
];

export default function ShopContent() {
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [brand, setBrand] = useState(searchParams.get("brand") || "");
  const [priceRange, setPriceRange] = useState(
    searchParams.get("minPrice") && searchParams.get("maxPrice")
      ? `${searchParams.get("minPrice")}-${searchParams.get("maxPrice")}`
      : "0-0"
  );
  const [sort, setSort] = useState(searchParams.get("sort") || "-createdAt");
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (brand) params.set("brand", brand);
      if (search) params.set("search", search);
      params.set("sort", sort);
      params.set("page", page.toString());
      params.set("limit", "12");

      const [minPrice, maxPrice] = priceRange.split("-").map(Number);
      if (minPrice > 0) params.set("minPrice", minPrice.toString());
      if (maxPrice > 0) params.set("maxPrice", maxPrice.toString());

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
  }, [category, brand, search, sort, page, priceRange]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setBrand("");
    setPriceRange("0-0");
    setSort("-createdAt");
    setPage(1);
  };

  const hasActiveFilters = category || brand || priceRange !== "0-0" || search;

  return (
    <div className="section-padding container-custom">
      {/* Header */}
      <div className="mb-8">
        <h1 className="heading-primary mb-2">Shop</h1>
        <p className="text-gray-600">
          {total} {total === 1 ? "product" : "products"} found
        </p>
      </div>

      {/* Search + Filters Bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearch} className="flex gap-2 sm:max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>
          <Button variant="primary" type="submit" size="md">
            Search
          </Button>
        </form>

        <div className="flex items-center gap-3">
          <Button
            variant={showFilters ? "primary" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>

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
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">Active:</span>
          {search && (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
              &quot;{search}&quot;
              <button onClick={() => setSearch("")}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {category && (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent capitalize">
              {category}
              <button onClick={() => setCategory("")}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {brand && (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
              {brand}
              <button onClick={() => setBrand("")}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {priceRange !== "0-0" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
              {PRICE_RANGES.find((r) => `${r.min}-${r.max}` === priceRange)
                ?.label || "Price"}
              <button onClick={() => setPriceRange("0-0")}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          <button
            onClick={clearFilters}
            className="text-xs text-gray-500 underline hover:text-gray-700"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Filter Sidebar (collapsible) */}
      {showFilters && (
        <div className="mb-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <h3 className="mb-3 text-sm font-semibold text-primary">Category</h3>
              <div className="space-y-2">
                <button
                  onClick={() => { setCategory(""); setPage(1); }}
                  className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    !category ? "bg-accent/10 text-accent font-medium" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  All Categories
                </button>
                {PRODUCT_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { setCategory(cat); setPage(1); }}
                    className={`block w-full rounded-lg px-3 py-2 text-left text-sm capitalize transition-colors ${
                      category === cat ? "bg-accent/10 text-accent font-medium" : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold text-primary">Price Range</h3>
              <div className="space-y-2">
                {PRICE_RANGES.map((range) => (
                  <button
                    key={range.label}
                    onClick={() => { setPriceRange(`${range.min}-${range.max}`); setPage(1); }}
                    className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      priceRange === `${range.min}-${range.max}` ? "bg-accent/10 text-accent font-medium" : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold text-primary">Brand</h3>
              <div className="space-y-2">
                {["TKAYKONCEPTS", "Rooted Identity"].map((b) => (
                  <button
                    key={b}
                    onClick={() => { setBrand(brand === b ? "" : b); setPage(1); }}
                    className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      brand === b ? "bg-accent/10 text-accent font-medium" : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-100 bg-white p-3">
              <Skeleton className="mb-3 aspect-square w-full rounded-lg" />
              <Skeleton className="mb-2 h-3 w-16" />
              <Skeleton className="mb-1 h-4 w-3/4" />
              <Skeleton className="mb-2 h-3 w-full" />
              <Skeleton className="h-5 w-20" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
          <Search className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="mb-2 text-gray-500">No products found</p>
          <p className="mb-4 text-sm text-gray-400">Try adjusting your filters or search</p>
          <Button variant="outline" size="sm" onClick={clearFilters}>Clear Filters</Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} className="mt-8" />
        </>
      )}
    </div>
  );
}
