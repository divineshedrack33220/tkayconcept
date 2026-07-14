import { useClerkCtx } from "@/lib/clerk-context";

const CLERK_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_bm90ZWQtbmV3dC00My5jbGVyay5hY2NvdW50cy5kZXYk";
export const CLERK_ENABLED = !!CLERK_KEY;

const fallbackAuth = { isSignedIn: false, userId: null, getToken: async () => null } as const;
const fallbackUser = { isSignedIn: false, user: null } as const;
const fallbackClerk = { signOut: async () => {} } as const;

type SafeAuth = { isSignedIn: boolean; userId: string | null; getToken: () => Promise<string | null> };
type SafeUser = {
  isSignedIn: boolean;
  user: {
    firstName?: string;
    lastName?: string;
    id?: string;
    imageUrl?: string;
    emailAddresses?: { emailAddress: string }[];
    primaryEmailAddress?: { emailAddress: string };
    publicMetadata?: Record<string, unknown>;
  } | null;
};
type SafeClerk = { signOut: () => Promise<void> };

export function useSafeAuth(): SafeAuth {
  if (!CLERK_ENABLED) return fallbackAuth;
  const ctx = useClerkCtx();
  if (!ctx) return fallbackAuth;
  return ctx.auth;
}

export function useSafeUser(): SafeUser {
  if (!CLERK_ENABLED) return fallbackUser;
  const ctx = useClerkCtx();
  if (!ctx) return fallbackUser;
  return ctx.user;
}

export function useSafeClerk(): SafeClerk {
  if (!CLERK_ENABLED) return fallbackClerk;
  const ctx = useClerkCtx();
  if (!ctx) return fallbackClerk;
  return { signOut: ctx.signOut };
}
