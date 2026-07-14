"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className="fixed bottom-24 right-4 sm:right-6 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white shadow-lg elevation-3 transition-all hover:bg-primary-light active:scale-90 touch-feedback animate-scale-in sm:bottom-6"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
