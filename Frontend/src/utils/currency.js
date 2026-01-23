/**
 * Frontend Currency Utilities
 * Handles currency formatting and display for multi-currency support
 */

export const CURRENCIES = {
  INR: { code: "INR", symbol: "₹", name: "Indian Rupee" },
  USD: { code: "USD", symbol: "$", name: "US Dollar" },
  EUR: { code: "EUR", symbol: "€", name: "Euro" },
  GBP: { code: "GBP", symbol: "£", name: "British Pound" },
};

export const BASE_PRICES = {
  "1-1": 2999, // INR
  group: 1499, // INR
};

// Exchange rates (should match backend)
export const EXCHANGE_RATES = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0095,
};

// Country to currency mapping (should match backend)
export const COUNTRY_CURRENCY_MAP = {
  India: "INR",
  Singapore: "USD",
  "United Arab Emirates": "USD",
  UAE: "USD",
  "United States": "USD",
  USA: "USD",
  Canada: "USD",
  "United Kingdom": "GBP",
  UK: "GBP",
  England: "GBP",
  Germany: "EUR",
  France: "EUR",
  Italy: "EUR",
  Spain: "EUR",
  Netherlands: "EUR",
  default: "USD",
};

/**
 * Get currency for country
 */
export const getCurrencyForCountry = (country) => {
  if (!country) return COUNTRY_CURRENCY_MAP.default;
  return COUNTRY_CURRENCY_MAP[country] || COUNTRY_CURRENCY_MAP.default;
};

/**
 * Convert amount from INR to target currency
 */
export const convertCurrency = (amountINR, targetCurrency) => {
  const rate = EXCHANGE_RATES[targetCurrency];
  if (!rate) return amountINR;
  return Math.round(amountINR * rate * 100) / 100;
};

/**
 * Get price in specific currency
 */
export const getPriceInCurrency = (planId, currency) => {
  const basePrice = BASE_PRICES[planId];
  if (!basePrice) return 0;
  
  if (currency === "INR") return basePrice;
  return convertCurrency(basePrice, currency);
};

/**
 * Format currency with symbol
 */
export const formatCurrency = (amount, currencyCode = "INR") => {
  const currency = CURRENCIES[currencyCode];
  if (!currency) return `${amount}`;

  // Handle different currency formats
  const formatter = new Intl.NumberFormat(
    currencyCode === "INR" ? "en-IN" : "en-US",
    {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }
  );

  const formatted = formatter.format(amount);
  return `${currency.symbol}${formatted}`;
};

/**
 * Get plans with prices in specific currency
 */
export const getPlansWithCurrency = (currency) => {
  return [
    {
      plan_id: "1-1",
      name: "Personalized 1-on-1 Coaching",
      price: convertCurrency(BASE_PRICES["1-1"], currency),
      inrPrice: BASE_PRICES["1-1"],
      currency: currency,
      billing_cycle: "monthly",
      features: [
        "8 personalized sessions per month",
        "Customized learning plan",
        "Dedicated coach assignment",
        "Flexible scheduling",
        "Progress tracking & reports",
        "Tournament preparation",
      ],
    },
    {
      plan_id: "group",
      name: "Engaging Group Coaching",
      price: convertCurrency(BASE_PRICES.group, currency),
      inrPrice: BASE_PRICES.group,
      currency: currency,
      billing_cycle: "monthly",
      features: [
        "12 group sessions per month",
        "Small batches (max 6 students)",
        "Age & skill-based grouping",
        "Interactive learning environment",
        "Peer learning & practice games",
        "Monthly tournaments",
      ],
    },
  ];
};

/**
 * Format currency with full locale support
 */
export const formatCurrencyFull = (amount, currencyCode = "INR") => {
  const localeMap = {
    INR: "en-IN",
    USD: "en-US",
    EUR: "de-DE",
    GBP: "en-GB",
  };

  const locale = localeMap[currencyCode] || "en-US";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};
