"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useAuth, useUser, useClerk } from "@clerk/nextjs";

type ClerkAuth = { isSignedIn: boolean; userId: string | null; getToken: () => Promise<string | null> };
type ClerkUser = {
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
type ClerkCtx = { auth: ClerkAuth; user: ClerkUser; signOut: () => Promise<void> };

const ClerkCtx = createContext<ClerkCtx | null>(null);

export function useClerkCtx() {
  return useContext(ClerkCtx);
}

export function ClerkContextProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const user = useUser();
  const clerk = useClerk();

  return (
    <ClerkCtx.Provider
      value={{
        auth: { isSignedIn: auth.isSignedIn, userId: auth.userId, getToken: auth.getToken },
        user: {
          isSignedIn: user.isSignedIn,
          user: user.user
            ? {
                firstName: user.user.firstName,
                lastName: user.user.lastName,
                id: user.user.id,
                imageUrl: user.user.imageUrl,
                emailAddresses: user.user.emailAddresses,
                primaryEmailAddress: user.user.primaryEmailAddress,
                publicMetadata: user.user.publicMetadata,
              }
            : null,
        },
        signOut: clerk.signOut,
      }}
    >
      {children}
    </ClerkCtx.Provider>
  );
}
