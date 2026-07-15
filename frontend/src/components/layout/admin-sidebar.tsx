"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  FileText,
  Star,
  Ticket,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronDown,
  Home,
  Mail,
  AlertTriangle,
  BarChart2,
  ShoppingBag,
  Megaphone,
} from "lucide-react";
import { useSafeClerk } from "@/lib/safe-clerk";

interface SidebarGroup {
  label: string;
  icon: React.ElementType;
  children: { label: string; href: string; icon: React.ElementType }[];
}

const sidebarGroups: SidebarGroup[] = [
  {
    label: "Overview",
    icon: BarChart2,
    children: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Catalog",
    icon: Package,
    children: [
      { label: "Products", href: "/admin/products", icon: Package },
      { label: "Categories", href: "/admin/categories", icon: FolderTree },
      { label: "Testimonials", href: "/admin/testimonials", icon: Star },
    ],
  },
  {
    label: "Sales",
    icon: ShoppingBag,
    children: [
      { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
      { label: "Coupons", href: "/admin/coupons", icon: Ticket },
      { label: "Abandoned Carts", href: "/admin/abandoned-carts", icon: AlertTriangle },
    ],
  },
  {
    label: "Customers",
    icon: Users,
    children: [
      { label: "Customers", href: "/admin/customers", icon: Users },
    ],
  },
  {
    label: "Content",
    icon: Megaphone,
    children: [
      { label: "Blog", href: "/admin/blog", icon: FileText },
      { label: "Marketing", href: "/admin/marketing", icon: Mail },
    ],
  },
  {
    label: "Settings",
    icon: Settings,
    children: [
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
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

  const isGroupActive = (group: SidebarGroup) =>
    group.children.some(
      (child) => pathname === child.href || (child.href !== "/admin" && pathname.startsWith(child.href))
    );

  const isItemActive = (href: string) =>
    pathname === href || (href !== "/admin" && pathname.startsWith(href));

  // Auto-expand groups that have active items
  const [expandedGroups, setExpandedGroups] = useState<string[]>(() => {
    return sidebarGroups.filter(isGroupActive).map((g) => g.label);
  });

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col bg-primary-dark text-white transition-all duration-300",
        collapsed ? "w-[68px]" : "w-64",
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
        <button
          onClick={onToggle}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white max-lg:hidden ml-auto"
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </button>
        <button
          onClick={onCloseMobile}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white lg:hidden"
        >
          <span className="text-lg leading-none">&times;</span>
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
        <ul className="flex flex-col gap-0.5 px-2">
          {sidebarGroups.map((group) => {
            const expanded = expandedGroups.includes(group.label);
            const active = isGroupActive(group);

            // Single-item groups render as flat links
            if (group.children.length === 1) {
              const child = group.children[0];
              const itemActive = isItemActive(child.href);
              return (
                <li key={group.label}>
                  <Link
                    href={child.href}
                    onClick={onCloseMobile}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      itemActive
                        ? "bg-accent text-white"
                        : "text-gray-300 hover:bg-white/10 hover:text-white",
                      collapsed && "justify-center px-2"
                    )}
                    title={collapsed ? child.label : undefined}
                  >
                    <child.icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span>{child.label}</span>}
                  </Link>
                </li>
              );
            }

            return (
              <li key={group.label}>
                <button
                  onClick={() => toggleGroup(group.label)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active && !expanded
                      ? "bg-accent/20 text-accent"
                      : "text-gray-300 hover:bg-white/10 hover:text-white",
                    collapsed && "justify-center px-2"
                  )}
                  title={collapsed ? group.label : undefined}
                >
                  <group.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{group.label}</span>
                      <ChevronDown
                        className={cn(
                          "h-3.5 w-3.5 transition-transform duration-200",
                          expanded ? "rotate-180" : ""
                        )}
                      />
                    </>
                  )}
                </button>

                {expanded && !collapsed && (
                  <ul className="ml-4 mt-0.5 border-l border-white/10 pl-3">
                    {group.children.map((child) => {
                      const itemActive = isItemActive(child.href);
                      return (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            onClick={onCloseMobile}
                            className={cn(
                              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                              itemActive
                                ? "bg-accent text-white"
                                : "text-gray-400 hover:bg-white/10 hover:text-white"
                            )}
                          >
                            <child.icon className="h-4 w-4 flex-shrink-0" />
                            <span>{child.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
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
