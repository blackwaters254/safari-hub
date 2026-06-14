import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Currency = "KSH" | "USD" | "EUR";

const defaultRates: Record<Currency, number> = {
  KSH: 1,
  USD: 0.0077,
  EUR: 0.0071,
};

const symbols: Record<Currency, string> = {
  KSH: "KSh",
  USD: "$",
  EUR: "€",
};

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  format: (kshAmount: number) => string;
  symbol: string;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "KSH",
  setCurrency: () => {},
  format: (v) => `KSh ${v.toLocaleString()}`,
  symbol: "KSh",
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>("KSH");
  const [rates, setRates] = useState<Record<Currency, number>>(defaultRates);

  useEffect(() => {
    (supabase as any)
      .from("payment_settings")
      .select("currency_rate_usd, currency_rate_eur")
      .limit(1)
      .maybeSingle()
      .then(({ data }: any) => {
        if (data) {
          setRates({
            KSH: 1,
            USD: Number(data.currency_rate_usd) || defaultRates.USD,
            EUR: Number(data.currency_rate_eur) || defaultRates.EUR,
          });
        }
      });
  }, []);

  const format = (kshAmount: number) => {
    const converted = kshAmount * rates[currency];
    const sym = symbols[currency];
    if (currency === "KSH") return `${sym} ${Math.round(converted).toLocaleString()}`;
    return `${sym}${converted.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, format, symbol: symbols[currency] }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);
