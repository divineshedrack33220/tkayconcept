"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ClerkContextProvider } from "@/lib/clerk-context";
import type { ReactNode } from "react";

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_bm90ZWQtbmV3dC00My5jbGVyay5hY2NvdW50cy5kZXYk";

export function ClerkProviderWrap({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider publishableKey={clerkKey}>
      <ClerkContextProvider>{children}</ClerkContextProvider>
    </ClerkProvider>
  );
}
