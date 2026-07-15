"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSafeUser } from "@/lib/safe-clerk";
import Link from "next/link";
import {
  CreditCard,
  MapPin,
  Loader2,
  Lock,
  CheckCircle2,
  ShoppingBag,
  Shield,
  Truck,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/stores/cartStore";
import { useAuthenticatedApi } from "@/hooks/useAuthenticatedApi";
import { toast } from "sonner";
import type { Address } from "@/types";
import { formatPrice } from "@/lib/utils";
import { optImg } from "@/lib/opt-img";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY",
];

export default function CheckoutPage() {
  const router = useRouter();
  const { isSignedIn, user } = useSafeUser();
  const authApi = useAuthenticatedApi();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0));
  const clearCart = useCartStore((s) => s.clearCart);

  const [step, setStep] = useState<"shipping" | "payment" | "confirm">("shipping");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [giftCardCode, setGiftCardCode] = useState("");
  const [giftCardDiscount, setGiftCardDiscount] = useState(0);
  const [applyingGiftCard, setApplyingGiftCard] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const [shippingForm, setShippingForm] = useState({
    label: "Home",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
  });

  const shipping = subtotal >= 75 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const afterDiscounts = Math.max(0, subtotal + shipping + tax - giftCardDiscount - couponDiscount);
  const total = afterDiscounts;

  const handleApplyGiftCard = async () => {
    if (!giftCardCode) return;
    setApplyingGiftCard(true);
    try {
      const res = await authApi.post("/gift-cards/validate", { code: giftCardCode });
      const balance = res.data.data.balance;
      const discount = Math.min(balance, subtotal + shipping + tax);
      setGiftCardDiscount(discount);
      toast.success(`Gift card applied! -${formatPrice(discount)}`);
    } catch {
      toast.error("Invalid or expired gift card");
    } finally {
      setApplyingGiftCard(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setApplyingCoupon(true);
    try {
      const res = await authApi.get(`/coupons/validate?code=${couponCode}`);
      const coupon = res.data.data;
      let discount = 0;
      if (coupon.type === "percentage") {
        discount = (subtotal * coupon.value) / 100;
        if (coupon.maximumDiscount) discount = Math.min(discount, coupon.maximumDiscount);
      } else {
        discount = coupon.value;
      }
      const maxDiscount = subtotal + shipping + tax - giftCardDiscount;
      discount = Math.min(discount, maxDiscount);
      setCouponDiscount(discount);
      toast.success(`Coupon applied! -${formatPrice(discount)}`);
    } catch {
      toast.error("Invalid or expired coupon");
    } finally {
      setApplyingCoupon(false);
    }
  };

  useEffect(() => {
    if (!isSignedIn) return;
    const fetchAddresses = async () => {
      try {
        const res = await authApi.get("/users/me/addresses");
        setAddresses(res.data.data);
        const defaultAddr = res.data.data.find((a: Address) => a.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr._id!);
          setShippingForm({
            label: defaultAddr.label,
            street: defaultAddr.street,
            city: defaultAddr.city,
            state: defaultAddr.state,
            zipCode: defaultAddr.zipCode,
            country: defaultAddr.country,
          });
        }
      } catch {
        // silent
      } finally {
        setLoadingAddresses(false);
      }
    };
    fetchAddresses();
  }, [isSignedIn]);

  const handleAddressSelect = (addr: Address) => {
    setSelectedAddressId(addr._id!);
    setShippingForm({
      label: addr.label,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      zipCode: addr.zipCode,
      country: addr.country,
    });
  };

  const handleShippingSubmit = () => {
    if (!shippingForm.street || !shippingForm.city || !shippingForm.state || !shippingForm.zipCode) {
      toast.error("Please fill in all shipping fields");
      return;
    }
    setStep("payment");
  };

  const handlePlaceOrder = async () => {
    setProcessing(true);
    try {
      // Create order
      const orderItems = items.map((item) => ({
        productId: item.product._id,
        quantity: item.quantity,
        variant: item.variant,
      }));

      const orderRes = await authApi.post("/orders", {
        items: orderItems,
        shippingAddress: shippingForm,
        paymentMethod: "stripe",
        giftCardCode: giftCardDiscount > 0 ? giftCardCode : undefined,
        giftCardDiscount: giftCardDiscount > 0 ? giftCardDiscount : undefined,
      });

      const newOrder = orderRes.data.data;

      // Create payment intent
      const paymentRes = await authApi.post("/payments/create-intent", {
        amount: total,
        currency: "gbp",
        metadata: { orderId: newOrder._id, orderNumber: newOrder.orderNumber },
      });

      // Confirm payment
      await authApi.post("/payments/confirm", {
        paymentIntentId: paymentRes.data.data.paymentIntentId,
        orderId: newOrder._id,
      });

      // Save address if new
      if (!selectedAddressId && shippingForm.street) {
        try {
          await authApi.post("/users/me/addresses", {
            ...shippingForm,
            isDefault: addresses.length === 0,
          });
        } catch {
          // silent - not critical
        }
      }

      clearCart();

      // Mark abandoned cart as recovered
      authApi.post("/abandoned-carts/mark-recovered", { orderId: newOrder._id }).catch(() => {});

      // Redeem gift card if used
      if (giftCardDiscount > 0 && giftCardCode) {
        authApi.post("/gift-cards/redeem", {
          code: giftCardCode,
          orderId: newOrder._id,
          amount: giftCardDiscount,
        }).catch(() => {});
      }

      setOrderId(newOrder.orderNumber);
      setOrderComplete(true);
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Failed to place order");
    } finally {
      setProcessing(false);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="section-padding container-custom">
        <div className="mx-auto max-w-md text-center">
          <h1 className="heading-secondary mb-4">Sign In to Checkout</h1>
          <Link href="/sign-in">
            <Button variant="accent">Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0 && !orderComplete) {
    return (
      <div className="section-padding container-custom">
        <div className="mx-auto max-w-md text-center">
          <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h1 className="heading-secondary mb-3">Your cart is empty</h1>
          <Link href="/shop">
            <Button variant="accent">Start Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="section-padding container-custom">
        <div className="mx-auto max-w-lg text-center">
          <div className="mb-6 rounded-full bg-green-50 p-6">
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
          </div>
          <h1 className="heading-secondary mb-3">Order Confirmed!</h1>
          <p className="mb-2 text-gray-600">
            Thank you for your order. Your order number is:
          </p>
          <p className="mb-6 text-xl font-bold text-accent">{orderId}</p>
          <p className="mb-8 text-sm text-gray-500">
            You&apos;ll receive an email confirmation shortly.
          </p>
          <div className="flex justify-center gap-4">
            <Link href={`/orders`}>
              <Button variant="secondary">View Orders</Button>
            </Link>
            <Link href="/shop">
              <Button variant="accent">Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-padding container-custom">
      <h1 className="heading-secondary mb-8">Checkout</h1>

      {/* Progress Steps */}
      <div className="mb-10 flex items-center justify-center gap-4">
        {[
          { key: "shipping", label: "Shipping", icon: MapPin },
          { key: "payment", label: "Payment", icon: CreditCard },
          { key: "confirm", label: "Confirm", icon: CheckCircle2 },
        ].map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                step === s.key
                  ? "bg-accent text-white"
                  : ["shipping", "payment", "confirm"].indexOf(step) > i
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {["shipping", "payment", "confirm"].indexOf(step) > i ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                i + 1
              )}
            </div>
            <span
              className={`text-sm font-medium ${
                step === s.key ? "text-accent" : "text-gray-400"
              }`}
            >
              {s.label}
            </span>
            {i < 2 && <div className="mx-2 h-px w-12 bg-gray-200" />}
          </div>
        ))}
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
        {/* Main Content */}
        <div>
          {/* Step 1: Shipping */}
          {step === "shipping" && (
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-primary">
                Shipping Address
              </h2>

              {loadingAddresses ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-accent" />
                </div>
              ) : (
                <>
                  {addresses.length > 0 && (
                    <div className="mb-6 space-y-2">
                      {addresses.map((addr) => (
                        <button
                          key={addr._id}
                          onClick={() => handleAddressSelect(addr)}
                          className={`w-full rounded-lg border p-4 text-left transition-colors ${
                            selectedAddressId === addr._id
                              ? "border-accent bg-accent/5"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <p className="text-sm font-medium">
                            {addr.label}{" "}
                            {addr.isDefault && (
                              <span className="text-xs text-accent">(Default)</span>
                            )}
                          </p>
                          <p className="text-sm text-gray-600">
                            {addr.street}, {addr.city}, {addr.state} {addr.zipCode}
                          </p>
                        </button>
                      ))}
                      <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="bg-white px-4 text-gray-400">or enter new</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Street *</label>
                        <Input
                          value={shippingForm.street}
                          onChange={(e) => setShippingForm({ ...shippingForm, street: e.target.value })}
                          placeholder="123 Main St"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">City *</label>
                        <Input
                          value={shippingForm.city}
                          onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                          placeholder="City"
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">State *</label>
                        <select
                          value={shippingForm.state}
                          onChange={(e) => setShippingForm({ ...shippingForm, state: e.target.value })}
                          className="input-field"
                        >
                          <option value="">Select</option>
                          {US_STATES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">ZIP Code *</label>
                        <Input
                          value={shippingForm.zipCode}
                          onChange={(e) => setShippingForm({ ...shippingForm, zipCode: e.target.value })}
                          placeholder="12345"
                        />
                      </div>
                    </div>
                    <Button variant="accent" size="lg" className="w-full" onClick={handleShippingSubmit}>
                      Continue to Payment
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 2: Payment */}
          {step === "payment" && (
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-primary">
                Payment Method
              </h2>

              <div className="mb-6 rounded-lg border border-accent/30 bg-accent/5 p-4">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-accent" />
                  <div>
                    <p className="text-sm font-medium">Credit / Debit Card</p>
                    <p className="text-xs text-gray-500">Secure payment via Stripe</p>
                  </div>
                </div>
              </div>

              {(!process.env.NEXT_PUBLIC_STRIPE_KEY || process.env.NEXT_PUBLIC_STRIPE_KEY === "pk_test_xxx") ? (
                <div className="mb-6">
                  <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 mb-4">
                    <p className="text-sm font-medium text-yellow-800">Demo Mode</p>
                    <p className="text-xs text-yellow-600">No real payment will be processed. Configure Stripe keys to enable live payments.</p>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Card Number</label>
                      <Input value="4242 4242 4242 4242" readOnly className="bg-gray-50 font-mono" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Expiry</label>
                        <Input value="12/28" readOnly className="bg-gray-50 font-mono" />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">CVC</label>
                        <Input value="123" readOnly className="bg-gray-50 font-mono" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <p className="mb-2 text-sm text-gray-600">Card details will be collected securely by Stripe.</p>
                </div>
              )}

              <div className="mb-6 rounded-lg bg-gray-50 p-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Lock className="h-4 w-4" />
                  <span>
                    {process.env.NEXT_PUBLIC_STRIPE_KEY && process.env.NEXT_PUBLIC_STRIPE_KEY !== "pk_test_xxx"
                      ? "Your payment info is encrypted and secure."
                      : "Demo mode — no real payment will be processed."}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep("shipping")}>
                  Back
                </Button>
                <Button variant="accent" size="lg" className="flex-1" onClick={() => setStep("confirm")}>
                  Review Order
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === "confirm" && (
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-primary">
                Review Your Order
              </h2>

              <div className="mb-4 space-y-3">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="mb-1 text-xs font-medium text-gray-500">SHIPPING TO</p>
                  <p className="text-sm font-medium">{shippingForm.street}</p>
                  <p className="text-sm text-gray-600">
                    {shippingForm.city}, {shippingForm.state} {shippingForm.zipCode}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="mb-2 text-xs font-medium text-gray-500">ITEMS</p>
                  {items.map((item) => (
                    <div
                      key={`${item.product._id}-${JSON.stringify(item.variant)}`}
                      className="flex justify-between py-1 text-sm"
                    >
                      <span className="text-gray-700">
                        {item.product.name} x{item.quantity}
                        {item.variant && ` (${Object.values(item.variant).join(", ")})`}
                      </span>
                      <span className="font-medium">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="mb-1 text-xs font-medium text-gray-500">PAYMENT</p>
                  <p className="text-sm">Credit / Debit Card (Stripe)</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep("payment")}>
                  Back
                </Button>
                <Button
                  variant="accent"
                  size="lg"
                  className="flex-1"
                  onClick={handlePlaceOrder}
                  disabled={processing}
                >
                  {processing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                  {processing ? "Placing Order..." : `Pay ${formatPrice(total)}`}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="h-fit rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-primary">Order Summary</h2>

          <div className="mb-4 max-h-48 space-y-3 overflow-y-auto">
            {items.map((item) => {
              const image = optImg(
                item.product.images.find((img) => img.isPrimary)?.url ||
                item.product.images[0]?.url ||
                "/placeholder-product.jpg",
                120, 120
              );
              return (
                <div
                  key={`${item.product._id}-${JSON.stringify(item.variant)}`}
                  className="flex gap-3"
                >
                  <img
                    src={image}
                    alt={item.product.name}
                    className="h-14 w-14 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium">
                    {formatPrice(item.product.price * item.quantity)}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="space-y-2 border-t pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax</span>
              <span>{formatPrice(tax)}</span>
            </div>
            {giftCardDiscount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Gift Card</span>
                <span className="font-semibold">-{formatPrice(giftCardDiscount)}</span>
              </div>
            )}
            {couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Coupon</span>
                <span className="font-semibold">-{formatPrice(couponDiscount)}</span>
              </div>
            )}
            <hr />
            <div className="flex justify-between text-base font-bold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          {/* Gift Card Input */}
          <div className="mt-4 border-t pt-4">
            <p className="mb-2 text-xs font-medium text-gray-500">HAVE A GIFT CARD?</p>
            <div className="flex gap-2">
              <Input
                value={giftCardCode}
                onChange={(e) => setGiftCardCode(e.target.value.toUpperCase())}
                placeholder="TKGC-XXXX"
                className="flex-1 font-mono text-xs"
              />
              <Button variant="outline" size="sm" onClick={handleApplyGiftCard} disabled={applyingGiftCard}>
                {applyingGiftCard ? <Loader2 className="h-3 w-3 animate-spin" /> : "Apply"}
              </Button>
            </div>
          </div>

          {/* Coupon Input */}
          <div className="mt-3 border-t pt-4">
            <p className="mb-2 text-xs font-medium text-gray-500">HAVE A COUPON?</p>
            <div className="flex gap-2">
              <Input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="e.g. SAVE10"
                className="flex-1 font-mono text-xs"
              />
              <Button variant="outline" size="sm" onClick={handleApplyCoupon} disabled={applyingCoupon}>
                {applyingCoupon ? <Loader2 className="h-3 w-3 animate-spin" /> : "Apply"}
              </Button>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                <Truck className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="text-[10px] font-semibold text-gray-700">Free Shipping</p>
              <p className="text-[9px] text-gray-400">£75+</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                <Shield className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-[10px] font-semibold text-gray-700">SSL Secure</p>
              <p className="text-[9px] text-gray-400">256-bit</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                <RotateCcw className="h-4 w-4 text-purple-600" />
              </div>
              <p className="text-[10px] font-semibold text-gray-700">Easy Returns</p>
              <p className="text-[9px] text-gray-400">30 Days</p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-1.5 rounded-lg bg-gray-50 px-3 py-2">
            <Lock className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-[10px] font-medium text-gray-500">Your payment is encrypted and secure</span>
          </div>
        </div>
      </div>
    </div>
  );
}
