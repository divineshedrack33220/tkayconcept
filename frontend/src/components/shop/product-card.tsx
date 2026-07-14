"use client";

import { memo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ShoppingBag, Package, Heart, Eye, Zap, Plus } from "lucide-react";
import { useSafeAuth } from "@/lib/safe-clerk";
import { Rating } from "@/components/ui/rating";
import { FlashSaleTimer } from "@/components/ui/flash-sale-timer";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useAuthenticatedApi } from "@/hooks/useAuthenticatedApi";
import { toast } from "sonner";
import { useTranslation } from "@/i18n";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  layout?: "grid" | "list";
}

const ProductCardInner = memo(function ProductCardInner({ product, layout = "grid" }: ProductCardProps) {
  const { t } = useTranslation();
  const addItem = useCartStore((s) => s.addItem);
  const [imgError, setImgError] = useState(false);
  const { isSignedIn } = useSafeAuth();
  const authApi = useAuthenticatedApi();
  const wishlistHasItem = useWishlistStore((s) => s.hasItem);
  const wishlistAddItem = useWishlistStore((s) => s.addItem);
  const wishlistRemoveItem = useWishlistStore((s) => s.removeItem);
  const [isWishlisted, setIsWishlisted] = useState(() => wishlistHasItem(product._id));
  const [isHovered, setIsHovered] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!isSignedIn) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    authApi.get(`/wishlist/check/${product._id}`, { signal: controller.signal })
      .then((res) => { if (!controller.signal.aborted) setIsWishlisted(res.data.data?.isWishlisted ?? res.data.isWishlisted); })
      .catch(() => {});
    return () => controller.abort();
  }, [product._id, isSignedIn]);

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isSignedIn) {
      toast.error(t("product.signInToWishlist"));
      return;
    }
    try {
      if (isWishlisted) {
        await authApi.delete(`/wishlist/${product._id}`);
        wishlistRemoveItem(product._id);
        setIsWishlisted(false);
        toast.success(t("product.removedFromWishlist"));
      } else {
        await authApi.post(`/wishlist/${product._id}`);
        wishlistAddItem(product);
        setIsWishlisted(true);
        toast.success(t("product.addedToWishlist"));
      }
    } catch {
      toast.error(t("product.wishlistError"));
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
    toast.success(t("product.addToCart") + "!");
    setTimeout(() => setAddedToCart(false), 1500);
  };

  if (layout === "list") {
    return (
      <Link
        href={`/shop/${product.category?.slug}/${product._id}`}
        className="group flex gap-3 sm:gap-4 overflow-hidden rounded-2xl border border-gray-100/80 bg-white p-3 elevation-1 touch-feedback sm:elevation-2"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-xl bg-gray-50 sm:h-40 sm:w-40">
          {imgError ? (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent/5 to-primary/5">
              <Package className="h-8 w-8 sm:h-10 sm:w-10 text-gray-300" />
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
          <div className="absolute left-1.5 top-1.5 z-10 flex flex-col gap-1 sm:left-2 sm:top-2">
            {hasDiscount && (
              <FlashSaleTimer discountPercent={discountPercent} endDate={product.saleEndDate} />
            )}
            {product.isNewArrival && (
              <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] sm:text-xs font-bold text-white shadow-sm">
                {t("product.new")}
              </span>
            )}
          </div>
          <button
            onClick={handleToggleWishlist}
            className={`absolute right-1.5 top-1.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition-all active:scale-90 ${
              isWishlisted ? "text-red-500" : "text-gray-500 active:text-red-500"
            }`}
          >
            <Heart className={`h-3.5 w-3.5 ${isWishlisted ? "fill-red-500" : ""}`} />
          </button>
        </div>
        <div className="flex min-w-0 flex-1 flex-col py-0.5">
          <p className="mb-0.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-accent">{product.brand}</p>
          <h3 className="mb-0.5 text-[13px] sm:text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-accent transition-colors">{product.name}</h3>
          {product.shortDescription && (
            <p className="mb-1.5 text-[11px] sm:text-xs text-gray-500 line-clamp-1 sm:line-clamp-2">{product.shortDescription}</p>
          )}
          <div className="flex items-center gap-1.5">
            <Rating value={product.averageRating} size="sm" />
            <span className="text-[10px] sm:text-xs text-gray-400">({product.totalReviews})</span>
          </div>
          <div className="mt-auto flex items-center justify-between pt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-bold text-primary">${product.price.toFixed(2)}</span>
              {hasDiscount && (
                <span className="text-xs sm:text-sm text-gray-400 line-through">${product.compareAtPrice!.toFixed(2)}</span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              className={`touch-feedback rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold transition-all ${
                addedToCart
                  ? "bg-emerald-500 text-white"
                  : "bg-primary text-white active:bg-primary-light"
              }`}
              style={{ minHeight: 36 }}
            >
              {addedToCart ? t("product.added") : t("product.addToCart")}
            </button>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/shop/${product.category?.slug}/${product._id}`}
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="overflow-hidden rounded-2xl border border-gray-100/80 bg-white elevation-1 transition-all duration-300 group-hover:elevation-3 group-hover:-translate-y-0.5 sm:group-hover:-translate-y-1">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          {imgError ? (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent/5 to-primary/5">
              <Package className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300" />
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
          <div className="absolute left-1.5 top-1.5 z-10 flex max-w-[calc(100%-48px)] flex-col gap-1 sm:left-3 sm:top-3 sm:max-w-[calc(100%-24px)]">
            {hasDiscount && (
              <FlashSaleTimer discountPercent={discountPercent} endDate={product.saleEndDate} />
            )}
            {product.isNewArrival && (
              <span className="rounded-full bg-emerald-500 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-bold text-white shadow-sm">
                {t("product.new")}
              </span>
            )}
            {product.isBestSeller && (
              <span className="rounded-full bg-accent px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-bold text-white shadow-sm">
                {t("product.bestSeller")}
              </span>
            )}
          </div>

          {/* Wishlist button - always visible on mobile, hover on desktop */}
          <button
            onClick={handleToggleWishlist}
            className={`absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition-all active:scale-90 sm:h-10 sm:w-10 sm:opacity-0 sm:group-hover:opacity-100 sm:translate-x-0 ${
              isWishlisted ? "text-red-500 sm:text-red-500" : "text-gray-500 active:text-red-500 sm:text-gray-600 sm:hover:text-red-500"
            } ${!isHovered ? "sm:translate-x-1" : ""}`}
            title={isWishlisted ? t("product.removeFromWishlist") : t("product.addToWishlist")}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? "fill-red-500" : ""}`} />
          </button>

          {/* Add to cart button - desktop only hover */}
          <button
            onClick={handleAddToCart}
            className={`absolute right-2 top-12 z-10 hidden sm:flex h-10 w-10 items-center justify-center rounded-full shadow-sm backdrop-blur-sm transition-all hover:scale-110 ${
              addedToCart
                ? "bg-emerald-500 text-white"
                : "bg-white text-gray-600 hover:bg-accent hover:text-white"
            } ${!isHovered ? "translate-x-1 opacity-0 group-hover:opacity-100" : "opacity-100 translate-x-0"}`}
            title={t("shop.addToCart")}
          >
            <ShoppingBag className="h-4 w-4" />
          </button>

          {/* Quick view bar - only on desktop hover */}
          <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3 sm:p-4 transition-all duration-300 hidden sm:block ${
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}>
            <div className="flex items-center justify-center gap-1 text-sm font-medium text-white">
              <Eye className="h-4 w-4" />
              {t("shop.quickView")}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-3 sm:p-4">
          <p className="mb-0.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-accent">
            {product.brand}
          </p>
          <h3 className="mb-0.5 text-[13px] sm:text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-accent transition-colors">
            {product.name}
          </h3>
          {product.shortDescription && (
            <p className="mb-1.5 text-[11px] sm:text-xs text-gray-500 line-clamp-1">
              {product.shortDescription}
            </p>
          )}

          <div className="flex items-center gap-1.5">
            <Rating value={product.averageRating} size="sm" />
            <span className="text-[10px] sm:text-xs text-gray-400">
              ({product.totalReviews})
            </span>
          </div>

          <div className="mt-2 sm:mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-bold text-primary">
                ${product.price.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-[11px] sm:text-sm text-gray-400 line-through">
                  ${product.compareAtPrice!.toFixed(2)}
                </span>
              )}
            </div>
            {/* Mobile add-to-cart button */}
            <button
              onClick={handleAddToCart}
              className={`mt-2 w-full flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-[13px] font-semibold transition-all active:scale-[0.98] sm:hidden touch-feedback ${
                addedToCart
                  ? "bg-emerald-500 text-white"
                  : "bg-primary text-white active:bg-primary-light"
              }`}
              style={{ minHeight: 40 }}
            >
              {addedToCart ? (
                <>
                  <Zap className="h-3.5 w-3.5" />
                  {t("product.added")}
                </>
              ) : (
                <>
                  <ShoppingBag className="h-3.5 w-3.5" />
                  {t("product.addToCart")}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
});

ProductCardInner.displayName = "ProductCard";

export const ProductCard = ProductCardInner;
