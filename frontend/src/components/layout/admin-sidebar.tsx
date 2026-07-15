"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  FileText,
  Palette,
  Image,
  Star,
  Ticket,
  Home,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  Mail,
  AlertTriangle,
} from "lucide-react";
import { useSafeClerk } from "@/lib/safe-clerk";

const sidebarLinks = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Categories", href: "/admin/categories", icon: FolderTree },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Blog", href: "/admin/blog", icon: FileText },
  { label: "Rooted Identity", href: "/admin/rooted-identity", icon: Palette },
  { label: "Media", href: "/admin/media", icon: Image },
  { label: "Testimonials", href: "/admin/testimonials", icon: Star },
  { label: "Coupons", href: "/admin/coupons", icon: Ticket },
  { label: "Homepage Builder", href: "/admin/homepage-builder", icon: Home },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Marketing", href: "/admin/marketing", icon: Mail },
  { label: "Abandoned Carts", href: "/admin/abandoned-carts", icon: AlertTriangle },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

interface AdminSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function AdminSidebar({ collapsed = false, onToggle, mobileOpen = false, onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();
  const { signOut } = useSafeClerk();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col bg-primary-dark text-white transition-all duration-300",
        collapsed ? "w-[68px]" : "w-64",
        // Mobile: hidden by default, slide in when open
        "max-lg:-translate-x-full",
        mobileOpen && "max-lg:translate-x-0"
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
        {!collapsed && (
          <Link href="/admin" onClick={onCloseMobile}>
            <img src="/logo.png" alt="TK Concepts" className="h-8 w-auto" />
          </Link>
        )}
        {/* Desktop collapse toggle */}
        <button
          onClick={onToggle}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white max-lg:hidden"
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </button>
        {/* Mobile close */}
        <button
          onClick={onCloseMobile}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white lg:hidden"
        >
          <span className="text-lg leading-none">&times;</span>
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
        <ul className="flex flex-col gap-1 px-2">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onCloseMobile}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent text-white"
                      : "text-gray-300 hover:bg-white/10 hover:text-white",
                    collapsed && "justify-center px-2"
                  )}
                  title={collapsed ? link.label : undefined}
                >
                  <link.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span>{link.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 p-2">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white"
        >
          <Home className="h-5 w-5" />
          {!collapsed && <span>View Site</span>}
        </Link>
        <button
          onClick={() => signOut()}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-red-400"
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
