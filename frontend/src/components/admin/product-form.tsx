"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, Upload, X, ImageIcon } from "lucide-react";
import Link from "next/link";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthenticatedApi } from "@/hooks/useAuthenticatedApi";
import { toast } from "sonner";
import type { Category } from "@/types";

interface ProductFormProps {
  productId?: string;
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
    imageUrl: "",
    imageAlt: "",
  });

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
          imageUrl: p.images?.[0]?.url || "",
          imageAlt: p.images?.[0]?.alt || "",
        });
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
        images: form.imageUrl ? [{ url: form.imageUrl, alt: form.imageAlt || form.name, isPrimary: true }] : [],
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
        setForm((prev) => ({ ...prev, imageUrl: uploaded[0].url, imageAlt: prev.imageAlt || prev.name || file.name }));
        toast.success("Image uploaded");
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadImage(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadImage(file);
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
                  <textarea
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                    rows={6}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
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

            {/* Image */}
            <div className="rounded-xl border border-gray-100 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-primary">Product Image</h2>
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
                  ) : form.imageUrl ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative">
                        <img src={form.imageUrl} alt={form.imageAlt} className="h-32 w-32 rounded-lg object-cover" />
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setForm((prev) => ({ ...prev, imageUrl: "", imageAlt: "" })); }}
                          className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow-md hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-400">Click or drop to replace</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-4">
                      <ImageIcon className="h-10 w-10 text-gray-300" />
                      <p className="text-sm font-medium text-gray-600">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-400">PNG, JPG, WebP up to 10MB</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>

                {/* Manual URL input */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Or enter image URL</label>
                  <Input value={form.imageUrl} onChange={(e) => update("imageUrl", e.target.value)} placeholder="https://..." />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Alt Text</label>
                  <Input value={form.imageAlt} onChange={(e) => update("imageAlt", e.target.value)} placeholder="Describe the image" />
                </div>
              </div>
            </div>
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
