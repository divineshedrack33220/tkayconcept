"use client";

import { useState } from "react";
import { Shirt, Coffee, Flag, Award, Send, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { toast } from "sonner";

const services = [
  { icon: Shirt, title: "T-Shirts & Hoodies", description: "Custom designs on premium quality apparel." },
  { icon: Coffee, title: "Mugs & Tumblers", description: "Personalized drinkware for gifts or events." },
  { icon: Flag, title: "Banners & Signs", description: "Eye-catching displays for events and churches." },
  { icon: Award, title: "Caps & Hats", description: "Embroidered and printed headwear." },
];

export default function CustomPrintingPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    productType: "t-shirt",
    quantity: "",
    description: "",
    size: "",
    color: "",
    additionalNotes: "",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.description) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSending(true);
    try {
      await api.post("/contacts", {
        name: form.name,
        email: form.email,
        phone: form.phone,
        subject: `Custom Printing Request - ${form.productType}`,
        type: "quote",
        message: `Product: ${form.productType}\nQuantity: ${form.quantity}\nSize: ${form.size}\nColor: ${form.color}\n\nDescription:\n${form.description}\n\nAdditional Notes:\n${form.additionalNotes}`,
      });
      setSent(true);
      toast.success("Request submitted! We'll send you a quote.");
    } catch {
      toast.error("Failed to submit request");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="section-padding container-custom">
        <div className="mx-auto max-w-lg text-center">
          <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-500" />
          <h1 className="heading-secondary mb-3">Request Submitted!</h1>
          <p className="mb-6 text-gray-600">
            We&apos;ve received your custom printing request. Our team will review it and send you a quote within 24-48 hours.
          </p>
          <Button variant="accent" onClick={() => { setSent(false); setForm({ name: "", email: "", phone: "", productType: "t-shirt", quantity: "", description: "", size: "", color: "", additionalNotes: "" }); }}>
            Submit Another Request
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <section className="bg-primary py-16 text-white">
        <div className="container-custom text-center">
          <h1 className="mb-3 text-4xl font-bold">Custom Printing</h1>
          <p className="text-gray-300">Bring your vision to life with our custom printing services</p>
        </div>
      </section>

      <section className="section-padding container-custom">
        <h2 className="heading-secondary mb-12 text-center">What We Offer</h2>
        <div className="mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <div key={service.title} className="rounded-xl border border-gray-100 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
                <service.icon className="h-7 w-7 text-accent" />
              </div>
              <h3 className="mb-2 font-bold text-primary">{service.title}</h3>
              <p className="text-sm text-gray-600">{service.description}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto max-w-2xl">
          <h2 className="heading-secondary mb-6 text-center">Request a Quote</h2>
          <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Name *</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Email *</label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" required />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(555) 123-4567" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Product Type</label>
                <select value={form.productType} onChange={(e) => setForm({ ...form, productType: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20">
                  <option value="t-shirt">T-Shirt</option>
                  <option value="hoodie">Hoodie</option>
                  <option value="mug">Mug</option>
                  <option value="banner">Banner</option>
                  <option value="cap">Cap</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Quantity</label>
                <Input value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="e.g. 50" />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Size</label>
                <Input value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} placeholder="e.g. S, M, L, XL" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Color</label>
                <Input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} placeholder="e.g. Black, White" />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Design Description *</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe your design, theme, text, colors, etc."
                rows={4}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Additional Notes</label>
              <textarea
                value={form.additionalNotes}
                onChange={(e) => setForm({ ...form, additionalNotes: e.target.value })}
                placeholder="Any deadlines, special requirements, etc."
                rows={2}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>

            <Button variant="accent" size="lg" type="submit" disabled={sending} className="w-full">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Submit Request
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
