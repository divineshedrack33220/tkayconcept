"use client";

import { useEffect, useState } from "react";
import { X, Gift, Copy, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "tkay-first-visit-shown";
const DISCOUNT_CODE = "WELCOME15";

export function FirstPurchasePopup() {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (!localStorage.getItem(STORAGE_KEY)) {
          setShow(true);
        }
      } catch {
        setShow(true);
      }
    }, 12000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setShow(false);
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch {}
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(DISCOUNT_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleDismiss} />
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl animate-slide-in-up">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          aria-label="Close discount popup"
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-gray-400 transition-colors hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Top accent */}
        <div className="bg-gradient-to-r from-accent to-accent-light px-6 py-8 text-center text-white">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
            <Gift className="h-8 w-8" />
          </div>
          <p className="mb-1 text-sm font-medium text-white/80">Welcome to TKAYKONCEPTS!</p>
          <h2 className="text-3xl font-bold">15% OFF</h2>
          <p className="mt-1 text-sm text-white/80">Your first order</p>
        </div>

        {/* Content */}
        <div className="px-6 py-6 text-center">
          <p className="mb-5 text-sm text-gray-600">
            Use code below at checkout and save on your first purchase.
          </p>

          <div className="mb-5 flex items-center justify-center gap-3 rounded-xl border-2 border-dashed border-accent/30 bg-accent/5 p-4">
            <span className="text-xl font-bold tracking-widest text-accent">{DISCOUNT_CODE}</span>
            <button
              onClick={handleCopy}
              aria-label={copied ? "Code copied" : "Copy discount code"}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white transition-all hover:bg-accent-light"
            >
              {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>

          <p className="mb-5 text-xs text-gray-400">No minimum order. One-time use only.</p>

          <Button variant="accent" className="w-full" size="lg" onClick={handleDismiss}>
            Start Shopping
          </Button>
        </div>
      </div>
    </div>
  );
}
