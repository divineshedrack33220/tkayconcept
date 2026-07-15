import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  rate: number; // rate relative to USD
}

export const CURRENCIES: Currency[] = [
  { code: "GBP", symbol: "£", name: "British Pound", rate: 0.79 },
  { code: "USD", symbol: "$", name: "US Dollar", rate: 1 },
  { code: "EUR", symbol: "€", name: "Euro", rate: 0.92 },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira", rate: 1550 },
  { code: "ZAR", symbol: "R", name: "South African Rand", rate: 18.5 },
  { code: "GHS", symbol: "GH₵", name: "Ghanaian Cedi", rate: 15.8 },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling", rate: 153 },
];

interface CurrencyStore {
  currency: Currency;
  setCurrency: (code: string) => void;
}

export const useCurrencyStore = create<CurrencyStore>()(
  persist(
    (set) => ({
      currency: CURRENCIES[0],
      setCurrency: (code) => {
        const found = CURRENCIES.find((c) => c.code === code);
        if (found) set({ currency: found });
      },
    }),
    { name: "tkc-currency" }
  )
);

export function convertPrice(usdPrice: number, currency?: Currency): string {
  const c = currency || useCurrencyStore.getState().currency;
  const converted = usdPrice * c.rate;
  // Format with appropriate decimal places
  const decimals = c.rate > 100 ? 0 : c.rate > 10 ? 2 : 2;
  return `${c.symbol}${converted.toFixed(decimals)}`;
}
