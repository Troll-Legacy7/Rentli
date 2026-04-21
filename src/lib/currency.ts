const CURRENCY_CONFIG: Record<string, { locale: string; symbol: string; code: string }> = {
  ZMW: { locale: "en-ZM", symbol: "K", code: "ZMW" },
  USD: { locale: "en-US", symbol: "$", code: "USD" },
  EUR: { locale: "en-IE", symbol: "€", code: "EUR" },
  GBP: { locale: "en-GB", symbol: "£", code: "GBP" },
};

export function formatCurrency(amount: number, currency: string = "ZMW"): string {
  const config = CURRENCY_CONFIG[currency] ?? CURRENCY_CONFIG.ZMW;
  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.code,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function getCurrencySymbol(currency: string = "ZMW"): string {
  return CURRENCY_CONFIG[currency]?.symbol ?? "K";
}

export const SUPPORTED_CURRENCIES = Object.keys(CURRENCY_CONFIG);
