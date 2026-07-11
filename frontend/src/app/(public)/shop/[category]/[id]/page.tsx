"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShoppingBag,
  Minus,
  Plus,
  ChevronRight,
  Package,
  Shield,
  Truck,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Rating } from "@/components/ui/rating";
import { Spinner } from "@/components/ui/spinner";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import api from "@/lib/api";
import type { Product } from "@/types";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<{
    name: string;
    value: string;
  } | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${params.id}`);
        setProduct(res.data.data);
      } catch {
        toast.error("Product not found");
        router.push("/shop");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [params.id, router]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity, selectedVariant || undefined);
    toast.success(`${product.name} added to cart!`);
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
    "/placeholder-product.jpg";

  const hasDiscount =
    product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.compareAtPrice! - product.price) / product.compareAtPrice!) *
          100
      )
    : 0;

  return (
    <div className="section-padding container-custom">
      {/* Breadcrumbs */}
      <nav className="mb-8 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-accent">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/shop" className="hover:text-accent">
          Shop
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link
          href={`/shop/${product.category?.slug}`}
          className="hover:text-accent capitalize"
        >
          {product.category?.name}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Images */}
        <div>
          <div className="mb-4 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
            <img
              src={selectedImage === 0 ? primaryImage : product.images[selectedImage]?.url || primaryImage}
              alt={product.name}
              className="aspect-square w-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`h-20 w-20 overflow-hidden rounded-lg border-2 ${
                    selectedImage === i
                      ? "border-accent"
                      : "border-gray-100 hover:border-gray-300"
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.alt}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="text-sm font-medium text-accent">
              {product.brand}
            </span>
            {product.isBestSeller && (
              <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
                Best Seller
              </span>
            )}
            {product.isNewArrival && (
              <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
                New
              </span>
            )}
          </div>

          <h1 className="mb-3 text-3xl font-bold text-primary">
            {product.name}
          </h1>

          <div className="mb-4 flex items-center gap-3">
            <Rating value={product.averageRating} />
            <span className="text-sm text-gray-500">
              ({product.totalReviews} reviews)
            </span>
          </div>

          <div className="mb-6 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">
              ${product.price.toFixed(2)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-lg text-gray-400 line-through">
                  ${product.compareAtPrice!.toFixed(2)}
                </span>
                <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
                  -{discountPercent}%
                </span>
              </>
            )}
          </div>

          <p className="mb-6 leading-relaxed text-gray-600">
            {product.description}
          </p>

          {/* Variants */}
          {product.variants.length > 0 && (
            <div className="mb-6">
              {product.variants.map((variant) => (
                <div key={variant.name} className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {variant.name}:{" "}
                    <span className="text-accent">
                      {selectedVariant?.value || "Select"}
                    </span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {variant.options.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() =>
                          setSelectedVariant({
                            name: variant.name,
                            value: opt.value,
                          })
                        }
                        disabled={opt.stock === 0}
                        className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                          selectedVariant?.value === opt.value
                            ? "border-accent bg-accent/10 text-accent"
                            : opt.stock === 0
                            ? "cursor-not-allowed border-gray-100 bg-gray-50 text-gray-300"
                            : "border-gray-200 hover:border-accent hover:text-accent"
                        }`}
                      >
                        {opt.value}
                        {opt.stock === 0 && " (Out)"}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stock */}
          <div className="mb-6">
            {product.stock > 0 ? (
              <p className="text-sm text-green-600">
                <Package className="mr-1 inline h-4 w-4" />
                In Stock
                {product.stock <= product.lowStockThreshold && (
                  <span className="ml-2 text-orange-500">
                    (Only {product.stock} left)
                  </span>
                )}
              </p>
            ) : (
              <p className="text-sm text-red-500">Out of Stock</p>
            )}
          </div>

          {/* Quantity + Add to Cart */}
          <div className="mb-8 flex items-center gap-4">
            <div className="flex items-center rounded-lg border border-gray-200">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-3 text-gray-600 hover:text-accent"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-[48px] text-center text-sm font-semibold">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-3 text-gray-600 hover:text-accent"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <Button
              variant="accent"
              size="lg"
              className="flex-1"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingBag className="h-5 w-5" />
              Add to Cart
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
            <div className="text-center">
              <Truck className="mx-auto mb-1 h-5 w-5 text-accent" />
              <p className="text-xs text-gray-600">Free Shipping</p>
            </div>
            <div className="text-center">
              <Shield className="mx-auto mb-1 h-5 w-5 text-accent" />
              <p className="text-xs text-gray-600">Secure Payment</p>
            </div>
            <div className="text-center">
              <RotateCcw className="mx-auto mb-1 h-5 w-5 text-accent" />
              <p className="text-xs text-gray-600">30-Day Returns</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
