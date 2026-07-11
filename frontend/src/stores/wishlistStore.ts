import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types";

interface WishlistStore {
  items: Product[];
  setItems: (items: Product[]) => void;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  hasItem: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      setItems: (items) => set({ items }),

      addItem: (product) =>
        set((state) => {
          if (state.items.some((p) => p._id === product._id)) return state;
          return { items: [product, ...state.items] };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((p) => p._id !== productId),
        })),

      hasItem: (productId) => get().items.some((p) => p._id === productId),
    }),
    { name: "tkay-wishlist" }
  )
);
