"use client";

import { useEffect, useState, useCallback } from "react";
import { Palette, Loader2, Eye, EyeOff } from "lucide-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthenticatedApi } from "@/hooks/useAuthenticatedApi";
import { toast } from "sonner";
import type { Product } from "@/types";

export default function AdminRootedIdentityPage() {
  const authApi = useAuthenticatedApi();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await authApi.get("/products?category=rooted-identity&limit=50");
      setProducts(res.data.data || []);
    } catch { /* */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const toggleActive = async (p: Product) => {
    try {
      await authApi.put(`/products/${p._id}`, { isActive: !p.isActive });
      setProducts((prev) => prev.map((x) => x._id === p._id ? { ...x, isActive: !x.isActive } : x));
      toast.success(p.isActive ? "Product hidden" : "Product shown");
    } catch { toast.error("Failed to update"); }
  };

  const toggleFeatured = async (p: Product) => {
    try {
      await authApi.put(`/products/${p._id}`, { isFeatured: !p.isFeatured });
      setProducts((prev) => prev.map((x) => x._id === p._id ? { ...x, isFeatured: !x.isFeatured } : x));
    } catch { toast.error("Failed to update"); }
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Rooted Identity</h1>
          <p className="mt-1 text-gray-500">Manage the Rooted Identity sub-brand products</p>
        </div>
        <a href="/admin/products/new">
          <Button variant="accent">Add Product</Button>
        </a>
      </div>

      <div className="mb-6 rounded-xl border border-accent/20 bg-accent/5 p-4">
        <p className="text-sm text-gray-700">
          <strong>Rooted Identity</strong> is your faith-driven apparel and merchandise sub-brand.
          Products in this category are featured on the <a href="/rooted-identity" className="font-medium text-accent hover:underline">/rooted-identity</a> page.
          Create products with category &quot;Rooted Identity&quot; to see them here.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4">
              <Skeleton className="h-16 w-16 rounded-lg" />
              <div className="flex-1"><Skeleton className="mb-2 h-5 w-40" /><Skeleton className="h-3 w-60" /></div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
          <Palette className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p className="mb-2 text-lg font-medium text-gray-500">No Rooted Identity products</p>
          <p className="text-sm text-gray-400">Create products with the &quot;Rooted Identity&quot; category to see them here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((p) => (
            <div key={p._id} className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 hover:shadow-sm">
              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                {p.images?.[0]?.url ? (
                  <img src={p.images[0].url} alt={p.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-accent/10 to-primary/10">
                    <Palette className="h-6 w-6 text-accent" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{p.name}</h3>
                <p className="text-sm text-gray-500">${p.price.toFixed(2)} &middot; {p.stock} in stock</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleFeatured(p)}
                  className={`rounded p-1.5 ${p.isFeatured ? "text-amber-500 bg-amber-50" : "text-gray-300 hover:bg-gray-100"}`}
                  title="Toggle featured">
                  <Palette className="h-4 w-4" />
                </button>
                <button onClick={() => toggleActive(p)}
                  className={`rounded p-1.5 ${p.isActive ? "text-green-500 hover:bg-green-50" : "text-gray-300 hover:bg-gray-100"}`}
                  title="Toggle visibility">
                  {p.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
