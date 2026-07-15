"use client";

import { useEffect, useState } from "react";
import { Mail, Send, Trash2, Loader2, Users, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthenticatedApi } from "@/hooks/useAuthenticatedApi";
import { AdminLayout } from "@/components/layout/admin-layout";
import { toast } from "sonner";

interface Campaign {
  _id: string;
  name: string;
  type: string;
  subject: string;
  content: string;
  recipientCount: number;
  sentCount: number;
  status: string;
  sentAt?: string;
  createdAt: string;
}

interface Subscriber {
  _id: string;
  email: string;
  subscribedAt: string;
  active: boolean;
}

interface Stats {
  subscriberCount: number;
  campaigns: { _id: string; count: number; totalSent: number }[];
}

export default function MarketingPage() {
  const authApi = useAuthenticatedApi();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);
  const [activeTab, setActiveTab] = useState<"campaigns" | "subscribers">("campaigns");

  const [form, setForm] = useState({ name: "", subject: "", content: "", type: "email" });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [campRes, statsRes] = await Promise.all([
        authApi.get("/marketing/campaigns"),
        authApi.get("/marketing/stats"),
      ]);
      setCampaigns(campRes.data.data);
      setStats(statsRes.data.data);
    } catch {
      toast.error("Failed to load marketing data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const fetchSubscribers = async () => {
    setLoadingSubscribers(true);
    try {
      const res = await authApi.get("/newsletter");
      setSubscribers(res.data.data);
    } catch {
      toast.error("Failed to load subscribers");
    } finally {
      setLoadingSubscribers(false);
    }
  };

  const handleCreate = async () => {
    if (!form.name || !form.content) {
      toast.error("Name and content are required");
      return;
    }
    setCreating(true);
    try {
      await authApi.post("/marketing/campaigns", form);
      toast.success("Campaign created");
      setShowCreate(false);
      setForm({ name: "", subject: "", content: "", type: "email" });
      fetchAll();
    } catch {
      toast.error("Failed to create campaign");
    } finally {
      setCreating(false);
    }
  };

  const handleSend = async (id: string) => {
    if (!confirm("Send this campaign to all subscribers?")) return;
    try {
      const res = await authApi.post(`/marketing/campaigns/${id}/send`);
      toast.success(res.data.message || "Campaign sent!");
      fetchAll();
    } catch {
      toast.error("Failed to send campaign");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this campaign?")) return;
    try {
      await authApi.delete(`/marketing/campaigns/${id}`);
      toast.success("Campaign deleted");
      fetchAll();
    } catch {
      toast.error("Failed to delete campaign");
    }
  };

  return (
    <AdminLayout>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Email Marketing</h1>
        <Button onClick={() => setShowCreate(!showCreate)}>
          <Mail className="mr-2 h-4 w-4" />
          New Campaign
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats?.subscriberCount || 0}</p>
              <p className="text-xs text-gray-500">Subscribers</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <Send className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{campaigns.filter((c) => c.status === "sent").length}</p>
              <p className="text-xs text-gray-500">Campaigns Sent</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {campaigns.reduce((sum, c) => sum + (c.sentCount || 0), 0)}
              </p>
              <p className="text-xs text-gray-500">Total Emails Sent</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("campaigns")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "campaigns" ? "bg-primary text-white" : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          Campaigns
        </button>
        <button
          onClick={() => { setActiveTab("subscribers"); fetchSubscribers(); }}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "subscribers" ? "bg-primary text-white" : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          Subscribers
        </button>
      </div>

      {activeTab === "campaigns" && (
      <>
      {/* Create Campaign Form */}
      {showCreate && (
        <div className="rounded-xl border border-gray-100 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Create Campaign</h2>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Campaign Name</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Summer Sale" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Subject Line</label>
                <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="e.g. 20% off everything!" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email Content (HTML supported)</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={8}
                placeholder="Write your email content here..."
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleCreate} disabled={creating}>
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Create Campaign
              </Button>
              <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* Campaign List */}
      <div className="rounded-xl border border-gray-100 bg-white">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Campaigns</h2>
        </div>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-accent" />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="py-12 text-center text-gray-500">No campaigns yet</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {campaigns.map((c) => (
              <div key={c._id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="font-semibold text-gray-900">{c.name}</p>
                  <p className="text-xs text-gray-500">
                    {c.type} · {c.sentCount || 0} sent · {new Date(c.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    c.status === "sent" ? "bg-green-100 text-green-700" : c.status === "draft" ? "bg-gray-100 text-gray-600" : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {c.status}
                  </span>
                  {c.status === "draft" && (
                    <Button size="sm" variant="accent" onClick={() => handleSend(c._id)}>
                      <Send className="h-3 w-3" />
                    </Button>
                  )}
                  <button onClick={() => handleDelete(c._id)} className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </>
      )}

      {/* Subscribers Tab */}
      {activeTab === "subscribers" && (
        <div className="rounded-xl border border-gray-100 bg-white">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Newsletter Subscribers</h2>
          </div>
          {loadingSubscribers ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-accent" />
            </div>
          ) : subscribers.length === 0 ? (
            <div className="py-12 text-center text-gray-500">No subscribers yet</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {subscribers.map((sub) => (
                <div key={sub._id} className="flex items-center justify-between px-6 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{sub.email}</p>
                    <p className="text-xs text-gray-500">Subscribed {new Date(sub.subscribedAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    sub.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                  }`}>
                    {sub.active ? "Active" : "Inactive"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
    </AdminLayout>
  );
}
