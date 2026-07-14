"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Edit, Trash2, Loader2, Star, CheckCircle, XCircle } from "lucide-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthenticatedApi } from "@/hooks/useAuthenticatedApi";
import { toast } from "sonner";
import type { Testimonial } from "@/types";

export default function AdminTestimonialsPage() {
  const authApi = useAuthenticatedApi();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ customerName: "", content: "", rating: 5, isFeatured: false, isApproved: false });

  const fetchTestimonials = useCallback(async () => {
    try {
      const res = await authApi.get("/testimonials?limit=100");
      setTestimonials(res.data.data);
    } catch { /* */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTestimonials(); }, [fetchTestimonials]);

  const openCreate = () => {
    setEditing(null);
    setForm({ customerName: "", content: "", rating: 5, isFeatured: false, isApproved: false });
    setShowModal(true);
  };

  const openEdit = (t: Testimonial) => {
    setEditing(t);
    setForm({ customerName: t.customerName, content: t.content, rating: t.rating, isFeatured: t.isFeatured, isApproved: t.isApproved });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await authApi.put(`/testimonials/${editing._id}`, form);
        toast.success("Testimonial updated");
      } else {
        await authApi.post("/testimonials", form);
        toast.success("Testimonial created");
      }
      setShowModal(false);
      fetchTestimonials();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to save");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    try {
      await authApi.delete(`/testimonials/${id}`);
      toast.success("Deleted");
      fetchTestimonials();
    } catch { toast.error("Failed to delete"); }
  };

  const toggleApproval = async (t: Testimonial) => {
    try {
      await authApi.put(`/testimonials/${t._id}`, { isApproved: !t.isApproved });
      fetchTestimonials();
    } catch { toast.error("Failed to update"); }
  };

  const toggleFeatured = async (t: Testimonial) => {
    try {
      await authApi.put(`/testimonials/${t._id}`, { isFeatured: !t.isFeatured });
      fetchTestimonials();
    } catch { toast.error("Failed to update"); }
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Testimonials</h1>
        <Button variant="accent" onClick={openCreate}><Plus className="h-4 w-4" /> Add Testimonial</Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-500">Customer</th>
              <th className="px-4 py-3 font-medium text-gray-500">Rating</th>
              <th className="px-4 py-3 font-medium text-gray-500">Content</th>
              <th className="px-4 py-3 font-medium text-gray-500">Featured</th>
              <th className="px-4 py-3 font-medium text-gray-500">Approved</th>
              <th className="px-4 py-3 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-28" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-20" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-48" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-16" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-16" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-20" /></td>
                </tr>
              ))
            ) : testimonials.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                <Star className="mx-auto mb-2 h-8 w-8" />No testimonials yet
              </td></tr>
            ) : testimonials.map((t) => (
              <tr key={t._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{t.customerName}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < t.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                    ))}
                  </div>
                </td>
                <td className="max-w-xs px-4 py-3 text-gray-600 truncate">{t.content}</td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleFeatured(t)} className="rounded p-1 hover:bg-gray-100">
                    <Star className={`h-4 w-4 ${t.isFeatured ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleApproval(t)} aria-label={t.isApproved ? "Unapprove testimonial" : "Approve testimonial"} className="rounded p-1 hover:bg-gray-100">
                    {t.isApproved ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-gray-300" />}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(t)} aria-label="Edit testimonial" className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-accent"><Edit className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(t._id)} aria-label="Delete testimonial" className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit Testimonial" : "New Testimonial"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Customer Name *</label>
            <Input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Rating *</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((r) => (
                <button key={r} type="button" onClick={() => setForm({ ...form, rating: r })} className="p-1">
                  <Star className={`h-6 w-6 ${r <= form.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Content *</label>
            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={4} required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20" />
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="rounded" />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isApproved} onChange={(e) => setForm({ ...form, isApproved: e.target.checked })} className="rounded" />
              Approved
            </label>
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
