import { useEffect, useRef } from "react";
import { useCartStore } from "@/stores/cartStore";
import api from "@/lib/api";
import { useSafeUser } from "@/lib/safe-clerk";

export function useAbandonedCartLogger() {
  const { isSignedIn } = useSafeUser();
  const items = useCartStore((s) => s.items);
  const lastLoggedRef = useRef<string>("");

  useEffect(() => {
    if (!isSignedIn || items.length === 0) return;

    const cartHash = JSON.stringify(items.map((i) => ({ id: i.product?._id, qty: i.quantity })));
    if (cartHash === lastLoggedRef.current) return;

    const timer = setTimeout(() => {
      lastLoggedRef.current = cartHash;
      const subtotal = items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
      api.post("/abandoned-carts", {
        items: items.map((item) => ({
          name: item.product?.name || "Unknown",
          price: item.product?.price || 0,
          quantity: item.quantity,
          image: item.product?.images?.[0]?.url || "",
          productId: item.product?._id,
        })),
        subtotal,
      }).catch(() => {});
    }, 5000); // Log 5s after cart changes to avoid spam

    return () => clearTimeout(timer);
  }, [isSignedIn, items]);
}
