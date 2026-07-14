"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Rating } from "@/components/ui/rating";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { useTranslation } from "@/i18n";
import api from "@/lib/api";
import type { Testimonial } from "@/types";

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const controller = new AbortController();
    api.get("/testimonials/public?limit=10", { signal: controller.signal })
      .then((res) => { if (!controller.signal.aborted) setTestimonials(res.data.data); })
      .catch(() => {})
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.offsetWidth * 0.6;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  useEffect(() => {
    if (testimonials.length <= 1) return;
    const el = scrollRef.current;
    let paused = false;
    const handleMouseEnter = () => { paused = true; };
    const handleMouseLeave = () => { paused = false; };
    el?.addEventListener("mouseenter", handleMouseEnter);
    el?.addEventListener("mouseleave", handleMouseLeave);

    const interval = setInterval(() => {
      if (!el || paused) return;
      const atEnd = el.scrollLeft + el.offsetWidth >= el.scrollWidth - 10;
      if (atEnd) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: el.offsetWidth * 0.6, behavior: "smooth" });
      }
    }, 6000);
    return () => {
      clearInterval(interval);
      el?.removeEventListener("mouseenter", handleMouseEnter);
      el?.removeEventListener("mouseleave", handleMouseLeave);
    };
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
              <div key={i} className="min-w-[280px] rounded-xl bg-white p-6 shadow-sm">
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
        <ScrollReveal>
          <div className="mb-8 sm:mb-12 text-center">
            <h2 className="heading-secondary">{t("shop.whatCustomersSay")}</h2>
            <p className="mt-2 sm:mt-3 text-sm sm:text-base text-gray-600">{t("shop.whatCustomersSaySub")}</p>
          </div>
        </ScrollReveal>

        <div className="relative group/carousel">
          {/* Arrows */}
          <button
            onClick={() => scroll("left")}
            aria-label="Previous testimonial"
            className="absolute -left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-gray-50"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <button
            onClick={() => scroll("right")}
            aria-label="Next testimonial"
            className="absolute -right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-gray-50"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>

          {/* Track */}
          <div
            ref={scrollRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 scrollbar-hide"
          >
            {testimonials.map((item) => (
              <div
                key={item._id}
                className="snap-start min-w-[280px] sm:min-w-[320px] max-w-[320px] rounded-xl border border-gray-100 bg-white p-5 sm:p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <Rating value={item.rating} size="sm" />
                <p className="mt-3 sm:mt-4 text-xs sm:text-sm leading-relaxed text-gray-600 line-clamp-4">
                  &ldquo;{item.content}&rdquo;
                </p>
                <div className="mt-3 sm:mt-4 flex items-center gap-2.5 sm:gap-3 border-t border-gray-100 pt-3 sm:pt-4">
                  <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-primary/10 text-xs sm:text-sm font-semibold text-primary">
                    {item.customerName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-primary">{item.customerName}</p>
                    {item.product && (
                      <p className="text-[10px] sm:text-xs text-gray-400">{item.product.name}</p>
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
