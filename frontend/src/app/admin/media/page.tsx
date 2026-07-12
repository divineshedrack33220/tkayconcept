"use client";

import { useState, useEffect, useCallback } from "react";
import { Upload, Image, Copy, Trash2, Loader2, X } from "lucide-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { useAuthenticatedApi } from "@/hooks/useAuthenticatedApi";
import { toast } from "sonner";

interface MediaItem {
  url: string;
  alt: string;
  publicId: string;
}

const MEDIA_KEY = "tkay-media-library";

function loadMedia(): MediaItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(MEDIA_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

function saveMedia(items: MediaItem[]) {
  localStorage.setItem(MEDIA_KEY, JSON.stringify(items));
}

export default function AdminMediaPage() {
  const authApi = useAuthenticatedApi();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [preview, setPreview] = useState<MediaItem | null>(null);

  useEffect(() => {
    setMedia(loadMedia());
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append("files", file));

      const res = await authApi.post("/media/upload", formData);
      const uploaded = res.data.data as MediaItem[];
      const updated = [...uploaded, ...media];
      setMedia(updated);
      saveMedia(updated);
      toast.success(`${uploaded.length} file(s) uploaded`);
    } catch {
      toast.error("Upload failed. Make sure you are signed in.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = useCallback(async (item: MediaItem) => {
    setDeleting(item.publicId);
    try {
      await authApi.delete(`/media/${item.publicId}`);
      const updated = media.filter((m) => m.publicId !== item.publicId);
      setMedia(updated);
      saveMedia(updated);
      toast.success("File deleted");
      if (preview?.publicId === item.publicId) setPreview(null);
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(null);
    }
  }, [media, authApi, preview]);

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard");
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Media Library</h1>
          <p className="mt-1 text-gray-500">Upload and manage images for your store</p>
        </div>
        <label className="cursor-pointer">
          <span className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-dark">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload Files
          </span>
          <input type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} />
        </label>
      </div>

      <p className="mb-6 text-sm text-gray-500">
        Files are stored on Cloudinary. Upload images for products, categories, and content.
      </p>

      {media.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
          <Image className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="mb-2 text-gray-500">No media uploaded yet</p>
          <p className="text-sm text-gray-400">Upload images using the button above</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {media.map((item) => (
            <div key={item.publicId} className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white">
              <img
                src={item.url}
                alt={item.alt}
                className="aspect-square w-full cursor-pointer object-cover"
                onClick={() => setPreview(item)}
              />
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <button onClick={() => copyUrl(item.url)} className="rounded-lg bg-white/90 p-2 text-gray-700 hover:bg-white" title="Copy URL">
                  <Copy className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  disabled={deleting === item.publicId}
                  className="rounded-lg bg-white/90 p-2 text-red-500 hover:bg-white disabled:opacity-50"
                  title="Delete"
                >
                  {deleting === item.publicId ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </button>
              </div>
              <div className="p-2">
                <p className="truncate text-xs text-gray-500">{item.alt}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-8" onClick={() => setPreview(null)}>
          <div className="relative max-h-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPreview(null)} className="absolute -right-3 -top-3 rounded-full bg-white p-1.5 shadow-lg">
              <X className="h-5 w-5" />
            </button>
            <img src={preview.url} alt={preview.alt} className="max-h-[80vh] rounded-xl object-contain" />
            <div className="mt-3 flex items-center justify-between rounded-lg bg-white/90 px-4 py-2">
              <p className="text-sm text-gray-600">{preview.alt}</p>
              <div className="flex gap-2">
                <button onClick={() => copyUrl(preview.url)} className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200">
                  Copy URL
                </button>
                <button
                  onClick={() => handleDelete(preview)}
                  disabled={deleting === preview.publicId}
                  className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
