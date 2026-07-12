"use client";

import { useEffect, useRef, useState } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import type { Testimonial } from "@/types";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
        />
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get("/testimonials/public?limit=10")
      .then((res) => setTestimonials(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.offsetWidth * 0.6;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  useEffect(() => {
    if (testimonials.length <= 1) return;
    const el = scrollRef.current;
    const interval = setInterval(() => {
      if (!el) return;
      const atEnd = el.scrollLeft + el.offsetWidth >= el.scrollWidth - 10;
      if (atEnd) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: el.offsetWidth * 0.6, behavior: "smooth" });
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  if (loading) {
    return (
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="mb-12 text-center">
            <Skeleton className="mx-auto mb-3 h-8 w-64" />
          </div>
          <div className="flex gap-6 overflow-hidden">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="min-w-[320px] rounded-xl bg-white p-6 shadow-sm">
                <Skeleton className="mb-3 h-4 w-24" />
                <Skeleton className="mb-2 h-4 w-full" />
                <Skeleton className="mb-2 h-4 w-full" />
                <Skeleton className="mb-4 h-4 w-3/4" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) return null;

  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="mb-12 text-center">
          <h2 className="heading-secondary">What Our Customers Say</h2>
          <p className="mt-3 text-gray-600">Real stories from our community</p>
        </div>

        <div className="relative group/carousel">
          {/* Arrows */}
          <button
            onClick={() => scroll("left")}
            className="absolute -left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-gray-50"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="absolute -right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-gray-50"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>

          {/* Track */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 scrollbar-hide"
          >
            {testimonials.map((t) => (
              <div
                key={t._id}
                className="snap-start min-w-[320px] max-w-[320px] rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <StarRating rating={t.rating} />
                <p className="mt-4 text-sm leading-relaxed text-gray-600 line-clamp-4">
                  &ldquo;{t.content}&rdquo;
                </p>
                <div className="mt-4 flex items-center gap-3 border-t border-gray-100 pt-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {t.customerName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary">{t.customerName}</p>
                    {t.product && (
                      <p className="text-xs text-gray-400">{t.product.name}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
