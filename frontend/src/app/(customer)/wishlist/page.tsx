"use client";

import { useEffect, useState, useCallback } from "react";
import { useSafeUser } from "@/lib/safe-clerk";
import Link from "next/link";
import { User, MapPin, Package, Heart, Trash2, ShoppingBag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthenticatedApi } from "@/hooks/useAuthenticatedApi";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import type { Product } from "@/types";
import { optImg } from "@/lib/opt-img";

export default function WishlistPage() {
  const { isSignedIn } = useSafeUser();
  const authApi = useAuthenticatedApi();
  const items = useWishlistStore((s) => s.items);
  const setItems = useWishlistStore((s) => s.setItems);
  const removeItem = useWishlistStore((s) => s.removeItem);
  const addItemToCart = useCartStore((s) => s.addItem);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  const fetchWishlist = useCallback(async () => {
    if (!isSignedIn) return;
    setLoading(true);
    try {
      const res = await authApi.get("/wishlist");
      setItems(res.data.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [isSignedIn]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleRemove = async (productId: string) => {
    setRemoving(productId);
    try {
      await authApi.delete(`/wishlist/${productId}`);
      removeItem(productId);
      toast.success("Removed from wishlist");
    } catch {
      toast.error("Failed to remove");
    } finally {
      setRemoving(null);
    }
  };

  const handleAddToCart = (product: Product) => {
    addItemToCart(product, 1);
    toast.success("Added to cart");
  };

  if (!isSignedIn) {
    return (
      <div className="section-padding container-custom">
        <div className="mx-auto max-w-md text-center">
          <h1 className="heading-secondary mb-4">Sign In Required</h1>
          <Link href="/sign-in"><Button variant="primary">Sign In</Button></Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: "Profile", href: "/account", icon: User },
    { label: "Addresses", href: "/account/addresses", icon: MapPin },
    { label: "Orders", href: "/orders", icon: Package },
    { label: "Wishlist", href: "/wishlist", icon: Heart, active: true },
  ];

  return (
    <div className="section-padding container-custom">
      <div className="mx-auto max-w-4xl">
        <h1 className="heading-secondary mb-8">My Wishlist</h1>
        <div className="grid gap-8 md:grid-cols-[240px_1fr]">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  item.active ? "bg-accent/10 text-accent" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div>
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-gray-100 bg-white p-4">
                    <Skeleton className="mb-3 aspect-square w-full rounded-lg" />
                    <Skeleton className="mb-2 h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-12 text-center">
                <Heart className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                <p className="mb-2 text-gray-500">Your wishlist is empty</p>
                <p className="mb-4 text-sm text-gray-400">Save items you love to your wishlist.</p>
                <Link href="/shop"><Button variant="accent" size="sm">Explore Products</Button></Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {items.map((product) => {
                  const image = optImg(product.images?.find((img) => img.isPrimary)?.url || product.images?.[0]?.url || "", 400, 400);
                  return (
                    <div key={product._id} className="group rounded-xl border border-gray-100 bg-white p-4">
                      <Link href={`/shop/${product.category?.slug || "shop"}/${product._id}`}>
                        <div className="mb-3 aspect-square overflow-hidden rounded-lg bg-gray-50">
                          {image ? (
                            <img src={image} alt={product.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-gray-300">
                              <ShoppingBag className="h-12 w-12" />
                            </div>
                          )}
                        </div>
                      </Link>
                      <h3 className="mb-1 text-sm font-medium text-gray-900 line-clamp-2">{product.name}</h3>
                      <p className="mb-3 text-sm font-semibold text-accent">${product.price.toFixed(2)}</p>
                      <div className="flex gap-2">
                        <Button variant="accent" size="sm" className="flex-1" onClick={() => handleAddToCart(product)}>
                          <ShoppingBag className="mr-1 h-3 w-3" /> Add to Cart
                        </Button>
                        <button
                          onClick={() => handleRemove(product._id)}
                          disabled={removing === product._id}
                          className="rounded-lg border border-gray-200 p-2 text-gray-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                        >
                          {removing === product._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
