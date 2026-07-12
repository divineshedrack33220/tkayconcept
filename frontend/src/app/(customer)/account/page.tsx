"use client";

import { useUser, useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  User,
  MapPin,
  Package,
  Heart,
  Settings,
  Camera,
  Save,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthenticatedApi } from "@/hooks/useAuthenticatedApi";
import { toast } from "sonner";

interface UserProfile {
  firstName: string;
  lastName: string;
  phone: string;
}

export default function AccountPage() {
  const { isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const authApi = useAuthenticatedApi();
  const [profile, setProfile] = useState<UserProfile>({
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isSignedIn) return;

    const fetchProfile = async () => {
      try {
        const res = await authApi.get("/users/me");
        const data = res.data.data;
        setProfile({
          firstName: data.firstName || user?.firstName || "",
          lastName: data.lastName || user?.lastName || "",
          phone: data.phone || "",
        });
      } catch {
        setProfile({
          firstName: user?.firstName || "",
          lastName: user?.lastName || "",
          phone: "",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isSignedIn, user]);

  const handleSyncAndSave = async () => {
    setSaving(true);
    try {
      const token = await getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await authApi.post("/users/sync", {
        clerkId: user?.id,
        email: user?.emailAddresses?.[0]?.emailAddress,
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
      });

      await authApi.put("/users/me", {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
      });

      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="section-padding container-custom">
        <div className="mx-auto max-w-md text-center">
          <h1 className="heading-secondary mb-4">Sign In Required</h1>
          <p className="text-gray-600 mb-6">
            Please sign in to access your account.
          </p>
          <Link href="/sign-in">
            <Button variant="primary">Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: "Profile", href: "/account", icon: User, active: true },
    { label: "Addresses", href: "/account/addresses", icon: MapPin },
    { label: "Orders", href: "/orders", icon: Package },
    { label: "Wishlist", href: "/wishlist", icon: Heart },
  ];

  return (
    <div className="section-padding container-custom">
      <div className="mx-auto max-w-4xl">
        <h1 className="heading-secondary mb-8">My Account</h1>

        <div className="grid gap-8 md:grid-cols-[240px_1fr]">
          {/* Sidebar */}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  item.active
                    ? "bg-accent/10 text-accent"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Main Content */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-4">
              <div className="relative">
                {user?.imageUrl ? (
                  <img src={user.imageUrl} alt="" className="h-20 w-20 rounded-full object-cover" />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent text-2xl font-bold text-white">
                    {profile.firstName?.charAt(0) || user?.firstName?.charAt(0) || "U"}
                  </div>
                )}
                <button className="absolute bottom-0 right-0 rounded-full bg-white p-1.5 shadow-md hover:bg-gray-50">
                  <Camera className="h-4 w-4 text-gray-600" />
                </button>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {profile.firstName} {profile.lastName}
                </h2>
                <p className="text-sm text-gray-500">
                  {user?.emailAddresses?.[0]?.emailAddress}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <Input
                    value={profile.firstName}
                    onChange={(e) =>
                      setProfile({ ...profile, firstName: e.target.value })
                    }
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <Input
                    value={profile.lastName}
                    onChange={(e) =>
                      setProfile({ ...profile, lastName: e.target.value })
                    }
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  value={user?.emailAddresses?.[0]?.emailAddress || ""}
                  disabled
                  className="bg-gray-50"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Email is managed by your authentication provider
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <Input
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                  placeholder="Enter phone number"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  variant="primary"
                  onClick={handleSyncAndSave}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
