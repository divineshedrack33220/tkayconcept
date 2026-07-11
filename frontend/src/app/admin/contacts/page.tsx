"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search,
  Eye,
  Mail,
  MailOpen,
  Archive,
  Inbox,
  Loader2,
} from "lucide-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
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
  status: "new" | "read" | "replied" | "archived";
  createdAt: string;
}

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  read: "bg-gray-100 text-gray-600",
  replied: "bg-green-100 text-green-700",
  archived: "bg-yellow-100 text-yellow-700",
};

const typeColors: Record<string, string> = {
  general: "bg-gray-100 text-gray-600",
  quote: "bg-purple-100 text-purple-700",
  support: "bg-blue-100 text-blue-700",
  partnership: "bg-green-100 text-green-700",
};

export default function AdminContactsPage() {
  const authApi = useAuthenticatedApi();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Contact | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "15");
      if (statusFilter) params.set("status", statusFilter);

      const res = await authApi.get(`/contacts/admin?${params.toString()}`);
      setContacts(res.data.data);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch {
      toast.error("Failed to load contacts");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleStatusUpdate = async (id: string, status: string) => {
    setUpdating(true);
    try {
      await authApi.put(`/contacts/admin/${id}`, { status });
      toast.success("Status updated");
      fetchContacts();
      if (selected?._id === id) {
        setSelected({ ...selected, status: status as Contact["status"] });
      }
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const openDetail = (contact: Contact) => {
    setSelected(contact);
    if (contact.status === "new") {
      handleStatusUpdate(contact._id, "read");
    }
  };

  const unreadCount = contacts.filter((c) => c.status === "new").length;

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">Contact Submissions</h1>
        <p className="mt-1 text-sm text-gray-500">
          {total} submissions{unreadCount > 0 && ` · ${unreadCount} unread`}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex gap-2">
          {[
            { value: "", label: "All", icon: Inbox },
            { value: "new", label: "New", icon: Mail },
            { value: "read", label: "Read", icon: MailOpen },
            { value: "replied", label: "Replied", icon: Mail },
            { value: "archived", label: "Archived", icon: Archive },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => { setStatusFilter(filter.value); setPage(1); }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                statusFilter === filter.value
                  ? "bg-accent text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <filter.icon className="h-3.5 w-3.5" />
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
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
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-36" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-40" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-16" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-16" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-20" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-8" /></td>
                </tr>
              ))
            ) : contacts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                  <Inbox className="mx-auto mb-2 h-8 w-8" />
                  No submissions found
                </td>
              </tr>
            ) : (
              contacts.map((contact) => (
                <tr
                  key={contact._id}
                  className={`cursor-pointer hover:bg-gray-50 ${contact.status === "new" ? "bg-blue-50/30" : ""}`}
                  onClick={() => openDetail(contact)}
                >
                  <td className="px-4 py-3">
                    <p className={`font-medium ${contact.status === "new" ? "text-gray-900" : "text-gray-700"}`}>
                      {contact.name}
                    </p>
                    <p className="text-xs text-gray-500">{contact.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-900 line-clamp-1">{contact.subject}</p>
                    <p className="text-xs text-gray-500 line-clamp-1">{contact.message}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${typeColors[contact.type] || "bg-gray-100"}`}>
                      {contact.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColors[contact.status]}`}>
                      {contact.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(contact.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); openDetail(contact); }}
                      className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-accent"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} className="mt-6" />

      {/* Detail Modal */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.subject || ""}
        size="lg"
      >
        {selected && (
          <div className="space-y-6">
            {/* Sender Info */}
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-lg font-bold text-white">
                {selected.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{selected.name}</p>
                <p className="text-sm text-gray-500">{selected.email}</p>
                {selected.phone && (
                  <p className="text-sm text-gray-500">{selected.phone}</p>
                )}
                <p className="mt-1 text-xs text-gray-400">
                  {new Date(selected.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Type & Status */}
            <div className="flex items-center gap-3">
              <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium capitalize ${typeColors[selected.type] || "bg-gray-100"}`}>
                {selected.type}
              </span>
              <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusColors[selected.status]}`}>
                {selected.status}
              </span>
            </div>

            {/* Message */}
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="whitespace-pre-wrap text-sm text-gray-700">
                {selected.message}
              </p>
            </div>

            {/* Status Actions */}
            <div className="flex flex-wrap gap-2 border-t pt-4">
              {selected.status !== "read" && (
                <Button variant="outline" size="sm" onClick={() => handleStatusUpdate(selected._id, "read")} disabled={updating}>
                  Mark as Read
                </Button>
              )}
              {selected.status !== "replied" && (
                <Button variant="outline" size="sm" onClick={() => handleStatusUpdate(selected._id, "replied")} disabled={updating}>
                  Mark as Replied
                </Button>
              )}
              {selected.status !== "archived" && (
                <Button variant="ghost" size="sm" onClick={() => handleStatusUpdate(selected._id, "archived")} disabled={updating}>
                  Archive
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
