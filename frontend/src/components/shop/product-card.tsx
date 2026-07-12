"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, Package, Heart, Eye, Zap } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
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
  const [isHovered, setIsHovered] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    if (!isSignedIn) return;
    authApi.get(`/wishlist/check/${product._id}`)
      .then((res) => setIsWishlisted(res.data.data?.isWishlisted ?? res.data.isWishlisted))
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

  const images = product.images || [];
  const primaryImage =
    images.find((img) => img.isPrimary)?.url ||
    images[0]?.url ||
    "/placeholder-book.svg";
  const secondImage = images.length > 1 ? images[1]?.url : null;

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
    setAddedToCart(true);
    toast.success(`${product.name} added to cart!`);
    setTimeout(() => setAddedToCart(false), 1500);
  };

  return (
    <Link
      href={`/shop/${product.category?.slug}/${product._id}`}
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:shadow-gray-200/50 group-hover:-translate-y-1">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          {imgError ? (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent/5 to-primary/5">
              <Package className="h-12 w-12 text-gray-300" />
            </div>
          ) : (
            <>
              <img
                src={primaryImage}
                alt={product.name}
                onError={() => setImgError(true)}
                className={`h-full w-full object-cover transition-all duration-500 ${
                  isHovered && secondImage
                    ? "scale-110 opacity-0"
                    : "scale-100 opacity-100 group-hover:scale-105"
                }`}
              />
              {secondImage && (
                <img
                  src={secondImage}
                  alt={product.name}
                  className={`absolute inset-0 h-full w-full object-cover transition-all duration-500 ${
                    isHovered ? "scale-105 opacity-100" : "scale-100 opacity-0"
                  }`}
                />
              )}
            </>
          )}

          {/* Badges */}
          <div className="absolute left-3 top-3 flex flex-col gap-1.5 z-10">
            {hasDiscount && (
              <span className="rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                -{discountPercent}%
              </span>
            )}
            {product.isNewArrival && (
              <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                New
              </span>
            )}
            {product.isBestSeller && (
              <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                Best Seller
              </span>
            )}
          </div>

          {/* Quick actions */}
          <div className={`absolute right-3 top-3 z-10 flex flex-col gap-2 transition-all duration-300 ${
            isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
          }`}>
            <button
              onClick={handleToggleWishlist}
              className={`flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg transition-all hover:scale-110 ${
                isWishlisted ? "text-red-500" : "text-gray-600 hover:text-red-500"
              }`}
              title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? "fill-red-500" : ""}`} />
            </button>
            <button
              onClick={handleAddToCart}
              className={`flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-all hover:scale-110 ${
                addedToCart
                  ? "bg-emerald-500 text-white"
                  : "bg-white text-gray-600 hover:bg-accent hover:text-white"
              }`}
              title="Add to cart"
            >
              {addedToCart ? (
                <Zap className="h-4 w-4" />
              ) : (
                <ShoppingBag className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Quick view bar */}
          <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4 transition-all duration-300 ${
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}>
            <div className="flex items-center justify-center gap-1 text-sm font-medium text-white">
              <Eye className="h-4 w-4" />
              Quick View
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-accent">
            {product.brand}
          </p>
          <h3 className="mb-1 text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-accent transition-colors">
            {product.name}
          </h3>
          {product.shortDescription && (
            <p className="mb-2 text-xs text-gray-500 line-clamp-1">
              {product.shortDescription}
            </p>
          )}

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
