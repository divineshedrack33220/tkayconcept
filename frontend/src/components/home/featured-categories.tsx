"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BookOpen, Gamepad2, Heart, Puzzle, BookMarked, BookCopy, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { useTranslation } from "@/i18n";
import { useRefetchOnWakeUp } from "@/hooks/useRefetchOnWakeUp";
import api from "@/lib/api";
import type { Category } from "@/types";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  games: Gamepad2,
  puzzles: Puzzle,
  devotionals: Heart,
  storybooks: BookCopy,
  ebooks: BookMarked,
};

const fallbackCategories = [
  { name: "Games", slug: "games", href: "/shop/games", description: "Fun and educational games for the whole family." },
  { name: "Puzzles", slug: "puzzles", href: "/shop/puzzles", description: "Challenging puzzles that sharpen the mind and strengthen faith." },
  { name: "Devotionals", slug: "devotionals", href: "/shop/devotionals", description: "Daily devotionals to deepen your spiritual journey." },
  { name: "Storybooks", slug: "storybooks", href: "/shop/storybooks", description: "Inspiring stories for readers of all ages." },
  { name: "Ebooks", slug: "ebooks", href: "/shop/ebooks", description: "Digital reads for faith-driven growth on the go." },
];

export function FeaturedCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const refetchKey = useRefetchOnWakeUp();

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    api.get("/categories?active=true&limit=8", { signal: controller.signal })
      .then((res) => { if (!controller.signal.aborted) setCategories(res.data.data || []); })
      .catch(() => {})
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [refetchKey]);

  const displayCategories = categories.length > 0
    ? categories.slice(0, 8).map((c) => ({
        name: c.name,
        slug: c.slug,
        href: `/shop?category=${c.slug}`,
        description: c.description,
      }))
    : fallbackCategories;

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.offsetWidth * 0.6;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  if (loading) {
    return (
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="mb-12 text-center">
            <Skeleton className="mx-auto mb-3 h-8 w-56" />
            <Skeleton className="mx-auto h-4 w-64" />
          </div>
          <div className="flex gap-6 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="min-w-[260px] rounded-xl bg-white p-8 text-center">
                <Skeleton className="mx-auto mb-4 h-16 w-16 rounded-full" />
                <Skeleton className="mx-auto mb-2 h-5 w-24" />
                <Skeleton className="mx-auto h-3 w-32" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <ScrollReveal>
          <div className="mb-8 sm:mb-12 text-center">
            <h2 className="heading-secondary">{t("shop.exploreCollections")}</h2>
            <p className="mt-2 sm:mt-3 text-sm sm:text-base text-gray-600">{t("shop.exploreCollectionsSub")}</p>
          </div>
        </ScrollReveal>

        <div className="relative group/carousel">
          {/* Arrows */}
          <button
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className="absolute -left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-gray-50"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <button
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className="absolute -right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-gray-50"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>

          {/* Track */}
          <div
            ref={scrollRef}
            className="flex gap-4 sm:gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 scrollbar-hide"
          >
            {displayCategories.map((cat, i) => {
              const Icon = iconMap[cat.slug] || BookOpen;
              return (
                <Link key={cat.slug} href={cat.href} className="snap-start">
                  <div className="group min-w-[200px] sm:min-w-[240px] max-w-[240px] rounded-xl border border-gray-200 bg-white p-5 sm:p-8 text-center transition-all hover:border-accent hover:shadow-lg active:scale-[0.98]">
                    <div className="mx-auto mb-3 sm:mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-white">
                      <Icon className="h-5 w-5 sm:h-7 sm:w-7" />
                    </div>
                    <h3 className="text-sm sm:text-lg font-semibold text-primary">{cat.name}</h3>
                    <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-gray-500 line-clamp-2">{cat.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
