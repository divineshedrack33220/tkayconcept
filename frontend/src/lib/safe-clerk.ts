import { useAuth as clerkUseAuth, useUser as clerkUseUser, useClerk as clerkUseClerk } from "@clerk/nextjs";

export const CLERK_ENABLED = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

const fallbackAuth = { isSignedIn: false, userId: null } as const;
const fallbackUser = { isSignedIn: false, user: null } as const;
const fallbackClerk = { signOut: async () => {} } as const;

export function useSafeAuth() {
  try {
    return clerkUseAuth();
  } catch {
    return fallbackAuth;
  }
}

export function useSafeUser() {
  try {
    return clerkUseUser();
  } catch {
    return fallbackUser;
  }
}

export function useSafeClerk() {
  try {
    return clerkUseClerk();
  } catch {
    return fallbackClerk;
  }
}
