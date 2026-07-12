"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <p className="mt-4 text-lg text-gray-600">Page not found</p>
      <p className="mt-2 text-sm text-gray-400">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-8">
        <Link href="/">
          <Button variant="primary">Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}
