"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  FileText,
  Loader2,
} from "lucide-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthenticatedApi } from "@/hooks/useAuthenticatedApi";
import { BLOG_CATEGORIES } from "@/lib/constants";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";
import { blogSchema, type BlogInput } from "@/lib/validations";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  status: "draft" | "published" | "scheduled";
  views: number;
  publishedAt: string;
  createdAt: string;
  author: { firstName: string; lastName: string };
}

export default function AdminBlogPage() {
  const authApi = useAuthenticatedApi();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(blogSchema),
    defaultValues: { title: "", excerpt: "", content: "", category: "faith" as const, status: "draft" as const, tags: [] as string[] },
  });

  const tagsInput = watch("tags");

  const { data: postsData, isLoading: loading } = useQuery({
    queryKey: ["admin-blog", page, debouncedSearch, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "15");
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (statusFilter) params.set("status", statusFilter);
      const res = await authApi.get(`/blog/admin/all?${params.toString()}`);
      return res.data as { data: BlogPost[]; total: number; totalPages: number };
    },
  });

  const posts = postsData?.data || [];
  const total = postsData?.total || 0;
  const totalPages = postsData?.totalPages || 1;

  const createMutation = useMutation({
    mutationFn: (data: BlogInput) => authApi.post("/blog/admin", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-blog"] }); toast.success("Post created!"); setShowModal(false); },
    onError: () => toast.error("Failed to create post"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BlogInput> }) => authApi.put(`/blog/admin/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-blog"] }); toast.success("Post updated!"); setShowModal(false); },
    onError: () => toast.error("Failed to update post"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => authApi.delete(`/blog/admin/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-blog"] }); toast.success("Post deleted"); },
    onError: () => toast.error("Failed to delete post"),
  });

  const togglePublishMutation = useMutation({
    mutationFn: (post: BlogPost) => {
      const newStatus = post.status === "published" ? "draft" : "published";
      return authApi.put(`/blog/admin/${post._id}`, {
        status: newStatus,
        publishedAt: newStatus === "published" ? new Date().toISOString() : undefined,
      });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-blog"] }); toast.success("Status updated"); },
    onError: () => toast.error("Failed to update status"),
  });

  const openCreate = () => {
    setEditingId(null);
    reset({ title: "", excerpt: "", content: "", category: "faith", status: "draft", tags: [] });
    setShowModal(true);
  };

  const openEdit = (post: BlogPost) => {
    setEditingId(post._id);
    reset({ title: post.title, excerpt: post.excerpt, content: "", category: post.category as BlogInput["category"], status: post.status, tags: [] });
    setShowModal(true);
  };

  const onSubmit = (data: BlogInput) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-600",
    published: "bg-green-100 text-green-700",
    scheduled: "bg-blue-100 text-blue-700",
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Blog Posts</h1>
        <Button variant="accent" onClick={openCreate}>
          <Plus className="h-4 w-4" /> New Post
        </Button>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search posts..."
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
        <span className="self-center text-sm text-gray-500">{total} posts</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-500">Title</th>
              <th className="px-4 py-3 font-medium text-gray-500">Category</th>
              <th className="px-4 py-3 font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 font-medium text-gray-500">Views</th>
              <th className="px-4 py-3 font-medium text-gray-500">Author</th>
              <th className="px-4 py-3 font-medium text-gray-500">Date</th>
              <th className="px-4 py-3 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-48" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-16" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-16" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-10" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-20" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-20" /></td>
                </tr>
              ))
            ) : posts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                  <FileText className="mx-auto mb-2 h-8 w-8" />
                  No posts found
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 line-clamp-1">{post.title}</p>
                    <p className="text-xs text-gray-500 line-clamp-1">{post.excerpt}</p>
                  </td>
                  <td className="px-4 py-3 capitalize text-gray-600">{post.category}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColors[post.status] || "bg-gray-100"}`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{post.views}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {post.author?.firstName} {post.author?.lastName}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => togglePublishMutation.mutate(post)}
                        className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-green-600"
                        title={post.status === "published" ? "Unpublish" : "Publish"}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openEdit(post)}
                        className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-accent"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => { if (confirm(`Delete "${post.title}"?`)) deleteMutation.mutate(post._id); }}
                        disabled={deleteMutation.isPending}
                        className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                      >
                        {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} className="mt-6" />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? "Edit Post" : "New Post"}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Title *</label>
            <Input {...register("title")} placeholder="Post title" />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Excerpt *</label>
            <textarea {...register("excerpt")} placeholder="Brief summary of the post" rows={2}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20" />
            {errors.excerpt && <p className="mt-1 text-xs text-red-500">{errors.excerpt.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Content (HTML)</label>
            <textarea {...register("content")} placeholder="Full post content (HTML supported)" rows={8}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-mono focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
              <select {...register("category")}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20">
                {BLOG_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="capitalize">{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
              <select {...register("status")}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
            <Input
              value={tagsInput?.join(", ") || ""}
              onChange={(e) => {
                const tags = e.target.value.split(",").map((t) => t.trim()).filter(Boolean);
                setValue("tags", tags, { shouldValidate: true });
              }}
              placeholder="faith, purpose, identity"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="accent" type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingId ? "Update" : "Create"} Post
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
