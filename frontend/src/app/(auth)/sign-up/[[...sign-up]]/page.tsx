"use client";

import { CLERK_ENABLED } from "@/lib/safe-clerk";
import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
  if (!CLERK_ENABLED) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-4">Sign Up</h1>
          <p className="text-gray-600 mb-6">Authentication is not configured yet.</p>
          <Link href="/" className="text-accent hover:underline">Go Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <SignUp />
    </div>
  );
}
