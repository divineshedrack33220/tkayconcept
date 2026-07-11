import { create } from "zustand";

interface UIStore {
  isMobileMenuOpen: boolean;
  isSearchOpen: boolean;
  isCartOpen: boolean;
  toggleMobileMenu: () => void;
  toggleSearch: () => void;
  toggleCart: () => void;
  closeAll: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isMobileMenuOpen: false,
  isSearchOpen: false,
  isCartOpen: false,

  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen, isSearchOpen: false, isCartOpen: false })),
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen, isMobileMenuOpen: false, isCartOpen: false })),
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen, isMobileMenuOpen: false, isSearchOpen: false })),
  closeAll: () => set({ isMobileMenuOpen: false, isSearchOpen: false, isCartOpen: false }),
}));
