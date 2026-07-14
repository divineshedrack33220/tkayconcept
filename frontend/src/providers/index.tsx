"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "sonner";
import { useKeepAlive } from "@/hooks/useKeepAlive";

export const CLERK_ENABLED = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

function KeepAlive() {
  useKeepAlive();
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_bm90ZWQtbmV3dC00My5jbGVyay5hY2NvdW50cy5kZXYk";

  const content = (
    <QueryClientProvider client={queryClient}>
      <KeepAlive />
      {children}
      <Toaster position="bottom-right" richColors closeButton />
    </QueryClientProvider>
  );

  if (!clerkKey) return content;

  return <ClerkProvider publishableKey={clerkKey}>{content}</ClerkProvider>;
}
