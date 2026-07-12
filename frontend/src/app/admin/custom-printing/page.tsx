"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Eye, Mail, Package } from "lucide-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthenticatedApi } from "@/hooks/useAuthenticatedApi";
import { toast } from "sonner";

interface Contact {
  _id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  type: string;
  message: string;
  status: string;
  createdAt: string;
}

export default function AdminCustomPrintingPage() {
  const authApi = useAuthenticatedApi();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Contact | null>(null);

  const fetchContacts = useCallback(async () => {
    try {
      const res = await authApi.get("/contacts?type=quote&limit=50");
      setContacts(res.data.data || []);
    } catch { /* */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  const markRead = async (c: Contact) => {
    if (c.status === "new") {
      try {
        await authApi.put(`/contacts/${c._id}`, { status: "read" });
        setContacts((prev) => prev.map((x) => x._id === c._id ? { ...x, status: "read" } : x));
      } catch { /* */ }
    }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "new": return "bg-blue-100 text-blue-700";
      case "read": return "bg-gray-100 text-gray-600";
      case "replied": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-500";
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">Custom Printing Requests</h1>
        <p className="mt-1 text-gray-500">Quote requests for custom printing services</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-500">From</th>
              <th className="px-4 py-3 font-medium text-gray-500">Subject</th>
              <th className="px-4 py-3 font-medium text-gray-500">Type</th>
              <th className="px-4 py-3 font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 font-medium text-gray-500">Date</th>
              <th className="px-4 py-3 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-32" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-48" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-16" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-16" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-20" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-16" /></td>
                </tr>
              ))
            ) : contacts.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                <Package className="mx-auto mb-2 h-8 w-8" />No custom printing requests yet
              </td></tr>
            ) : contacts.map((c) => (
              <tr key={c._id} className={`hover:bg-gray-50 ${c.status === "new" ? "bg-blue-50/30" : ""}`}>
                <td className="px-4 py-3">
                  <div>
                    <span className="font-medium text-gray-900">{c.name}</span>
                    <span className="ml-1 text-xs text-gray-400">{c.email}</span>
                  </div>
                </td>
                <td className="max-w-xs truncate px-4 py-3 text-gray-600">{c.subject}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">{c.type}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(c.status)}`}>{c.status}</span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <button onClick={() => { setSelected(c); markRead(c); }}
                    className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-accent">
                    <Eye className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Request Details" size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500">From</label>
                <p className="font-medium">{selected.name}</p>
                <p className="text-sm text-gray-500">{selected.email}</p>
                {selected.phone && <p className="text-sm text-gray-500">{selected.phone}</p>}
              </div>
              <div>
                <label className="text-xs text-gray-500">Date</label>
                <p className="text-sm">{new Date(selected.createdAt).toLocaleString()}</p>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500">Subject</label>
              <p className="font-medium">{selected.subject}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500">Message</label>
              <p className="mt-1 whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm text-gray-700">{selected.message}</p>
            </div>
            <div className="flex gap-3">
              <a href={`mailto:${selected.email}`} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary/90">
                <Mail className="h-4 w-4" /> Reply via Email
              </a>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
