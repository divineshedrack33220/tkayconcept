import { NextRequest, NextResponse } from "next/server";

const CLERK_ENABLED = !!(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_bm90ZWQtbmV3dC00My5jbGVyay5hY2NvdW50cy5kZXYk");

export async function proxy(req: NextRequest) {
  if (!CLERK_ENABLED) return NextResponse.next();

  const { clerkMiddleware, createRouteMatcher } = await import("@clerk/nextjs/server");

  const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
  const isCustomerRoute = createRouteMatcher([
    "/cart",
    "/checkout",
    "/account(.*)",
    "/orders",
    "/wishlist",
  ]);

  const handler = clerkMiddleware(async (auth, req) => {
    if (isAdminRoute(req) || isCustomerRoute(req)) {
      const { userId } = await auth();
      if (!userId) {
        const signInUrl = new URL("/sign-in", req.url);
        signInUrl.searchParams.set("redirect_url", req.url);
        return NextResponse.redirect(signInUrl);
      }
    }
  });

  return handler(req, {} as never) as Promise<NextResponse>;
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
