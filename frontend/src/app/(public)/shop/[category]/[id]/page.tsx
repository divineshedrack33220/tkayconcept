"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import {
  ShoppingBag,
  Minus,
  Plus,
  Package,
  Shield,
  Truck,
  RotateCcw,
  Heart,
  Share2,
  Check,
  Zap,
  Clock,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Rating } from "@/components/ui/rating";
import { Spinner } from "@/components/ui/spinner";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ShareButtons } from "@/components/ui/share-buttons";
import { FlashSaleTimer } from "@/components/ui/flash-sale-timer";
import { ReviewsSection } from "@/components/shop/reviews-section";
import { FrequentlyBoughtTogether } from "@/components/shop/frequently-bought-together";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useAuthenticatedApi } from "@/hooks/useAuthenticatedApi";
import { useSafeAuth } from "@/lib/safe-clerk";
import { addRecentlyViewed } from "@/components/home/recently-viewed";
import { toast } from "sonner";
import api from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

function getColorHex(color: string): string {
  const map: Record<string, string> = {
    "Black": "#1a1a1a", "White": "#ffffff", "Navy": "#1e3a5f",
    "Olive Green": "#556b2f", "Sand": "#c2b280", "Charcoal Grey": "#36454f",
  };
  return map[color] || "#888888";
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const { isSignedIn } = useSafeAuth();
  const authApi = useAuthenticatedApi();
  const wishlistHasItem = useWishlistStore((s) => s.hasItem);
  const wishlistAddItem = useWishlistStore((s) => s.addItem);
  const wishlistRemoveItem = useWishlistStore((s) => s.removeItem);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<Record<string, string>>({});
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const [viewers, setViewers] = useState(() => Math.floor(Math.random() * 20) + 8);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!product || !isSignedIn) return;
    const controller = new AbortController();
    authApi.get(`/wishlist/check/${product._id}`, { signal: controller.signal })
      .then((res) => { if (!controller.signal.aborted) setIsWishlisted(res.data.data?.isWishlisted ?? res.data.isWishlisted); })
      .catch(() => {});
    return () => controller.abort();
  }, [product?._id, isSignedIn]);

  useEffect(() => {
    const handleScroll = () => {
      setShowSticky(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Simulate live viewer count fluctuation
  useEffect(() => {
    const id = setInterval(() => {
      setViewers((v) => Math.max(3, v + Math.floor(Math.random() * 5) - 2));
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const handleToggleWishlist = async () => {
    if (!product) return;
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

  useEffect(() => {
    const controller = new AbortController();
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${params.id}`, { signal: controller.signal });
        if (!controller.signal.aborted) {
          setProduct(res.data.data);
          addRecentlyViewed(params.id as string);
        }
      } catch (err: unknown) {
        if (controller.signal.aborted) return;
        toast.error("Product not found");
        router.push("/shop");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    fetchProduct();
    return () => controller.abort();
  }, [params.id]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity, Object.keys(selectedVariant).length > 0 ? selectedVariant : undefined);
    setAddedToCart(true);
    toast.success(`${product.name} added to cart!`);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!product) return null;

  const primaryImage =
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

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const isLowStock = product.stock > 0 && product.stock <= product.lowStockThreshold;

  return (
    <div className="section-padding container-custom">
      {/* JSON-LD Structured Data */}
      <Script
        id="product-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.description,
            image: product.images.map((img) => img.url),
            brand: { "@type": "Brand", name: product.brand },
            sku: product._id,
            offers: {
              "@type": "Offer",
              price: product.price,
              priceCurrency: "USD",
              availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              url: typeof window !== "undefined" ? window.location.href : "",
            },
            aggregateRating: product.totalReviews > 0 ? {
              "@type": "AggregateRating",
              ratingValue: product.averageRating,
              reviewCount: product.totalReviews,
            } : undefined,
          }),
        }}
      />

      <Breadcrumbs items={[
        { label: "Shop", href: "/shop" },
        { label: product.category?.name || "Category", href: `/shop/${product.category?.slug}` },
        { label: product.name },
      ]} />

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Images */}
        <div>
          {/* Main image with zoom */}
          <div
            ref={imageRef}
            className="mb-4 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 cursor-crosshair"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={() => setIsZooming(false)}
          >
            <div className="relative aspect-square overflow-hidden">
              <img
                src={product.images[selectedImage]?.url || primaryImage}
                alt={product.name}
                className={`h-full w-full object-cover transition-transform duration-200 ${
                  isZooming ? "scale-150" : ""
                }`}
                style={isZooming ? {
                  transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                } : undefined}
              />
              {hasDiscount && (
                <div className="absolute left-4 top-4 z-10">
                  <FlashSaleTimer discountPercent={discountPercent} endDate={product.saleEndDate} />
                </div>
              )}
            </div>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                    selectedImage === i
                      ? "border-accent shadow-md shadow-accent/20"
                      : "border-gray-100 hover:border-gray-300 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img.url} alt={img.alt} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          {/* Brand + badges */}
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold uppercase tracking-wider text-accent">{product.brand}</span>
            {product.isBestSeller && (
              <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-bold text-accent">Best Seller</span>
            )}
            {product.isNewArrival && (
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">New</span>
            )}
            {isLowStock && (
              <span className="flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-bold text-orange-600">
                <Clock className="h-3 w-3" />
                Only {product.stock} left
              </span>
            )}
          </div>

          <h1 className="mb-3 text-3xl font-bold text-gray-900 lg:text-4xl">{product.name}</h1>

          <div className="mb-4 flex items-center gap-3">
            <Rating value={product.averageRating} />
            <span className="text-sm text-gray-500">({product.totalReviews} reviews)</span>
          </div>

          {/* Price */}
          <div className="mb-6 flex items-baseline gap-3">
            <span className="text-4xl font-bold text-primary">{formatPrice(product.price)}</span>
            {hasDiscount && (
              <>
                <span className="text-xl text-gray-400 line-through">{formatPrice(product.compareAtPrice!)}</span>
                <span className="rounded-full bg-red-50 px-3 py-1 text-sm font-bold text-red-600">
                  Save {formatPrice(product.compareAtPrice! - product.price)}
                </span>
              </>
            )}
          </div>

          <p className="mb-6 leading-relaxed text-gray-600">{product.description}</p>

          {/* Share */}
          <div className="mb-6">
            <ShareButtons title={product.name} url={shareUrl} />
          </div>

          {/* Variants */}
          {product.variants.length > 0 && (
            <div className="mb-6">
              {product.variants.map((variant) => (
                <div key={variant.name} className="mb-4">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    {variant.name}: <span className="text-accent">{selectedVariant[variant.name] || "Select"}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {variant.options.map((opt) => {
                      const isColor = variant.name === "Color";
                      const isActive = selectedVariant[variant.name] === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setSelectedVariant((prev) => ({ ...prev, [variant.name]: opt.value }))}
                          disabled={opt.stock === 0}
                          className={`${
                            isColor
                              ? `h-10 w-10 rounded-full border-2 transition-all ${isActive ? "ring-2 ring-accent ring-offset-2 scale-110" : "hover:scale-105"} ${opt.stock === 0 ? "cursor-not-allowed opacity-30" : ""}`
                              : `rounded-xl border-2 px-5 py-2.5 text-sm font-semibold transition-all ${isActive ? "border-accent bg-accent text-white shadow-md shadow-accent/20" : opt.stock === 0 ? "cursor-not-allowed border-gray-100 bg-gray-50 text-gray-300 line-through" : "border-gray-200 hover:border-accent hover:text-accent"}`
                          }`}
                          style={isColor ? { backgroundColor: getColorHex(opt.value), borderColor: isActive ? "var(--color-accent, #D4AF37)" : "#e5e7eb" } : undefined}
                          title={opt.value}
                          aria-label={`${variant.name}: ${opt.value}`}
                        >
                          {!isColor && opt.value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stock */}
          <div className="mb-6">
            {product.stock > 0 ? (
              <div className="flex items-center gap-2 text-sm">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100">
                  <Check className="h-3 w-3 text-emerald-600" />
                </div>
                <span className="font-medium text-emerald-600">In Stock</span>
                {isLowStock && (
                  <span className="text-orange-500 font-semibold">(Only {product.stock} left — order soon!)</span>
                )}
              </div>
            ) : (
              <p className="text-sm font-medium text-red-500">Out of Stock</p>
            )}
          </div>

          {/* Quantity + Add to Cart */}
          <div className="mb-6 flex items-center gap-3">
            <div className="flex items-center rounded-xl border border-gray-200">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                aria-label="Decrease quantity"
                className="flex h-10 w-10 items-center justify-center text-gray-600 transition-colors hover:text-accent"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-[40px] text-center text-sm font-bold">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                aria-label="Increase quantity"
                className="flex h-10 w-10 items-center justify-center text-gray-600 transition-colors hover:text-accent"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all active:scale-[0.98] touch-feedback min-h-[44px] ${
                addedToCart
                  ? "bg-emerald-500 text-white"
                  : "bg-accent text-white hover:bg-accent-dark"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {addedToCart ? (
                <><Check className="h-4 w-4" /> Added!</>
              ) : (
                <><ShoppingBag className="h-4 w-4" /> Add to Cart</>
              )}
            </button>
            <button
              onClick={handleToggleWishlist}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${
                isWishlisted
                  ? "border-red-200 bg-red-50 text-red-500"
                  : "border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-500"
              }`}
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? "fill-red-500" : ""}`} />
            </button>
          </div>

          {/* Urgency bar — always show viewers, conditionally show low stock */}
          <div className={`mb-6 flex items-center gap-3 rounded-xl border p-4 ${
            isLowStock ? "border-orange-200 bg-orange-50" : "border-blue-200 bg-blue-50"
          }`}>
            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
              isLowStock ? "bg-orange-100" : "bg-blue-100"
            }`}>
              {isLowStock ? (
                <Zap className="h-4 w-4 text-orange-500 animate-pulse" />
              ) : (
                <Clock className="h-4 w-4 text-blue-500" />
              )}
            </div>
            <div>
              <p className={`text-sm font-semibold ${
                isLowStock ? "text-orange-700" : "text-blue-700"
              }`}>
                {viewers} people are viewing this right now
              </p>
              {isLowStock && (
                <p className="text-xs text-orange-600 mt-0.5">
                  Only {product.stock} left in stock — order soon!
                </p>
              )}
            </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <div className="text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                <Truck className="h-5 w-5 text-emerald-600" />
              </div>
              <p className="text-xs font-semibold text-gray-700">Free Shipping</p>
              <p className="text-[10px] text-gray-400">Orders $75+</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-xs font-semibold text-gray-700">Secure Payment</p>
              <p className="text-[10px] text-gray-400">SSL Encrypted</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                <RotateCcw className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-xs font-semibold text-gray-700">30-Day Returns</p>
              <p className="text-[10px] text-gray-400">Hassle Free</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Add to Cart bar */}
      <div className={`fixed bottom-0 left-0 right-0 z-40 border-t border-gray-100 bg-white/95 backdrop-blur-sm shadow-2xl transition-all duration-300 sm:bottom-0 bottom-[64px] ${
        showSticky ? "translate-y-0" : "translate-y-full"
      }`}>
        <div className="container-custom flex items-center justify-between gap-3 sm:gap-4 py-2.5 sm:py-3">
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
            <img
              src={primaryImage}
              alt={product.name}
              className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 rounded-lg object-cover"
            />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-1">{product.name}</p>
              <p className="text-sm sm:text-lg font-bold text-primary">{formatPrice(product.price)}</p>
            </div>
          </div>
          <Button variant="accent" onClick={handleAddToCart} disabled={product.stock === 0} className="flex-shrink-0 px-4 sm:px-6 min-h-[44px]">
            {addedToCart ? (
              <><Check className="h-4 w-4 mr-1.5 sm:mr-2" /> <span className="hidden sm:inline">Added!</span><span className="sm:hidden">✓</span></>
            ) : (
              <><ShoppingBag className="h-4 w-4 mr-1.5 sm:mr-2" /> <span className="hidden sm:inline">Add to Cart</span><span className="sm:hidden">Add</span></>
            )}
            </Button>
        </div>
      </div>

      {/* Frequently Bought Together */}
      <FrequentlyBoughtTogether currentProduct={product} />

      {/* Reviews */}
      <ReviewsSection productId={product._id} />
    </div>
  );
}
