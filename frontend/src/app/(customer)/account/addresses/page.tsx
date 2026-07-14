"use client";

import { useSafeUser } from "@/lib/safe-clerk";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  User,
  MapPin,
  Package,
  Heart,
  Plus,
  Trash2,
  Star,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useAuthenticatedApi } from "@/hooks/useAuthenticatedApi";
import { toast } from "sonner";
import type { Address } from "@/types";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY",
];

export default function AddressesPage() {
  const { isSignedIn, user } = useSafeUser();
  const authApi = useAuthenticatedApi();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    label: "Home",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
    isDefault: false,
  });

  useEffect(() => {
    if (!isSignedIn) return;
    fetchAddresses();
  }, [isSignedIn]);

  const fetchAddresses = async () => {
    try {
      const res = await authApi.get("/users/me/addresses");
      setAddresses(res.data.data);
    } catch {
      toast.error("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setForm({ label: "Home", street: "", city: "", state: "", zipCode: "", country: "US", isDefault: addresses.length === 0 });
    setShowModal(true);
  };

  const openEdit = (addr: Address) => {
    setEditingId(addr._id!);
    setForm({
      label: addr.label,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      zipCode: addr.zipCode,
      country: addr.country,
      isDefault: addr.isDefault,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.street || !form.city || !form.state || !form.zipCode) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        const res = await authApi.put(`/users/me/addresses/${editingId}`, form);
        setAddresses(res.data.data);
        toast.success("Address updated!");
      } else {
        const res = await authApi.post("/users/me/addresses", form);
        setAddresses(res.data.data);
        toast.success("Address added!");
      }
      setShowModal(false);
    } catch {
      toast.error("Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this address?")) return;
    try {
      const res = await authApi.delete(`/users/me/addresses/${id}`);
      setAddresses(res.data.data);
      toast.success("Address deleted!");
    } catch {
      toast.error("Failed to delete address");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await authApi.put(`/users/me/addresses/${id}/default`);
      setAddresses(res.data.data);
      toast.success("Default address updated!");
    } catch {
      toast.error("Failed to set default");
    }
  };

  if (!isSignedIn) {
    return (
      <div className="section-padding container-custom">
        <div className="mx-auto max-w-md text-center">
          <h1 className="heading-secondary mb-4">Sign In Required</h1>
          <Link href="/sign-in">
            <Button variant="primary">Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: "Profile", href: "/account", icon: User },
    { label: "Addresses", href: "/account/addresses", icon: MapPin, active: true },
    { label: "Orders", href: "/orders", icon: Package },
    { label: "Wishlist", href: "/wishlist", icon: Heart },
  ];

  return (
    <div className="section-padding container-custom">
      <div className="mx-auto max-w-4xl">
        <h1 className="heading-secondary mb-8">My Addresses</h1>

        <div className="grid gap-8 md:grid-cols-[240px_1fr]">
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

          <div>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {addresses.length} address{addresses.length !== 1 ? "es" : ""} saved
              </p>
              <Button variant="primary" size="sm" onClick={openAdd}>
                <Plus className="mr-2 h-4 w-4" /> Add Address
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
              </div>
            ) : addresses.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-12 text-center">
                <MapPin className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                <p className="text-gray-500">No addresses saved yet</p>
                <Button variant="primary" size="sm" className="mt-4" onClick={openAdd}>
                  Add Your First Address
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div
                    key={addr._id}
                    className={`relative rounded-xl border p-4 ${
                      addr.isDefault
                        ? "border-accent bg-accent/5"
                        : "border-gray-100 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="mb-1 flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {addr.label}
                          </span>
                          {addr.isDefault && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                              <Star className="h-3 w-3" /> Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{addr.street}</p>
                        <p className="text-sm text-gray-600">
                          {addr.city}, {addr.state} {addr.zipCode}
                        </p>
                        <p className="text-sm text-gray-600">{addr.country}</p>
                      </div>
                      <div className="flex gap-1">
                        {!addr.isDefault && (
                          <button
                            onClick={() => handleSetDefault(addr._id!)}
                            className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-accent"
                            title="Set as default"
                          >
                            <Star className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => openEdit(addr)}
                          className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(addr._id!)}
                          className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? "Edit Address" : "Add Address"}
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Label</label>
            <select
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              className="input-field"
            >
              <option value="Home">Home</option>
              <option value="Work">Work</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Street Address *</label>
            <Input
              value={form.street}
              onChange={(e) => setForm({ ...form, street: e.target.value })}
              placeholder="123 Main St"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">City *</label>
              <Input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="City"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">State *</label>
              <select
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="input-field"
              >
                <option value="">Select</option>
                {US_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">ZIP Code *</label>
              <Input
                value={form.zipCode}
                onChange={(e) => setForm({ ...form, zipCode: e.target.value })}
                placeholder="12345"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Country</label>
              <Input value="United States" disabled className="bg-gray-50" />
            </div>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
            />
            <span className="text-sm text-gray-700">Set as default address</span>
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {editingId ? "Update" : "Add"} Address
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
