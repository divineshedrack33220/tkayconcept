"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Gamepad2, Palette, Printer, Shirt, ShoppingBag, Heart, Watch } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import type { Category } from "@/types";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  books: BookOpen,
  games: Gamepad2,
  apparel: Shirt,
  merchandise: ShoppingBag,
  devotionals: Heart,
  accessories: Watch,
  "rooted-identity": Palette,
  "custom-printing": Printer,
};

const fallbackCategories = [
  { name: "Books", slug: "books", href: "/shop/books", description: "Inspiring reads for every season" },
  { name: "Games", slug: "games", href: "/shop/games", description: "Fun for the whole family" },
  { name: "Rooted Identity", slug: "rooted-identity", href: "/rooted-identity", description: "Wear your faith boldly" },
  { name: "Custom Printing", slug: "custom-printing", href: "/custom-printing", description: "Bring your vision to life" },
];

export function FeaturedCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/categories?active=true&limit=8")
      .then((res) => setCategories(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const displayCategories = categories.length > 0
    ? categories.slice(0, 8).map((c) => ({
        name: c.name,
        slug: c.slug,
        href: `/shop?category=${c.slug}`,
        description: c.description,
      }))
    : fallbackCategories;

  if (loading) {
    return (
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="mb-12 text-center">
            <Skeleton className="mx-auto mb-3 h-8 w-56" />
            <Skeleton className="mx-auto h-4 w-64" />
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-white p-8 text-center">
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
        <div className="mb-12 text-center">
          <h2 className="heading-secondary">Explore Our Collections</h2>
          <p className="mt-3 text-gray-600">Discover products designed to inspire</p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {displayCategories.map((cat) => {
            const Icon = iconMap[cat.slug] || BookOpen;
            return (
              <Link key={cat.slug} href={cat.href}>
                <div className="group rounded-xl border border-gray-200 bg-white p-8 text-center transition-all hover:border-accent hover:shadow-lg">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-white">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-semibold text-primary">{cat.name}</h3>
                  <p className="mt-2 text-sm text-gray-500">{cat.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
