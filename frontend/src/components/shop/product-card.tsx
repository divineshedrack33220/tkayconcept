"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, Package, Heart } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Rating } from "@/components/ui/rating";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useAuthenticatedApi } from "@/hooks/useAuthenticatedApi";
import { toast } from "sonner";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [imgError, setImgError] = useState(false);
  const { isSignedIn } = useAuth();
  const authApi = useAuthenticatedApi();
  const wishlistHasItem = useWishlistStore((s) => s.hasItem);
  const wishlistAddItem = useWishlistStore((s) => s.addItem);
  const wishlistRemoveItem = useWishlistStore((s) => s.removeItem);
  const [isWishlisted, setIsWishlisted] = useState(() => wishlistHasItem(product._id));

  useEffect(() => {
    if (!isSignedIn) return;
    authApi.get(`/wishlist/check/${product._id}`)
      .then((res) => setIsWishlisted(res.data.isWishlisted))
      .catch(() => {});
  }, [product._id, isSignedIn]);

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isSignedIn) {
      toast.error("Sign in to add to wishlist");
      return;
    }
    try {
      if (isWishlisted) {
        await authApi.delete(`/wishlist/${product._id}`);
        wishlistRemoveItem(product._id);
        setIsWishlisted(false);
        toast.success("Removed from wishlist");
      } else {
        await authApi.post(`/wishlist/${product._id}`);
        wishlistAddItem(product);
        setIsWishlisted(true);
        toast.success("Added to wishlist!");
      }
    } catch {
      toast.error("Failed to update wishlist");
    }
  };

  const image =
    product.images.find((img) => img.isPrimary)?.url ||
    product.images[0]?.url ||
    "/placeholder-book.svg";

  const hasDiscount =
    product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.compareAtPrice! - product.price) / product.compareAtPrice!) *
          100
      )
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <Link
      href={`/shop/${product.category?.slug}/${product._id}`}
      className="group block"
    >
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          {imgError ? (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent/5 to-primary/5">
              <Package className="h-12 w-12 text-gray-300" />
            </div>
          ) : (
            <img
              src={image}
              alt={product.name}
              onError={() => setImgError(true)}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )}

          {/* Badges */}
          <div className="absolute left-3 top-3 flex flex-col gap-1">
            {hasDiscount && (
              <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                -{discountPercent}%
              </span>
            )}
            {product.isNewArrival && (
              <span className="rounded-full bg-green-500 px-2 py-0.5 text-xs font-bold text-white">
                New
              </span>
            )}
            {product.isBestSeller && (
              <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-white">
                Best Seller
              </span>
            )}
          </div>

          {/* Quick actions */}
          <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={handleToggleWishlist}
              className={`flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md transition-colors ${
                isWishlisted ? "text-red-500" : "text-gray-600 hover:text-red-500"
              }`}
              title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? "fill-red-500" : ""}`} />
            </button>
            <button
              onClick={handleAddToCart}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md transition-colors hover:bg-accent hover:text-white"
              title="Add to cart"
            >
              <ShoppingBag className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="mb-1 text-xs font-medium text-accent">
            {product.brand}
          </p>
          <h3 className="mb-1 text-sm font-semibold text-primary line-clamp-1 group-hover:text-accent">
            {product.name}
          </h3>
          <p className="mb-2 text-xs text-gray-500 line-clamp-1">
            {product.shortDescription}
          </p>

          <div className="flex items-center gap-2">
            <Rating value={product.averageRating} size="sm" />
            <span className="text-xs text-gray-400">
              ({product.totalReviews})
            </span>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-lg font-bold text-primary">
              ${product.price.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through">
                ${product.compareAtPrice!.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
