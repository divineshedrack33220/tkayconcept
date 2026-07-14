"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Component, useState } from "react";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { useKeepAlive } from "@/hooks/useKeepAlive";
import { OfflineBanner } from "@/components/ui/offline-banner";
import { BackendStatusProvider } from "@/components/providers/backend-status";

export const CLERK_ENABLED = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

function KeepAlive() {
  useKeepAlive();
  return null;
}

class ClerkErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
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

  const inner = (
    <BackendStatusProvider>
      <OfflineBanner />
      <KeepAlive />
      {children}
      <Toaster position="bottom-right" richColors closeButton />
    </BackendStatusProvider>
  );

  const content = (
    <QueryClientProvider client={queryClient}>{inner}</QueryClientProvider>
  );

  if (!CLERK_ENABLED) return content;

  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!;

  return (
    <ClerkErrorBoundary fallback={content}>
      <ClerkProvider publishableKey={clerkKey}>{content}</ClerkProvider>
    </ClerkErrorBoundary>
  );
}
