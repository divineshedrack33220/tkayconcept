"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { toast } from "sonner";
import { contactSchema, type ContactInput } from "@/lib/validations";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", phone: "", subject: "", type: "general" as const, message: "" },
  });

  const onSubmit = async (data: ContactInput) => {
    try {
      await api.post("/contacts", data);
      setSent(true);
      toast.success("Message sent! We'll get back to you soon.");
    } catch {
      toast.error("Failed to send message. Please try again.");
    }
  };

  if (sent) {
    return (
      <div className="section-padding container-custom">
        <div className="mx-auto max-w-lg text-center">
          <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-500" />
          <h1 className="heading-secondary mb-3">Message Sent!</h1>
          <p className="mb-6 text-gray-600">
            Thank you for reaching out. We&apos;ll get back to you within 24-48 hours.
          </p>
          <Button variant="accent" onClick={() => { setSent(false); reset(); }}>
            Send Another Message
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <section className="bg-primary py-16 text-white">
        <div className="container-custom text-center">
          <h1 className="mb-3 text-4xl font-bold">Contact Us</h1>
          <p className="text-gray-300">We&apos;d love to hear from you</p>
        </div>
      </section>

      <section className="section-padding container-custom">
        <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Name *</label>
                <Input {...register("name")} placeholder="Your name" />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Email *</label>
                <Input type="email" {...register("email")} placeholder="you@example.com" />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
                <Input {...register("phone")} placeholder="(555) 123-4567" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Type</label>
                <select {...register("type")}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20">
                  <option value="general">General Inquiry</option>
                  <option value="quote">Request a Quote</option>
                  <option value="support">Support</option>
                  <option value="partnership">Partnership</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Subject *</label>
              <Input {...register("subject")} placeholder="How can we help?" />
              {errors.subject && <p className="mt-1 text-xs text-red-500">{errors.subject.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Message *</label>
              <textarea {...register("message")} placeholder="Tell us more..." rows={5}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20" />
              {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>}
            </div>

            <Button variant="accent" size="lg" type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send Message
            </Button>
          </form>

          <div className="space-y-6">
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-primary">Get in Touch</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-5 w-5 text-accent" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-500">hello@tkconcepts.co.uk</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-5 w-5 text-accent" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Phone</p>
                    <p className="text-sm text-gray-500">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 text-accent" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Location</p>
                    <p className="text-sm text-gray-500">United Kingdom</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-accent/5 p-6">
              <h3 className="mb-2 text-lg font-semibold text-primary">Rooted Identity</h3>
              <p className="mb-4 text-sm text-gray-600">
                Need custom t-shirts, mugs, or banners? Our Rooted Identity brand handles all custom printing.
              </p>
              <a href="/custom-printing" className="text-sm font-medium text-accent hover:text-accent-dark">
                Learn More →
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
