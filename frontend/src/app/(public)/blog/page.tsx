"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Search, Clock } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import api from "@/lib/api";
import { BLOG_CATEGORIES } from "@/lib/constants";
import { useDebounce } from "@/hooks/useDebounce";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string;
  author: { firstName: string; lastName: string };
  category: string;
  tags: string[];
  readTime: number;
  publishedAt: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "9");
      if (category) params.set("category", category);
      if (debouncedSearch) params.set("search", debouncedSearch);

      const res = await api.get(`/blog?${params.toString()}`);
      setPosts(res.data.data);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [page, category, debouncedSearch]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <div className="section-padding container-custom">
      {/* Header */}
      <Breadcrumbs items={[{ label: "Blog" }]} />
      <div className="mb-10 text-center">
        <h1 className="heading-primary mb-3">Blog</h1>
        <p className="mx-auto max-w-2xl text-gray-600">
          Thoughts on faith, purpose, identity, and living boldly.
        </p>
      </div>

      {/* Category Filter */}
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        <button
          onClick={() => { setCategory(""); setPage(1); }}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            !category ? "bg-accent text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All
        </button>
        {BLOG_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => { setCategory(cat); setPage(1); }}
            className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition-colors ${
              category === cat ? "bg-accent text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-8 flex justify-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles..."
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>
      </div>

      {/* Posts Grid */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-100 bg-white p-4">
              <Skeleton className="mb-3 aspect-video w-full rounded-lg" />
              <Skeleton className="mb-2 h-3 w-16" />
              <Skeleton className="mb-2 h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
          <p className="text-gray-500">No articles found</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post._id}
                href={`/blog/${post.slug}`}
                className="group block"
              >
                <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md">
                  <div className="aspect-video overflow-hidden bg-gray-50">
                    <img
                      src={post.featuredImage || "/placeholder-blog.jpg"}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <p className="mb-2 text-xs font-medium text-accent capitalize">
                      {post.category}
                    </p>
                    <h2 className="mb-2 text-lg font-semibold text-primary line-clamp-2 group-hover:text-accent">
                      {post.title}
                    </h2>
                    <p className="mb-3 text-sm text-gray-500 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>
                        {post.author?.firstName} {post.author?.lastName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.readTime} min read
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            className="mt-8"
          />
        </>
      )}
    </div>
  );
}
