"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, Check, Plus } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import api from "@/lib/api";
import type { Product } from "@/types";

interface FrequentlyBoughtTogetherProps {
  currentProduct: Product;
}

export function FrequentlyBoughtTogether({ currentProduct }: FrequentlyBoughtTogetherProps) {
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    if (!currentProduct.category?._id) return;
    api.get(`/products?category=${currentProduct.category.slug}&limit=4&sort=-averageRating`)
      .then((res) => {
        const recs = (res.data.data || [])
          .filter((p: Product) => p._id !== currentProduct._id)
          .slice(0, 3);
        setSuggestions(recs);
        setSelected(new Set(recs.map((p: Product) => p._id)));
      })
      .catch(() => {});
  }, [currentProduct.category?._id, currentProduct.category?.slug, currentProduct._id]);

  const toggleItem = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const bundleItems = [currentProduct, ...suggestions.filter((s) => selected.has(s._id))];
  const bundlePrice = bundleItems.reduce((sum, p) => sum + p.price, 0);
  const bundleOriginal = bundleItems.reduce((sum, p) => sum + (p.compareAtPrice || p.price), 0);
  const hasSavings = bundleOriginal > bundlePrice;

  const addAllToCart = () => {
    bundleItems.forEach((p) => addItem(p));
    toast.success(`${bundleItems.length} items added to cart!`);
  };

  if (suggestions.length === 0) return null;

  return (
    <div className="mt-12 rounded-2xl border border-gray-100 bg-gradient-to-br from-accent/5 to-white p-6">
      <h3 className="mb-4 text-lg font-bold text-gray-900">Frequently Bought Together</h3>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        {/* Current product (always selected, no toggle) */}
        <div className="flex items-center gap-2 rounded-xl border border-accent/20 bg-white p-2 pr-3 shadow-sm">
          <div className="h-14 w-14 overflow-hidden rounded-lg bg-gray-50">
            <img
              src={currentProduct.images?.find((i) => i.isPrimary)?.url || currentProduct.images?.[0]?.url || "/placeholder-book.svg"}
              alt={currentProduct.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-900 line-clamp-1 max-w-[120px]">{currentProduct.name}</p>
            <p className="text-xs font-bold text-primary">{formatPrice(currentProduct.price)}</p>
          </div>
          <div className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white">
            <Check className="h-3 w-3" />
          </div>
        </div>

        {suggestions.map((s) => {
          const isActive = selected.has(s._id);
          return (
            <button
              key={s._id}
              onClick={() => toggleItem(s._id)}
              className={`flex items-center gap-2 rounded-xl border p-2 pr-3 shadow-sm transition-all ${
                isActive
                  ? "border-accent/20 bg-white"
                  : "border-gray-200 bg-gray-50 opacity-50"
              }`}
            >
              <div className="h-14 w-14 overflow-hidden rounded-lg bg-gray-50">
                <img
                  src={s.images?.find((i) => i.isPrimary)?.url || s.images?.[0]?.url || "/placeholder-book.svg"}
                  alt={s.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900 line-clamp-1 max-w-[120px]">{s.name}</p>
                <p className="text-xs font-bold text-primary">{formatPrice(s.price)}</p>
              </div>
              <div className={`ml-1 flex h-5 w-5 items-center justify-center rounded-full border transition-all ${
                isActive ? "border-accent bg-accent text-white" : "border-gray-300 bg-white"
              }`}>
                {isActive ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3 text-gray-400" />}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
        <div>
          <p className="text-xs text-gray-500">Bundle Price</p>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-primary">{formatPrice(bundlePrice)}</span>
            {hasSavings && (
              <span className="text-sm text-gray-400 line-through">{formatPrice(bundleOriginal)}</span>
            )}
          </div>
          {hasSavings && (
            <p className="mt-0.5 text-xs font-semibold text-emerald-600">
              You save {formatPrice(bundleOriginal - bundlePrice)}
            </p>
          )}
        </div>
        <Button variant="accent" onClick={addAllToCart}>
          <ShoppingBag className="mr-2 h-4 w-4" />
          Add {bundleItems.length} to Cart
        </Button>
      </div>
    </div>
  );
}
