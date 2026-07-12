"use client";

import { useState, useEffect } from "react";
import { GripVertical, Eye, EyeOff, ArrowUp, ArrowDown, Save, Loader2, RotateCcw } from "lucide-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const BUILDER_KEY = "tkay-homepage-layout";

const defaultSections = [
  { id: "hero", name: "Hero Banner", description: "Main banner with CTA", active: true },
  { id: "categories", name: "Featured Categories", description: "Dynamic categories grid", active: true },
  { id: "mission", name: "Mission Statement", description: "Company mission section", active: true },
  { id: "why-us", name: "Why Choose Us", description: "Value propositions", active: true },
  { id: "featured-products", name: "Featured Products", description: "Product carousel", active: true },
  { id: "testimonials", name: "Testimonials", description: "Customer reviews", active: true },
  { id: "blog-preview", name: "Blog Preview", description: "Latest blog posts", active: true },
  { id: "newsletter", name: "Newsletter Signup", description: "Email subscription CTA", active: true },
];

type Section = (typeof defaultSections)[number];

function loadLayout(): Section[] {
  if (typeof window === "undefined") return defaultSections;
  try {
    const stored = localStorage.getItem(BUILDER_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Section[];
      const valid = parsed.filter((s) => defaultSections.some((d) => d.id === s.id));
      if (valid.length === defaultSections.length) return valid;
    }
  } catch { /* ignore */ }
  return defaultSections;
}

export default function AdminHomepageBuilderPage() {
  const [items, setItems] = useState<Section[]>(defaultSections);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setItems(loadLayout());
    setLoaded(true);
  }, []);

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const arr = [...items];
    [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
    setItems(arr);
  };

  const moveDown = (idx: number) => {
    if (idx === items.length - 1) return;
    const arr = [...items];
    [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
    setItems(arr);
  };

  const toggleActive = (idx: number) => {
    const arr = [...items];
    arr[idx] = { ...arr[idx], active: !arr[idx].active };
    setItems(arr);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      localStorage.setItem(BUILDER_KEY, JSON.stringify(items));
      toast.success("Layout saved successfully");
    } catch {
      toast.error("Failed to save layout");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setItems(defaultSections);
    localStorage.removeItem(BUILDER_KEY);
    toast.success("Layout reset to defaults");
  };

  if (!loaded) return null;

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Homepage Builder</h1>
          <p className="mt-1 text-gray-500">Reorder and toggle homepage sections</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button variant="accent" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Layout
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white">
        <div className="divide-y">
          {items.map((section, idx) => (
            <div key={section.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50">
              <GripVertical className="h-5 w-5 text-gray-300" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{section.name}</p>
                <p className="text-sm text-gray-500">{section.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => moveUp(idx)} disabled={idx === 0}
                  className="rounded p-1.5 text-gray-400 hover:bg-gray-100 disabled:opacity-30">
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button onClick={() => moveDown(idx)} disabled={idx === items.length - 1}
                  className="rounded p-1.5 text-gray-400 hover:bg-gray-100 disabled:opacity-30">
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button onClick={() => toggleActive(idx)}
                  className={`rounded p-1.5 ${section.active ? "text-green-500 hover:bg-green-50" : "text-gray-300 hover:bg-gray-100"}`}>
                  {section.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
