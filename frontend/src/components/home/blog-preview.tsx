"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import type { BlogPost } from "@/types";

export function BlogPreview() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/blog?limit=3&status=published")
      .then((res) => setPosts(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="section-padding">
        <div className="container-custom">
          <div className="mb-12 text-center">
            <Skeleton className="mx-auto mb-3 h-8 w-48" />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-gray-100 bg-white p-4">
                <Skeleton className="mb-3 aspect-[16/9] w-full rounded-lg" />
                <Skeleton className="mb-2 h-4 w-20" />
                <Skeleton className="mb-1 h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (posts.length === 0) return null;

  return (
    <section className="section-padding">
      <div className="container-custom">
        <div className="mb-12 text-center">
          <h2 className="heading-secondary">Latest Articles</h2>
          <p className="mt-3 text-gray-600">Insights for your faith journey</p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {posts.map((post) => (
            <Link key={post._id} href={`/blog/${post.slug}`}>
              <article className="group overflow-hidden rounded-xl border border-gray-100 bg-white transition-all hover:shadow-lg">
                <div className="aspect-[16/9] w-full bg-gray-100">
                  {post.featuredImage ? (
                    <img src={post.featuredImage} alt={post.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
                      <span className="text-sm text-gray-400">TKAY KONCEPTS</span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <span className="text-xs font-medium uppercase tracking-wider text-accent">{post.category}</span>
                  <h3 className="mt-2 text-lg font-semibold text-primary group-hover:text-accent transition-colors line-clamp-2">{post.title}</h3>
                  <p className="mt-2 text-sm text-gray-500 line-clamp-2">{post.excerpt}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                    <span>{post.readTime} min read</span>
                    <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/blog">
            <Button variant="secondary" size="lg">
              View All Articles <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
