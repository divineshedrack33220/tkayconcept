"use client";

import { useState } from "react";
import { Gift, CreditCard, Loader2, CheckCircle2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthenticatedApi } from "@/hooks/useAuthenticatedApi";
import { useAuth } from "@clerk/nextjs";
import { useTranslation } from "@/i18n";
import { toast } from "sonner";
import api from "@/lib/api";

const AMOUNTS = [25, 50, 75, 100, 150, 200];

export default function GiftCardsPage() {
  const { isSignedIn } = useAuth();
  const authApi = useAuthenticatedApi();
  const { t } = useTranslation();
  const [amount, setAmount] = useState(50);
  const [customAmount, setCustomAmount] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [message, setMessage] = useState("");
  const [purchasing, setPurchasing] = useState(false);
  const [purchased, setPurchased] = useState(false);
  const [purchasedCode, setPurchasedCode] = useState("");
  const [redeemCode, setRedeemCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [redeemedBalance, setRedeemedBalance] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"buy" | "redeem">("buy");

  const finalAmount = customAmount ? parseInt(customAmount) || 0 : amount;

  const handlePurchase = async () => {
    if (!isSignedIn) {
      toast.error(t("giftCard.signInToPurchase"));
      return;
    }
    if (finalAmount < 5 || finalAmount > 500) {
      toast.error(t("giftCard.amountError"));
      return;
    }
    setPurchasing(true);
    try {
      const res = await authApi.post("/gift-cards", {
        amount: finalAmount,
        recipientEmail,
        recipientName,
        message,
      });
      setPurchasedCode(res.data.data.code);
      setPurchased(true);
      toast.success(t("giftCard.purchasedSuccess"));
    } catch {
      toast.error(t("giftCard.purchaseError"));
    } finally {
      setPurchasing(false);
    }
  };

  const handleRedeem = async () => {
    if (!isSignedIn) {
      toast.error(t("giftCard.signInToRedeem"));
      return;
    }
    if (!redeemCode) {
      toast.error(t("giftCard.enterCode"));
      return;
    }
    setRedeeming(true);
    try {
      const res = await authApi.post("/gift-cards/validate", { code: redeemCode });
      setRedeemedBalance(res.data.data.balance);
      toast.success(`Gift card valid! Balance: $${res.data.data.balance}`);
    } catch {
      toast.error(t("giftCard.invalidCard"));
    } finally {
      setRedeeming(false);
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(purchasedCode);
      toast.success(t("giftCard.codeCopied"));
    } catch {}
  };

  return (
    <div>
      <section className="bg-gradient-to-r from-accent to-accent-dark py-16 text-white">
        <div className="container-custom text-center">
          <Gift className="mx-auto mb-4 h-12 w-12" />
          <h1 className="mb-2 text-4xl font-bold">{t("giftCard.title")}</h1>
          <p className="text-white/80">{t("giftCard.subtitle")}</p>
        </div>
      </section>

      <section className="section-padding container-custom">
        <div className="mx-auto max-w-2xl">
          {/* Tabs */}
          <div className="mb-8 flex justify-center gap-2">
            <button
              onClick={() => setActiveTab("buy")}
              className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all ${
                activeTab === "buy" ? "bg-primary text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <CreditCard className="mr-2 inline h-4 w-4" />
              {t("giftCard.buyGiftCard")}
            </button>
            <button
              onClick={() => setActiveTab("redeem")}
              className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all ${
                activeTab === "redeem" ? "bg-primary text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Gift className="mr-2 inline h-4 w-4" />
              {t("giftCard.redeemCode")}
            </button>
          </div>

          {activeTab === "buy" ? (
            purchased ? (
              <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
                <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-500" />
                <h2 className="mb-2 text-2xl font-bold text-gray-900">{t("giftCard.purchasedSuccess")}</h2>
                <p className="mb-6 text-gray-500">{t("giftCard.shareCode")}</p>
                <div className="mx-auto mb-6 flex max-w-sm items-center justify-center gap-3 rounded-xl border-2 border-dashed border-accent/30 bg-accent/5 p-6">
                  <span className="text-2xl font-bold tracking-widest text-accent">{purchasedCode}</span>
                  <button onClick={copyCode} className="rounded-lg bg-accent p-2 text-white hover:bg-accent-light">
                    <Copy className="h-5 w-5" />
                  </button>
                </div>
                <p className="mb-4 text-sm text-gray-500">{t("giftCard.valueExpires", { amount: finalAmount })}</p>
                {recipientEmail && (
                  <p className="text-xs text-gray-400">{t("giftCard.notificationSent", { email: recipientEmail })}</p>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                <h2 className="mb-6 text-xl font-bold text-gray-900">{t("giftCard.selectAmount")}</h2>

                {/* Amount Grid */}
                <div className="mb-6 grid grid-cols-3 gap-3">
                  {AMOUNTS.map((a) => (
                    <button
                      key={a}
                      onClick={() => { setAmount(a); setCustomAmount(""); }}
                      className={`rounded-xl border-2 py-4 text-center text-lg font-bold transition-all ${
                        amount === a && !customAmount
                          ? "border-accent bg-accent/5 text-accent shadow-md shadow-accent/10"
                          : "border-gray-200 text-gray-700 hover:border-accent/30"
                      }`}
                    >
                      ${a}
                    </button>
                  ))}
                </div>

                <div className="mb-6">
                  <label className="mb-1 block text-sm font-medium text-gray-700">{t("giftCard.customAmount")}</label>
                  <Input
                    type="number"
                    min="5"
                    max="500"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Enter amount"
                  />
                </div>

                <div className="mb-6 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">{t("giftCard.recipientEmail")}</label>
                      <Input
                        type="email"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        placeholder="friend@example.com"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">{t("giftCard.recipientName")}</label>
                      <Input
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">{t("giftCard.message")}</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={3}
                      placeholder="Happy birthday! Enjoy something special..."
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                    />
                  </div>
                </div>

                <Button variant="accent" size="lg" className="w-full" onClick={handlePurchase} disabled={purchasing || finalAmount < 5}>
                  {purchasing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4" />}
                  Purchase ${finalAmount} Gift Card
                </Button>
              </div>
            )
          ) : (
            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
              <h2 className="mb-6 text-xl font-bold text-gray-900">{t("giftCard.redeem")}</h2>
              <div className="mb-6">
                <label className="mb-1 block text-sm font-medium text-gray-700">{t("giftCard.code")}</label>
                <Input
                  value={redeemCode}
                  onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                  placeholder="TKGC-XXXX-XXXX-XXXX"
                  className="font-mono text-lg tracking-wider"
                />
              </div>
              <Button variant="accent" size="lg" className="w-full" onClick={handleRedeem} disabled={redeeming}>
                {redeeming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4" />}
                {t("giftCard.checkBalance")}
              </Button>
              {redeemedBalance !== null && (
                <div className="mt-6 rounded-xl bg-emerald-50 p-6 text-center">
                  <p className="mb-1 text-sm text-emerald-600">{t("giftCard.availableBalance")}</p>
                  <p className="text-3xl font-bold text-emerald-700">${redeemedBalance.toFixed(2)}</p>
                  <p className="mt-2 text-xs text-emerald-500">{t("giftCard.applyAtCheckout")}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
