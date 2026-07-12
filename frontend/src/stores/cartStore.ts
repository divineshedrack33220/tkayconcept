import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product } from "@/types";

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, variant?: { name: string; value: string }) => void;
  removeItem: (productId: string, variant?: { name: string; value: string }) => void;
  updateQuantity: (productId: string, quantity: number, variant?: { name: string; value: string }) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1, variant) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) =>
              item.product._id === product._id &&
              JSON.stringify(item.variant) === JSON.stringify(variant)
          );

          if (existingIndex > -1) {
            const updated = [...state.items];
            updated[existingIndex].quantity += quantity;
            return { items: updated };
          }

          return { items: [...state.items, { product, quantity, variant }] };
        });
      },

      removeItem: (productId, variant) => {
        set((state) => ({
          items: state.items.filter(
            (item) =>
              !(
                item.product._id === productId &&
                JSON.stringify(item.variant) === JSON.stringify(variant)
              )
          ),
        }));
      },

      updateQuantity: (productId, quantity, variant) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.product._id === productId &&
            JSON.stringify(item.variant) === JSON.stringify(variant)
              ? { ...item, quantity: Math.max(1, quantity) }
              : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "tkay-cart",
    }
  )
);
