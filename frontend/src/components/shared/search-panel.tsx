"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2, ArrowLeft } from "lucide-react";
import { useUIStore } from "@/stores/uiStore";
import api from "@/lib/api";
import type { Product } from "@/types";

export function SearchPanel() {
  const { isSearchOpen, toggleSearch } = useUIStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    let cancelled = false;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products?search=${encodeURIComponent(query.trim())}&limit=8`, { signal: controller.signal });
        if (!cancelled) setResults(res.data.data || []);
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);
    return () => { cancelled = true; clearTimeout(timer); controller.abort(); };
  }, [query]);

  useEffect(() => {
    if (!isSearchOpen) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [isSearchOpen]);

  const handleSelect = (product: Product) => {
    toggleSearch();
    router.push(`/shop/${product.category?.slug}/${product._id}`);
  };

  const handleSearchAll = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      toggleSearch();
      router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
    }
  };

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white sm:bg-transparent">
      {/* Backdrop on desktop */}
      <div className="hidden sm:block absolute inset-0 bg-black/40" onClick={toggleSearch} />

      {/* Mobile: full screen search. Desktop: floating panel */}
      <div className="sm:relative sm:mx-auto sm:max-w-2xl sm:pt-20 sm:px-4 h-full flex flex-col">
        <div className="bg-white sm:rounded-2xl sm:shadow-2xl flex-1 sm:flex-none flex flex-col overflow-hidden animate-slide-in-up sm:animate-scale-in">
          {/* Search input */}
          <form onSubmit={handleSearchAll} className="flex items-center gap-3 border-b border-gray-100 px-4 sm:px-5 py-3 sm:py-4 safe-area-top">
            <button type="button" onClick={toggleSearch} className="flex h-10 w-10 items-center justify-center rounded-full text-gray-600 active:bg-gray-100 sm:hidden touch-feedback">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <Search className="h-5 w-5 text-gray-400 hidden sm:block" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="flex-1 bg-transparent text-[16px] sm:text-lg text-gray-900 outline-none placeholder:text-gray-400"
              inputMode="search"
              enterKeyHint="search"
            />
            {loading && <Loader2 className="h-5 w-5 animate-spin text-gray-400" />}
            <button type="button" onClick={toggleSearch} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 active:bg-gray-200 hidden sm:flex touch-feedback">
              <X className="h-5 w-5" />
            </button>
          </form>

          {/* Results */}
          <div className="flex-1 overflow-y-auto scroll-y-momentum">
            {query.trim() && !loading && results.length > 0 && (
              <div className="p-2">
                {results.map((product) => (
                  <button
                    key={product._id}
                    onClick={() => handleSelect(product)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 active:bg-gray-50 touch-feedback text-left"
                  >
                    <img
                      src={product.images.find((i) => i.isPrimary)?.url || product.images[0]?.url || "/placeholder-book.svg"}
                      alt={product.name}
                      className="h-12 w-12 rounded-lg object-cover bg-gray-50"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] sm:text-sm font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-[12px] sm:text-xs text-gray-500">{product.brand}</p>
                    </div>
                    <span className="text-[14px] sm:text-sm font-semibold text-primary">${product.price.toFixed(2)}</span>
                  </button>
                ))}
                <button
                  onClick={handleSearchAll}
                  className="mt-1 w-full rounded-xl py-3 text-center text-[14px] sm:text-sm font-medium text-accent active:bg-gray-50 touch-feedback"
                >
                  View all results for &ldquo;{query}&rdquo;
                </button>
              </div>
            )}

            {query.trim() && !loading && results.length === 0 && (
              <div className="px-5 py-12 sm:py-8 text-center">
                <p className="text-[14px] sm:text-sm text-gray-500">No products found for &ldquo;{query}&rdquo;</p>
                <button
                  onClick={handleSearchAll}
                  className="mt-2 text-[14px] sm:text-sm font-medium text-accent active:underline"
                >
                  Search all products
                </button>
              </div>
            )}

            {!query.trim() && (
              <div className="px-5 py-12 sm:py-6 text-center">
                <p className="text-[14px] sm:text-sm text-gray-400">Type to search products...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
