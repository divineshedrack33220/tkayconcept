"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { persist } from "zustand/middleware";
import { create } from "zustand";
import en from "./en.json";
import fr from "./fr.json";
import es from "./es.json";

type Locale = "en" | "fr" | "es";
const translations: Record<Locale, Record<string, unknown>> = { en, fr, es };

interface I18nStore {
  locale: Locale;
  setLocale: (l: Locale) => void;
}

export const useI18nStore = create<I18nStore>()(
  persist(
    (set) => ({
      locale: "en",
      setLocale: (locale) => set({ locale }),
    }),
    { name: "tkay-locale" }
  )
);

interface I18nContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (typeof current !== "object" || current === null) return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === "string" ? current : undefined;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const { locale, setLocale } = useI18nStore();

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const dict = translations[locale] || translations.en;
      let value = getNestedValue(dict as Record<string, unknown>, key);
      if (!value) {
        // Fallback to English
        value = getNestedValue(translations.en as Record<string, unknown>, key);
      }
      if (!value) return key;
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          value = value!.replace(new RegExp(`\\{\\{${k}\\}\\}`, "g"), String(v));
        });
      }
      return value!;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

const defaultI18n: I18nContextType = {
  locale: "en",
  setLocale: () => {},
  t: (key: string, params?: Record<string, string | number>) => {
    let value = getNestedValue(translations.en as Record<string, unknown>, key);
    if (!value) return key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        value = value!.replace(new RegExp(`\\{\\{${k}\\}\\}`, "g"), String(v));
      });
    }
    return value!;
  },
};

export function useTranslation() {
  const ctx = useContext(I18nContext);
  return ctx || defaultI18n;
}

export const LOCALES = [
  { code: "en" as Locale, label: "English", flag: "🇺🇸" },
  { code: "fr" as Locale, label: "Français", flag: "🇫🇷" },
  { code: "es" as Locale, label: "Español", flag: "🇪🇸" },
];
