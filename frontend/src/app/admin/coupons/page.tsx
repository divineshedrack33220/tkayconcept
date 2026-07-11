"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Edit, Trash2, Loader2, Tag } from "lucide-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthenticatedApi } from "@/hooks/useAuthenticatedApi";
import { toast } from "sonner";
import type { Coupon } from "@/types";

export default function AdminCouponsPage() {
  const authApi = useAuthenticatedApi();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    code: "", description: "", type: "percentage" as "percentage" | "fixed",
    value: 0, minimumOrder: 0, maximumDiscount: 0, usageLimit: 0, expiresAt: "",
  });

  const fetchCoupons = useCallback(async () => {
    try {
      const res = await authApi.get("/coupons");
      setCoupons(res.data.data);
    } catch { /* */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const openCreate = () => {
    setEditing(null);
    setForm({ code: "", description: "", type: "percentage", value: 0, minimumOrder: 0, maximumDiscount: 0, usageLimit: 0, expiresAt: "" });
    setShowModal(true);
  };

  const openEdit = (c: Coupon) => {
    setEditing(c);
    setForm({
      code: c.code, description: c.description || "", type: c.type, value: c.value,
      minimumOrder: c.minimumOrder || 0, maximumDiscount: c.maximumDiscount || 0,
      usageLimit: c.usageLimit || 0, expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = { ...form, expiresAt: form.expiresAt || undefined };
      if (editing) {
        await authApi.put(`/coupons/${editing._id}`, body);
        toast.success("Coupon updated");
      } else {
        await authApi.post("/coupons", body);
        toast.success("Coupon created");
      }
      setShowModal(false);
      fetchCoupons();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to save");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    try {
      await authApi.delete(`/coupons/${id}`);
      toast.success("Coupon deleted");
      fetchCoupons();
    } catch { toast.error("Failed to delete"); }
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Coupons</h1>
        <Button variant="accent" onClick={openCreate}><Plus className="h-4 w-4" /> New Coupon</Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-500">Code</th>
              <th className="px-4 py-3 font-medium text-gray-500">Type</th>
              <th className="px-4 py-3 font-medium text-gray-500">Value</th>
              <th className="px-4 py-3 font-medium text-gray-500">Min Order</th>
              <th className="px-4 py-3 font-medium text-gray-500">Usage</th>
              <th className="px-4 py-3 font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-20" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-16" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-12" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-12" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-12" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-16" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-20" /></td>
                </tr>
              ))
            ) : coupons.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                <Tag className="mx-auto mb-2 h-8 w-8" />No coupons yet
              </td></tr>
            ) : coupons.map((c) => (
              <tr key={c._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono font-semibold text-primary">{c.code}</td>
                <td className="px-4 py-3 capitalize">{c.type}</td>
                <td className="px-4 py-3">{c.type === "percentage" ? `${c.value}%` : `$${c.value}`}</td>
                <td className="px-4 py-3">{c.minimumOrder > 0 ? `$${c.minimumOrder}` : "—"}</td>
                <td className="px-4 py-3">{c.usageLimit > 0 ? `${c.usedCount}/${c.usageLimit}` : c.usedCount}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${c.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {c.isActive ? "Active" : "Disabled"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(c)} className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-accent"><Edit className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(c._id)} className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit Coupon" : "New Coupon"} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Code *</label>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required placeholder="e.g. FAITH20" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Type *</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "percentage" | "fixed" })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20">
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional description" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Value *</label>
              <Input type="number" step="0.01" value={form.value} onChange={(e) => setForm({ ...form, value: parseFloat(e.target.value) || 0 })} required min={0} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Min Order ($)</label>
              <Input type="number" step="0.01" value={form.minimumOrder} onChange={(e) => setForm({ ...form, minimumOrder: parseFloat(e.target.value) || 0 })} min={0} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Max Discount ($)</label>
              <Input type="number" step="0.01" value={form.maximumDiscount} onChange={(e) => setForm({ ...form, maximumDiscount: parseFloat(e.target.value) || 0 })} min={0} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Usage Limit (0 = unlimited)</label>
              <Input type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: parseInt(e.target.value) || 0 })} min={0} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Expires At</label>
              <Input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="accent" type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
