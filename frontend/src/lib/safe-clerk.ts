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

let clerkMod: Record<string, unknown> | null = null;

function loadClerk() {
  if (clerkMod) return clerkMod;
  if (typeof window === "undefined") return null;
  try {
    clerkMod = require("@clerk/nextjs");
    return clerkMod;
  } catch {
    return null;
  }
}

export function useSafeAuth(): SafeAuth {
  if (!CLERK_ENABLED) return fallbackAuth;
  const mod = loadClerk();
  if (!mod) return fallbackAuth;
  try {
    return (mod as { useAuth: () => SafeAuth }).useAuth();
  } catch {
    return fallbackAuth;
  }
}

export function useSafeUser(): SafeUser {
  if (!CLERK_ENABLED) return fallbackUser;
  const mod = loadClerk();
  if (!mod) return fallbackUser;
  try {
    return (mod as { useUser: () => SafeUser }).useUser();
  } catch {
    return fallbackUser;
  }
}

export function useSafeClerk(): SafeClerk {
  if (!CLERK_ENABLED) return fallbackClerk;
  const mod = loadClerk();
  if (!mod) return fallbackClerk;
  try {
    return (mod as { useClerk: () => SafeClerk }).useClerk();
  } catch {
    return fallbackClerk;
  }
}
