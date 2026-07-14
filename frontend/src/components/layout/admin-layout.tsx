"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSafeUser } from "@/lib/safe-clerk";
import { AdminSidebar } from "./admin-sidebar";
import { AdminHeader } from "./admin-header";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isSignedIn, user } = useSafeUser();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [checked, setChecked] = useState(false);

  const role = user?.publicMetadata?.role as string | undefined;
  const isAdmin = role === "admin" || role === "super_admin";

  useEffect(() => {
    if (isSignedIn === false) {
      router.replace("/sign-in");
    } else if (isSignedIn && !isAdmin) {
      router.replace("/");
    } else {
      setChecked(true);
    }
  }, [isSignedIn, isAdmin, router]);

  if (!isSignedIn || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <AdminSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggle={() => setCollapsed(!collapsed)}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className={cn(
        "transition-all duration-300",
        "lg:ml-64",
        collapsed && "lg:ml-[68px]"
      )}>
        <AdminHeader onMenuClick={() => setMobileOpen(!mobileOpen)} />
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
