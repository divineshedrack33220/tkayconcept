"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { useTranslation } from "@/i18n";
import api from "@/lib/api";
import type { BlogPost } from "@/types";

export function BlogPreview() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const controller = new AbortController();
    api.get("/blog?limit=6&status=published", { signal: controller.signal })
      .then((res) => { if (!controller.signal.aborted) setPosts(res.data.data); })
      .catch(() => {})
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.offsetWidth * 0.7;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  if (loading) {
    return (
      <section className="section-padding">
        <div className="container-custom">
          <div className="mb-12 text-center">
            <Skeleton className="mx-auto mb-3 h-8 w-48" />
          </div>
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="min-w-[280px] rounded-xl border border-gray-100 bg-white p-4">
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
          <div className="mb-8 sm:mb-12 flex items-end justify-between">
            <div>
              <h2 className="heading-secondary">{t("shop.latestArticles")}</h2>
              <p className="mt-2 text-sm sm:text-base text-gray-600">{t("shop.latestArticlesSub")}</p>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <button onClick={() => scroll("left")} aria-label="Previous articles" className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={() => scroll("right")} aria-label="Next articles" className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </ScrollReveal>

        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 scrollbar-hide"
        >
          {posts.map((post) => (
            <Link key={post._id} href={`/blog/${post.slug}`} className="snap-start min-w-[280px] sm:min-w-[340px] max-w-[340px]">
              <article className="group h-full overflow-hidden rounded-xl border border-gray-100 bg-white transition-all hover:shadow-lg active:scale-[0.99]">
                <div className="aspect-[16/9] w-full bg-gray-100 overflow-hidden">
                  {post.featuredImage ? (
                    <img src={post.featuredImage} alt={post.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
                      <span className="text-sm text-gray-400">TK Concepts</span>
                    </div>
                  )}
                </div>
                <div className="p-4 sm:p-5">
                  <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-accent">{post.category}</span>
                  <h3 className="mt-1.5 text-sm sm:text-base font-semibold text-primary group-hover:text-accent transition-colors line-clamp-2">{post.title}</h3>
                  <p className="mt-1.5 text-xs sm:text-sm text-gray-500 line-clamp-2">{post.excerpt}</p>
                  <div className="mt-3 flex items-center justify-between text-[10px] sm:text-xs text-gray-400">
                    <span>{t("shop.minRead", { count: post.readTime })}</span>
                    <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

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
