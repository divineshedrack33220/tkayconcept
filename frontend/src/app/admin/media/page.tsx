"use client";

import { useState } from "react";
import { Upload, Image, Copy, Loader2 } from "lucide-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { toast } from "sonner";

interface MediaItem {
  url: string;
  alt: string;
  publicId: string;
}

export default function AdminMediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append("files", file));

      const token = await (window as unknown as { __clerk_getToken?: () => Promise<string> }).__clerk_getToken?.() || "";
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/media/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.data) {
        setMedia((prev) => [...data.data, ...prev]);
        toast.success(`${data.data.length} file(s) uploaded`);
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied");
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Media Library</h1>
        <label className="cursor-pointer">
          <span className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-dark">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload Files
          </span>
          <input type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} />
        </label>
      </div>

      <p className="mb-6 text-sm text-gray-500">Upload and manage images for products, categories, and content. Files are stored on Cloudinary.</p>

      {media.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
          <Image className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="mb-2 text-gray-500">No media uploaded yet</p>
          <p className="text-sm text-gray-400">Upload images using the button above</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {media.map((item, i) => (
            <div key={i} className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white">
              <img src={item.url} alt={item.alt} className="aspect-square w-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <button onClick={() => copyUrl(item.url)} className="rounded-lg bg-white/90 p-2 text-gray-700 hover:bg-white">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <div className="p-2">
                <p className="truncate text-xs text-gray-500">{item.alt}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
