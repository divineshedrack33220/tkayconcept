"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, RotateCcw } from "lucide-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const SETTINGS_KEY = "tkay-admin-settings";

const defaultSettings = {
  storeName: "TKAYKONCEPTS INT'L",
  storeEmail: "info@tkaykoncepts.com",
  storePhone: "",
  storeAddress: "",
  currency: "USD",
  taxRate: 0,
  shippingFlatRate: 5.99,
  freeShippingThreshold: 50,
  smtpHost: "",
  smtpPort: "587",
  smtpUser: "",
  smtpPass: "",
  stripePublishableKey: "",
  stripeSecretKey: "",
  cloudinaryCloudName: "",
  socialInstagram: "",
  socialFacebook: "",
  socialTwitter: "",
  socialWhatsapp: "",
};

function loadSettings() {
  if (typeof window === "undefined") return defaultSettings;
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) return { ...defaultSettings, ...JSON.parse(stored) };
  } catch { /* ignore */ }
  return defaultSettings;
}

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(defaultSettings);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
    setLoaded(true);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      toast.success("Settings saved successfully");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    localStorage.removeItem(SETTINGS_KEY);
    toast.success("Settings reset to defaults");
  };

  const update = (key: string, value: string | number) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  if (!loaded) return null;

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Settings</h1>
          <p className="mt-1 text-gray-500">Configure your store settings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button variant="accent" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <section className="rounded-xl border border-gray-100 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-primary">Store Information</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Store Name</label>
              <Input value={settings.storeName} onChange={(e) => update("storeName", e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
              <Input type="email" value={settings.storeEmail} onChange={(e) => update("storeEmail", e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
              <Input value={settings.storePhone} onChange={(e) => update("storePhone", e.target.value)} placeholder="+1 (555) 000-0000" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Currency</label>
              <select value={settings.currency} onChange={(e) => update("currency", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20">
                <option value="USD">USD ($)</option>
                <option value="NGN">NGN (₦)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">Address</label>
              <Input value={settings.storeAddress} onChange={(e) => update("storeAddress", e.target.value)} placeholder="Full store address" />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-100 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-primary">Shipping & Tax</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Tax Rate (%)</label>
              <Input type="number" step="0.01" value={settings.taxRate} onChange={(e) => update("taxRate", parseFloat(e.target.value) || 0)} min={0} max={100} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Flat Shipping Rate ($)</label>
              <Input type="number" step="0.01" value={settings.shippingFlatRate} onChange={(e) => update("shippingFlatRate", parseFloat(e.target.value) || 0)} min={0} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Free Shipping Threshold ($)</label>
              <Input type="number" step="0.01" value={settings.freeShippingThreshold} onChange={(e) => update("freeShippingThreshold", parseFloat(e.target.value) || 0)} min={0} />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-100 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-primary">Email (SMTP)</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">SMTP Host</label>
              <Input value={settings.smtpHost} onChange={(e) => update("smtpHost", e.target.value)} placeholder="smtp.gmail.com" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">SMTP Port</label>
              <Input value={settings.smtpPort} onChange={(e) => update("smtpPort", e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">SMTP User</label>
              <Input value={settings.smtpUser} onChange={(e) => update("smtpUser", e.target.value)} placeholder="your-email@gmail.com" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">SMTP Password</label>
              <Input type="password" value={settings.smtpPass} onChange={(e) => update("smtpPass", e.target.value)} />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-100 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-primary">Stripe</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Publishable Key</label>
              <Input value={settings.stripePublishableKey} onChange={(e) => update("stripePublishableKey", e.target.value)} placeholder="pk_test_..." />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Secret Key</label>
              <Input type="password" value={settings.stripeSecretKey} onChange={(e) => update("stripeSecretKey", e.target.value)} placeholder="sk_test_..." />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-100 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-primary">Social Links</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Instagram</label>
              <Input value={settings.socialInstagram} onChange={(e) => update("socialInstagram", e.target.value)} placeholder="https://instagram.com/..." />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Facebook</label>
              <Input value={settings.socialFacebook} onChange={(e) => update("socialFacebook", e.target.value)} placeholder="https://facebook.com/..." />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Twitter</label>
              <Input value={settings.socialTwitter} onChange={(e) => update("socialTwitter", e.target.value)} placeholder="https://twitter.com/..." />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">WhatsApp</label>
              <Input value={settings.socialWhatsapp} onChange={(e) => update("socialWhatsapp", e.target.value)} placeholder="https://wa.me/..." />
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
