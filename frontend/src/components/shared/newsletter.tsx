"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: API call
    setTimeout(() => {
      toast.success("Thanks for subscribing!");
      setEmail("");
      setLoading(false);
    }, 1000);
  };

  return (
    <section className="bg-primary py-16">
      <div className="container-custom text-center">
        <h2 className="text-2xl font-bold text-white md:text-3xl">Join Our Community</h2>
        <p className="mt-3 text-gray-300">Subscribe for updates, new releases, and inspiration.</p>
        <form onSubmit={handleSubmit} className="mx-auto mt-8 flex max-w-md gap-3">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1"
          />
          <Button type="submit" variant="accent" isLoading={loading}>
            Subscribe
          </Button>
        </form>
      </div>
    </section>
  );
}
