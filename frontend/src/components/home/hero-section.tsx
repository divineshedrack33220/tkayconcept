"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="relative flex min-h-[80vh] items-center bg-primary">
      <div className="absolute inset-0 bg-gradient-to-r from-primary-dark/90 to-primary/70" />
      <div className="container-custom relative z-10 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <h1 className="text-5xl font-bold leading-tight text-white md:text-6xl lg:text-7xl">
            Faith.<br />
            <span className="text-accent">Purpose.</span><br />
            Identity.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-gray-300">
            Creating products that inspire people to live boldly and purposefully.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/shop">
              <Button variant="accent" size="lg">Shop Now</Button>
            </Link>
            <Link href="/about">
              <Button variant="secondary" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
                Explore Our Story
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
