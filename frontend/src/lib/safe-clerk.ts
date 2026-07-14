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

let clerkHooks: { useAuth: () => SafeAuth; useUser: () => SafeUser; useClerk: () => SafeClerk } | null = null;

function getClerkHooks() {
  if (clerkHooks) return clerkHooks;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    clerkHooks = require("@clerk/nextjs");
    return clerkHooks;
  } catch {
    return null;
  }
}

export function useSafeAuth(): SafeAuth {
  const hooks = getClerkHooks();
  if (!hooks) return fallbackAuth;
  try {
    return hooks.useAuth();
  } catch {
    return fallbackAuth;
  }
}

export function useSafeUser(): SafeUser {
  const hooks = getClerkHooks();
  if (!hooks) return fallbackUser;
  try {
    return hooks.useUser();
  } catch {
    return fallbackUser;
  }
}

export function useSafeClerk(): SafeClerk {
  const hooks = getClerkHooks();
  if (!hooks) return fallbackClerk;
  try {
    return hooks.useClerk();
  } catch {
    return fallbackClerk;
  }
}
