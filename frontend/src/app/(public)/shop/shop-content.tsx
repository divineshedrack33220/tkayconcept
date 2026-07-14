"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  Search,
  LayoutGrid,
  Rows3,
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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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
      <div className="mb-5 sm:mb-8">
        <h1 className="heading-primary mb-1 sm:mb-2">Shop</h1>
        <p className="text-xs sm:text-sm text-gray-600">
          {total} {total === 1 ? "product" : "products"} found
        </p>
      </div>

      {/* Search + Filters Bar */}
      <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:gap-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="input-field pl-10 !py-2.5 text-[14px] sm:text-sm"
              inputMode="search"
              enterKeyHint="search"
            />
          </div>
          <button type="submit" className="touch-feedback rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white active:bg-primary-light" style={{ minHeight: 44 }}>
            Search
          </button>
        </form>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`touch-feedback flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-[13px] sm:text-sm font-medium transition-all active:scale-95 ${
              showFilters ? "border-accent bg-accent/10 text-accent" : "border-gray-200 text-gray-600 active:bg-gray-50"
            }`}
            style={{ minHeight: 40 }}
          >
            <SlidersHorizontal className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 h-4 w-4 flex items-center justify-center rounded-full bg-accent text-[9px] text-white">
                {[category, brand, priceRange !== "0-0", search].filter(Boolean).length}
              </span>
            )}
          </button>

          <div className="hidden sm:flex items-center rounded-xl border border-gray-200">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex h-9 w-9 items-center justify-center rounded-l-xl transition-colors ${
                viewMode === "grid" ? "bg-primary text-white" : "text-gray-400 hover:bg-gray-50"
              }`}
              title="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex h-9 w-9 items-center justify-center rounded-r-xl transition-colors ${
                viewMode === "list" ? "bg-primary text-white" : "text-gray-400 hover:bg-gray-50"
              }`}
              title="List view"
            >
              <Rows3 className="h-4 w-4" />
            </button>
          </div>

          <div className="relative ml-auto">
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-3 pr-8 text-[13px] sm:text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              style={{ minHeight: 40 }}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
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
        <div className="mb-5 sm:mb-6 overflow-hidden rounded-xl border border-gray-100/80 bg-white p-4 sm:p-6 elevation-2 animate-slide-in-up">
          <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-3">
            <div>
              <h3 className="mb-2.5 sm:mb-3 text-[13px] sm:text-sm font-semibold text-primary">Category</h3>
              <div className="flex flex-wrap gap-1.5 sm:space-y-2 sm:flex-col">
                <button
                  onClick={() => { setCategory(""); setPage(1); }}
                  className={`touch-feedback rounded-lg px-3 py-2 text-left text-[13px] sm:text-sm transition-all ${
                    !category ? "bg-accent/10 text-accent font-medium" : "text-gray-600 active:bg-gray-50 hover:bg-gray-50"
                  }`}
                >
                  All Categories
                </button>
                {PRODUCT_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { setCategory(cat); setPage(1); }}
                    className={`touch-feedback rounded-lg px-3 py-2 text-left text-[13px] sm:text-sm capitalize transition-all ${
                      category === cat ? "bg-accent/10 text-accent font-medium" : "text-gray-600 active:bg-gray-50 hover:bg-gray-50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-2.5 sm:mb-3 text-[13px] sm:text-sm font-semibold text-primary">Price Range</h3>
              <div className="flex flex-wrap gap-1.5 sm:space-y-2 sm:flex-col">
                {PRICE_RANGES.map((range) => (
                  <button
                    key={range.label}
                    onClick={() => { setPriceRange(`${range.min}-${range.max}`); setPage(1); }}
                    className={`touch-feedback rounded-lg px-3 py-2 text-left text-[13px] sm:text-sm transition-all ${
                      priceRange === `${range.min}-${range.max}` ? "bg-accent/10 text-accent font-medium" : "text-gray-600 active:bg-gray-50 hover:bg-gray-50"
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-2.5 sm:mb-3 text-[13px] sm:text-sm font-semibold text-primary">Brand</h3>
              <div className="flex flex-wrap gap-1.5 sm:space-y-2 sm:flex-col">
                {["TKAYKONCEPTS", "Rooted Identity"].map((b) => (
                  <button
                    key={b}
                    onClick={() => { setBrand(brand === b ? "" : b); setPage(1); }}
                    className={`touch-feedback rounded-lg px-3 py-2 text-left text-[13px] sm:text-sm transition-all ${
                      brand === b ? "bg-accent/10 text-accent font-medium" : "text-gray-600 active:bg-gray-50 hover:bg-gray-50"
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
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-100/80 bg-white p-3">
              <Skeleton className="mb-3 aspect-square w-full rounded-lg" />
              <Skeleton className="mb-2 h-3 w-16" />
              <Skeleton className="mb-1 h-4 w-3/4" />
              <Skeleton className="mb-2 h-3 w-full" />
              <Skeleton className="h-5 w-20" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-12 sm:py-16 text-center">
          <Search className="mx-auto mb-3 h-8 w-8 sm:h-10 sm:w-10 text-gray-300" />
          <p className="mb-2 text-sm sm:text-base text-gray-500">No products found</p>
          <p className="mb-4 text-xs sm:text-sm text-gray-400">Try adjusting your filters or search</p>
          <button onClick={clearFilters} className="touch-feedback rounded-xl border border-gray-300 px-4 py-2.5 text-[13px] sm:text-sm font-medium text-gray-600 active:bg-gray-50" style={{ minHeight: 40 }}>
            Clear Filters
          </button>
        </div>
      ) : viewMode === "list" ? (
        <>
          <div className="space-y-2.5 sm:space-y-3">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} layout="list" />
            ))}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} className="mt-6 sm:mt-8" />
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} layout="grid" />
            ))}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} className="mt-6 sm:mt-8" />
        </>
      )}

      {/* Bottom padding for mobile fixed nav */}
      <div className="h-20 lg:hidden" />
    </div>
  );
}
