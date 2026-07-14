"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Mail, CheckCircle } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { useTranslation } from "@/i18n";
import api from "@/lib/api";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/newsletter/subscribe", { email });
      toast.success(res.data.message || t("footer.subscribeSuccess"));
      setEmail("");
      setSubscribed(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg || t("footer.subscribeError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-primary py-12 sm:py-16">
      <div className="container-custom">
        <ScrollReveal>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
              <Mail className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white md:text-3xl">{t("shop.joinCommunity")}</h2>
            <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-300">{t("shop.joinCommunitySub")}</p>

            {subscribed ? (
              <div className="mx-auto mt-6 sm:mt-8 flex max-w-md items-center justify-center gap-2 rounded-xl bg-white/10 p-4 text-white">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-sm font-medium">{t("footer.subscribeSuccess")}</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mx-auto mt-6 sm:mt-8 flex max-w-md flex-col sm:flex-row gap-3 px-4 sm:px-0">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-gray-300 outline-none focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="min-h-[48px] rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-accent/90 active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? "..." : t("shop.subscribeBtn")}
                </button>
              </form>
            )}

            <p className="mt-3 sm:mt-4 text-[10px] sm:text-xs text-gray-400">{t("footer.noSpam")}</p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
