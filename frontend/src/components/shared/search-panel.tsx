"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
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
      setTimeout(() => inputRef.current?.focus(), 100);
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
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products?search=${encodeURIComponent(query.trim())}&limit=8`);
        setResults(res.data.data || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

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
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={toggleSearch} />
      <div className="relative mx-auto max-w-2xl pt-20 px-4">
        <div className="rounded-2xl bg-white shadow-2xl">
          <form onSubmit={handleSearchAll} className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="flex-1 bg-transparent text-lg text-gray-900 outline-none placeholder:text-gray-400"
            />
            {loading && <Loader2 className="h-5 w-5 animate-spin text-gray-400" />}
            <button type="button" onClick={toggleSearch} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
              <X className="h-5 w-5" />
            </button>
          </form>

          {query.trim() && !loading && results.length > 0 && (
            <div className="max-h-80 overflow-y-auto p-2">
              {results.map((product) => (
                <button
                  key={product._id}
                  onClick={() => handleSelect(product)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-gray-50"
                >
                  <img
                    src={product.images.find((i) => i.isPrimary)?.url || product.images[0]?.url || "/placeholder-book.svg"}
                    alt={product.name}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.brand}</p>
                  </div>
                  <span className="text-sm font-semibold text-primary">${product.price.toFixed(2)}</span>
                </button>
              ))}
              <button
                onClick={handleSearchAll}
                className="mt-1 w-full rounded-lg py-2.5 text-center text-sm font-medium text-accent hover:bg-gray-50"
              >
                View all results for &ldquo;{query}&rdquo;
              </button>
            </div>
          )}

          {query.trim() && !loading && results.length === 0 && (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-gray-500">No products found for &ldquo;{query}&rdquo;</p>
              <button
                onClick={handleSearchAll}
                className="mt-2 text-sm font-medium text-accent hover:underline"
              >
                Search all products
              </button>
            </div>
          )}

          {!query.trim() && (
            <div className="px-5 py-6 text-center">
              <p className="text-sm text-gray-400">Type to search products...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
