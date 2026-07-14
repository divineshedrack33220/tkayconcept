"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, Upload, X, ImageIcon, GripVertical, Star } from "lucide-react";
import Link from "next/link";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { useAuthenticatedApi } from "@/hooks/useAuthenticatedApi";
import { toast } from "sonner";
import type { Category } from "@/types";

interface ProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
}

interface ProductFormProps {
  productId?: string;
}

function getColorHex(color: string): string {
  const map: Record<string, string> = {
    "Black": "#1a1a1a",
    "White": "#ffffff",
    "Navy": "#1e3a5f",
    "Olive Green": "#556b2f",
    "Sand": "#c2b280",
    "Charcoal Grey": "#36454f",
  };
  return map[color] || "#888888";
}

export function ProductForm({ productId }: ProductFormProps) {
  const router = useRouter();
  const authApi = useAuthenticatedApi();
  const isEdit = !!productId;

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [categories, setCategories] = useState<Category[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    shortDescription: "",
    price: "",
    compareAtPrice: "",
    category: "",
    brand: "TKAYKONCEPTS",
    sku: "",
    stock: "0",
    lowStockThreshold: "5",
    weight: "",
    seoTitle: "",
    seoDescription: "",
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: false,
    isActive: true,
    tags: "",
  });

  const [images, setImages] = useState<ProductImage[]>([]);
  const [manualUrl, setManualUrl] = useState("");

  const APPAREL_COLORS = ["Black", "White", "Navy", "Olive Green", "Sand", "Charcoal Grey"];
  const APPAREL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  const isApparelCategory = categories.find((c) => c._id === form.category)?.slug === "apparel" ||
    categories.find((c) => c._id === form.category)?.name?.toLowerCase() === "apparel";

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await authApi.get("/categories/admin");
        setCategories(res.data.data);
      } catch {
        // silent
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    const fetchProduct = async () => {
      try {
        const res = await authApi.get(`/products/${productId}`);
        const p = res.data.data;
        setForm({
          name: p.name || "",
          description: p.description || "",
          shortDescription: p.shortDescription || "",
          price: p.price?.toString() || "",
          compareAtPrice: p.compareAtPrice?.toString() || "",
          category: p.category?._id || "",
          brand: p.brand || "TKAYKONCEPTS",
          sku: p.sku || "",
          stock: p.stock?.toString() || "0",
          lowStockThreshold: p.lowStockThreshold?.toString() || "5",
          weight: p.weight?.toString() || "",
          seoTitle: p.seoTitle || "",
          seoDescription: p.seoDescription || "",
          isFeatured: p.isFeatured || false,
          isNewArrival: p.isNewArrival || false,
          isBestSeller: p.isBestSeller || false,
          isActive: p.isActive ?? true,
          tags: p.tags?.join(", ") || "",
        });
        if (p.images?.length > 0) {
          setImages(p.images.map((img: { url: string; alt?: string; isPrimary?: boolean }) => ({
            url: img.url,
            alt: img.alt || "",
            isPrimary: img.isPrimary ?? false,
          })));
        }
        if (p.variants?.length > 0) {
          const colorVariant = p.variants.find((v: { name: string }) => v.name === "Color");
          const sizeVariant = p.variants.find((v: { name: string }) => v.name === "Size");
          if (colorVariant) setSelectedColors(colorVariant.options.map((o: { value: string }) => o.value));
          if (sizeVariant) setSelectedSizes(sizeVariant.options.map((o: { value: string }) => o.value));
        }
      } catch {
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) {
      toast.error("Name, price, and category are required");
      return;
    }

    setSaving(true);
    try {
      const body = {
        name: form.name,
        description: form.description,
        shortDescription: form.shortDescription,
        price: parseFloat(form.price),
        compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : undefined,
        category: form.category,
        brand: form.brand,
        sku: form.sku,
        stock: parseInt(form.stock) || 0,
        lowStockThreshold: parseInt(form.lowStockThreshold) || 5,
        weight: form.weight ? parseFloat(form.weight) : 0,
        seoTitle: form.seoTitle,
        seoDescription: form.seoDescription,
        isFeatured: form.isFeatured,
        isNewArrival: form.isNewArrival,
        isBestSeller: form.isBestSeller,
        isActive: form.isActive,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        images: images.map((img) => ({
          url: img.url,
          alt: img.alt || form.name,
          isPrimary: img.isPrimary,
        })),
        variants: [
          ...(selectedColors.length > 0 ? [{
            name: "Color",
            options: selectedColors.map((color) => ({ value: color, stock: 0 })),
          }] : []),
          ...(selectedSizes.length > 0 ? [{
            name: "Size",
            options: selectedSizes.map((size) => ({ value: size, stock: 0 })),
          }] : []),
        ],
      };

      if (isEdit) {
        await authApi.put(`/products/${productId}`, body);
        toast.success("Product updated");
      } else {
        await authApi.post("/products", body);
        toast.success("Product created");
      }
      router.push("/admin/products");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to save product";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const update = (field: string, value: string | boolean) => setForm((prev) => ({ ...prev, [field]: value }));

  const uploadImage = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10MB");
      return;
    }
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("files", file);
      const res = await authApi.post("/media/upload", formData);
      const uploaded = res.data.data;
      if (uploaded && uploaded.length > 0) {
        const newImages = uploaded.map((img: { url: string }, i: number) => ({
          url: img.url,
          alt: form.name || file.name,
          isPrimary: images.length === 0 && i === 0,
        }));
        setImages((prev) => [...prev, ...newImages]);
        toast.success(`${newImages.length} image${newImages.length > 1 ? "s" : ""} uploaded`);
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => uploadImage(file));
    }
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files) {
      Array.from(files).forEach((file) => uploadImage(file));
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (prev[index]?.isPrimary && next.length > 0) {
        next[0] = { ...next[0], isPrimary: true };
      }
      return next;
    });
  };

  const setPrimary = (index: number) => {
    setImages((prev) => prev.map((img, i) => ({ ...img, isPrimary: i === index })));
  };

  const addManualUrl = () => {
    if (!manualUrl.trim()) return;
    setImages((prev) => [
      ...prev,
      { url: manualUrl.trim(), alt: form.name || "Product image", isPrimary: prev.length === 0 },
    ]);
    setManualUrl("");
  };

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOverItem = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    setImages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(index, 0, moved);
      return next;
    });
    setDragIndex(index);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/products" className="rounded-lg p-2 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-primary">{isEdit ? "Edit Product" : "New Product"}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="rounded-xl border border-gray-100 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-primary">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Product Name *</label>
                  <Input value={form.name} onChange={(e) => update("name", e.target.value)} required />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Short Description</label>
                  <Input value={form.shortDescription} onChange={(e) => update("shortDescription", e.target.value)} maxLength={300} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Full Description</label>
                  <RichTextEditor
                    value={form.description}
                    onChange={(val) => update("description", val)}
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="rounded-xl border border-gray-100 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-primary">Pricing & Inventory</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Price *</label>
                  <Input type="number" step="0.01" min="0.01" value={form.price} onChange={(e) => update("price", e.target.value)} required />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Compare at Price</label>
                  <Input type="number" step="0.01" min="0" value={form.compareAtPrice} onChange={(e) => update("compareAtPrice", e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">SKU</label>
                  <Input value={form.sku} onChange={(e) => update("sku", e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Stock *</label>
                  <Input type="number" min="0" value={form.stock} onChange={(e) => update("stock", e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Low Stock Threshold</label>
                  <Input type="number" min="0" value={form.lowStockThreshold} onChange={(e) => update("lowStockThreshold", e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Weight (oz)</label>
                  <Input type="number" step="0.1" min="0" value={form.weight} onChange={(e) => update("weight", e.target.value)} />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="rounded-xl border border-gray-100 bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-primary">Product Images</h2>
                <span className="text-xs text-gray-400">{images.length} image{images.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="space-y-4">
                {/* Upload area */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
                    dragOver ? "border-accent bg-accent/5" : "border-gray-200 hover:border-accent/50 hover:bg-gray-50"
                  }`}
                >
                  {uploadingImage ? (
                    <div className="flex flex-col items-center gap-2 py-4">
                      <Loader2 className="h-8 w-8 animate-spin text-accent" />
                      <p className="text-sm text-gray-500">Uploading...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-2">
                      <ImageIcon className="h-8 w-8 text-gray-300" />
                      <p className="text-sm font-medium text-gray-600">Click or drag images here</p>
                      <p className="text-xs text-gray-400">PNG, JPG, WebP up to 10MB — select multiple files</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>

                {/* Manual URL input */}
                <div className="flex gap-2">
                  <Input
                    value={manualUrl}
                    onChange={(e) => setManualUrl(e.target.value)}
                    placeholder="Or paste image URL..."
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addManualUrl())}
                  />
                  <Button type="button" variant="outline" onClick={addManualUrl} className="flex-shrink-0">
                    Add
                  </Button>
                </div>

                {/* Image grid */}
                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                    {images.map((img, i) => (
                      <div
                        key={`${img.url}-${i}`}
                        draggable
                        onDragStart={() => handleDragStart(i)}
                        onDragOver={(e) => handleDragOverItem(e, i)}
                        onDragEnd={handleDragEnd}
                        className={`group relative overflow-hidden rounded-xl border-2 transition-all ${
                          img.isPrimary ? "border-accent shadow-md shadow-accent/10" : "border-gray-100 hover:border-gray-300"
                        } ${dragIndex === i ? "opacity-50 scale-95" : ""}`}
                      >
                        <div className="aspect-square bg-gray-50">
                          <img src={img.url} alt={img.alt} className="h-full w-full object-cover" />
                        </div>

                        {/* Drag handle */}
                        <div className="absolute left-1 top-1 cursor-grab rounded bg-black/40 p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <GripVertical className="h-3 w-3" />
                        </div>

                        {/* Primary badge */}
                        {img.isPrimary && (
                          <div className="absolute left-1 bottom-1 flex items-center gap-1 rounded bg-accent px-1.5 py-0.5 text-[10px] font-bold text-white">
                            <Star className="h-2.5 w-2.5 fill-current" /> Primary
                          </div>
                        )}

                        {/* Actions */}
                        <div className="absolute right-1 top-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!img.isPrimary && (
                            <button
                              type="button"
                              onClick={() => setPrimary(i)}
                              className="rounded bg-black/40 p-1 text-white hover:bg-accent transition-colors"
                              title="Set as primary"
                            >
                              <Star className="h-3 w-3" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(i)}
                            className="rounded bg-black/40 p-1 text-white hover:bg-red-500 transition-colors"
                            title="Remove image"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {images.length > 1 && (
                  <p className="text-xs text-gray-400">Drag to reorder. First image (or starred) is the primary image shown in listings.</p>
                )}
              </div>
            </div>

            {/* Variants — only for apparel */}
            {isApparelCategory && (
              <div className="rounded-xl border border-gray-100 bg-white p-6">
                <h2 className="mb-4 text-lg font-semibold text-primary">Variants</h2>

                {/* Colors */}
                <div className="mb-5">
                  <label className="mb-2 block text-sm font-medium text-gray-700">Colors</label>
                  <div className="flex flex-wrap gap-2">
                    {APPAREL_COLORS.map((color) => {
                      const active = selectedColors.includes(color);
                      return (
                        <button
                          key={color}
                          type="button"
                          onClick={() => toggleColor(color)}
                          className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-sm font-medium transition-all ${
                            active
                              ? "border-accent bg-accent/10 text-accent"
                              : "border-gray-200 text-gray-600 hover:border-gray-300"
                          }`}
                        >
                          <span
                            className={`h-4 w-4 rounded-full border ${
                              color === "White" ? "border-gray-300" : "border-transparent"
                            }`}
                            style={{ backgroundColor: getColorHex(color) }}
                          />
                          {color}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sizes */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Sizes</label>
                  <div className="flex flex-wrap gap-2">
                    {APPAREL_SIZES.map((size) => {
                      const active = selectedSizes.includes(size);
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => toggleSize(size)}
                          className={`min-w-[48px] rounded-xl border-2 px-4 py-2 text-sm font-semibold transition-all ${
                            active
                              ? "border-accent bg-accent/10 text-accent"
                              : "border-gray-200 text-gray-600 hover:border-gray-300"
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {(selectedColors.length > 0 || selectedSizes.length > 0) && (
                  <p className="mt-3 text-xs text-gray-400">
                    {selectedColors.length} color{selectedColors.length !== 1 ? "s" : ""} × {selectedSizes.length} size{selectedSizes.length !== 1 ? "s" : ""} = {selectedColors.length * selectedSizes.length || selectedColors.length || selectedSizes.length} variant{((selectedColors.length * selectedSizes.length || selectedColors.length || selectedSizes.length) !== 1) ? "s" : ""}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="rounded-xl border border-gray-100 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-primary">Organization</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => update("category", e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Brand</label>
                  <select
                    value={form.brand}
                    onChange={(e) => update("brand", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  >
                    <option value="TKAYKONCEPTS">TKAYKONCEPTS</option>
                    <option value="Rooted Identity">Rooted Identity</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
                  <Input value={form.tags} onChange={(e) => update("tags", e.target.value)} placeholder="faith, book, purpose" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-primary">Status</h2>
              <div className="space-y-3">
                {[
                  { key: "isActive", label: "Active (visible in shop)" },
                  { key: "isFeatured", label: "Featured" },
                  { key: "isNewArrival", label: "New Arrival" },
                  { key: "isBestSeller", label: "Best Seller" },
                ].map((opt) => (
                  <label key={opt.key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form[opt.key as keyof typeof form] as boolean}
                      onChange={(e) => update(opt.key, e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
                    />
                    <span className="text-sm text-gray-700">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-primary">SEO</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">SEO Title</label>
                  <Input value={form.seoTitle} onChange={(e) => update("seoTitle", e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">SEO Description</label>
                  <textarea
                    value={form.seoDescription}
                    onChange={(e) => update("seoDescription", e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  />
                </div>
              </div>
            </div>

            <Button variant="accent" size="lg" className="w-full" type="submit" disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isEdit ? "Update Product" : "Create Product"}
            </Button>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
