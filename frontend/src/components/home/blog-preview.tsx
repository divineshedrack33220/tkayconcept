"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollReveal, ScrollRevealStagger, StaggerItem } from "@/components/ui/scroll-reveal";
import { useTranslation } from "@/i18n";
import api from "@/lib/api";
import type { BlogPost } from "@/types";

export function BlogPreview() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const controller = new AbortController();
    api.get("/blog?limit=3&status=published", { signal: controller.signal })
      .then((res) => { if (!controller.signal.aborted) setPosts(res.data.data); })
      .catch(() => {})
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <section className="section-padding">
        <div className="container-custom">
          <div className="mb-12 text-center">
            <Skeleton className="mx-auto mb-3 h-8 w-48" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
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
        <ScrollReveal>
          <div className="mb-8 sm:mb-12 text-center">
            <h2 className="heading-secondary">{t("shop.latestArticles")}</h2>
            <p className="mt-2 sm:mt-3 text-sm sm:text-base text-gray-600">{t("shop.latestArticlesSub")}</p>
          </div>
        </ScrollReveal>

        <ScrollRevealStagger className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
          {posts.map((post) => (
            <StaggerItem key={post._id}>
              <Link href={`/blog/${post.slug}`}>
                <article className="group overflow-hidden rounded-xl border border-gray-100 bg-white transition-all hover:shadow-lg active:scale-[0.99]">
                  <div className="aspect-[16/9] w-full bg-gray-100 overflow-hidden">
                    {post.featuredImage ? (
                      <img src={post.featuredImage} alt={post.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
                        <span className="text-sm text-gray-400">TKAY KONCEPTS</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 sm:p-5">
                    <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-accent">{post.category}</span>
                    <h3 className="mt-1.5 sm:mt-2 text-sm sm:text-lg font-semibold text-primary group-hover:text-accent transition-colors line-clamp-2">{post.title}</h3>
                    <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-gray-500 line-clamp-2">{post.excerpt}</p>
                    <div className="mt-3 sm:mt-4 flex items-center justify-between text-[10px] sm:text-xs text-gray-400">
                      <span>{t("shop.minRead", { count: post.readTime })}</span>
                      <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </article>
              </Link>
            </StaggerItem>
          ))}
        </ScrollRevealStagger>

        <ScrollReveal>
          <div className="mt-8 sm:mt-10 text-center">
            <Link href="/blog" className="inline-flex items-center gap-2 rounded-xl border-2 border-primary px-6 py-3 text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-white active:scale-[0.98] touch-feedback">
              {t("shop.viewAllArticles")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
