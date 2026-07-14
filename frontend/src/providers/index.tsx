"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { Component, useState } from "react";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { useKeepAlive } from "@/hooks/useKeepAlive";
import { OfflineBanner } from "@/components/ui/offline-banner";
import { BackendStatusProvider } from "@/components/providers/backend-status";

const ClerkProviderWrapper = dynamic(
  () => import("@clerk/nextjs").then((m) => {
    const ClerkInner = ({ children }: { children: ReactNode }) => (
      <m.ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_bm90ZWQtbmV3dC00My5jbGVyay5hY2NvdW50cy5kZXYk"}>
        {children}
      </m.ClerkProvider>
    );
    return { default: ClerkInner };
  }),
  { ssr: false }
);

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

  return (
    <ClerkErrorBoundary fallback={content}>
      <ClerkProviderWrapper>{content}</ClerkProviderWrapper>
    </ClerkErrorBoundary>
  );
}
