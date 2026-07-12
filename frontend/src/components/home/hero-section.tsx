"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Star, Truck, Shield, RotateCcw } from "lucide-react";

const trustItems = [
  { icon: Star, text: "4.9/5 Rated", sub: "500+ Reviews" },
  { icon: Truck, text: "Free Shipping", sub: "Orders over $75" },
  { icon: Shield, text: "Secure Checkout", sub: "SSL Encrypted" },
  { icon: RotateCcw, text: "30-Day Returns", sub: "Hassle Free" },
];

export function HeroSection() {
  return (
    <section className="relative flex min-h-[85vh] items-center overflow-hidden bg-primary-dark">
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-dark via-primary to-primary-light opacity-90" />
        <div className="absolute -right-1/4 -top-1/4 h-[600px] w-[600px] rounded-full bg-accent/10 blur-[120px] animate-pulse" />
        <div className="absolute -bottom-1/4 -left-1/4 h-[400px] w-[400px] rounded-full bg-accent/5 blur-[100px] animate-pulse [animation-delay:2s]" />
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      <div className="container-custom relative z-10 py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              <span className="text-sm font-medium text-accent">New Collection Available</span>
            </motion.div>

            <h1 className="text-5xl font-bold leading-[1.1] text-white md:text-6xl lg:text-7xl">
              Faith.
              <br />
              <span className="bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent">
                Purpose.
              </span>
              <br />
              Identity.
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-gray-300">
              Creating products that inspire people to live boldly and purposefully.
              Explore our curated collections designed to strengthen your faith journey.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/shop">
                <Button variant="accent" size="lg" className="group relative overflow-hidden px-8">
                  <span className="relative z-10">Shop Now</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-accent-dark to-accent opacity-0 transition-opacity group-hover:opacity-100" />
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="secondary" size="lg" className="border-white/20 text-white hover:border-white/40 hover:bg-white/10">
                  Learn More
                </Button>
              </Link>
            </div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-10 flex items-center gap-4"
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-8 w-8 rounded-full border-2 border-primary-dark bg-gradient-to-br from-accent/80 to-accent ring-2 ring-primary-dark" />
                ))}
              </div>
              <div className="text-sm">
                <p className="font-semibold text-white">2,500+ Happy Customers</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="ml-1 text-gray-400">4.9 average</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Featured product showcase */}
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:block"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-accent/20 to-transparent blur-2xl" />
              <div className="relative rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Books", img: "https://picsum.photos/seed/tkay-book/300/300" },
                    { label: "Apparel", img: "https://picsum.photos/seed/tkay-shirt/300/300" },
                    { label: "Games", img: "https://picsum.photos/seed/tkay-game/300/300" },
                    { label: "Devotionals", img: "https://picsum.photos/seed/tkay-dev/300/300" },
                  ].map((item, i) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + i * 0.15 }}
                      className="group relative overflow-hidden rounded-2xl"
                    >
                      <img
                        src={item.img}
                        alt={item.label}
                        className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                      <span className="absolute bottom-3 left-3 text-sm font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                        {item.label}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Trust bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4"
        >
          {trustItems.map(({ icon: Icon, text, sub }) => (
            <div key={text} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
              <Icon className="h-5 w-5 flex-shrink-0 text-accent" />
              <div>
                <p className="text-sm font-semibold text-white">{text}</p>
                <p className="text-xs text-gray-400">{sub}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
