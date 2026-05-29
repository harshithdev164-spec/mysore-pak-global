/**
 * Curated list of countries supported for international shipping via DHL Express.
 * India is NOT in this list — it ships via Delhivery.
 *
 * To expand: append a new entry. Verify food-import rules with DHL clearance before
 * launching a country (food/sweets are restricted in some markets, e.g. AU has
 * biosecurity controls).
 */

export interface CountryConfig {
  code: string;            // ISO 3166-1 alpha-2
  name: string;
  flag: string;            // unicode flag emoji
  dial: string;            // E.164 dial code prefix
  postal_pattern?: RegExp; // postal-code validation (omit for countries with loose formats)
  postal_label?: string;   // override label, e.g. "ZIP code"

  // Static fallback rates per courier. Customers see both options at checkout.
  // Final rate = base + (per_kg * weight_kg), rounded up.
  // Adjust these to match your negotiated rates with each courier.
  delhivery_base_rate_inr: number;
  delhivery_per_kg_inr: number;
  delhivery_etd_days: string;
  dhl_base_rate_inr: number;
  dhl_per_kg_inr: number;
  dhl_etd_days: string;
}

// Delhivery rates are slightly cheaper than DHL (Delhivery is the budget option).
// DHL is faster (better network), Delhivery is cheaper (better margin).
// Adjust both columns to match your real negotiated rates.
export const SUPPORTED_COUNTRIES: CountryConfig[] = [
  // Zone 1 — Gulf
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪", dial: "+971",
    delhivery_base_rate_inr: 2200, delhivery_per_kg_inr: 450, delhivery_etd_days: "5-7",
    dhl_base_rate_inr: 2500, dhl_per_kg_inr: 500, dhl_etd_days: "3-5" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦", dial: "+966",
    postal_pattern: /^\d{5}$/,
    delhivery_base_rate_inr: 2200, delhivery_per_kg_inr: 450, delhivery_etd_days: "5-7",
    dhl_base_rate_inr: 2500, dhl_per_kg_inr: 500, dhl_etd_days: "3-5" },
  { code: "QA", name: "Qatar", flag: "🇶🇦", dial: "+974",
    delhivery_base_rate_inr: 2200, delhivery_per_kg_inr: 450, delhivery_etd_days: "5-7",
    dhl_base_rate_inr: 2500, dhl_per_kg_inr: 500, dhl_etd_days: "3-5" },
  { code: "OM", name: "Oman", flag: "🇴🇲", dial: "+968",
    delhivery_base_rate_inr: 2200, delhivery_per_kg_inr: 450, delhivery_etd_days: "5-7",
    dhl_base_rate_inr: 2500, dhl_per_kg_inr: 500, dhl_etd_days: "3-5" },
  { code: "KW", name: "Kuwait", flag: "🇰🇼", dial: "+965",
    postal_pattern: /^\d{5}$/,
    delhivery_base_rate_inr: 2200, delhivery_per_kg_inr: 450, delhivery_etd_days: "5-7",
    dhl_base_rate_inr: 2500, dhl_per_kg_inr: 500, dhl_etd_days: "3-5" },

  // Zone 1b — SE Asia
  { code: "SG", name: "Singapore", flag: "🇸🇬", dial: "+65",
    postal_pattern: /^\d{6}$/,
    delhivery_base_rate_inr: 2400, delhivery_per_kg_inr: 550, delhivery_etd_days: "6-8",
    dhl_base_rate_inr: 2700, dhl_per_kg_inr: 600, dhl_etd_days: "4-6" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾", dial: "+60",
    postal_pattern: /^\d{5}$/,
    delhivery_base_rate_inr: 2400, delhivery_per_kg_inr: 550, delhivery_etd_days: "6-8",
    dhl_base_rate_inr: 2700, dhl_per_kg_inr: 600, dhl_etd_days: "4-6" },

  // Zone 2 — UK + EU
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", dial: "+44",
    postal_pattern: /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i,
    postal_label: "Postcode",
    delhivery_base_rate_inr: 3200, delhivery_per_kg_inr: 700, delhivery_etd_days: "7-10",
    dhl_base_rate_inr: 3500, dhl_per_kg_inr: 800, dhl_etd_days: "5-7" },
  { code: "DE", name: "Germany", flag: "🇩🇪", dial: "+49",
    postal_pattern: /^\d{5}$/,
    delhivery_base_rate_inr: 3200, delhivery_per_kg_inr: 700, delhivery_etd_days: "7-10",
    dhl_base_rate_inr: 3500, dhl_per_kg_inr: 800, dhl_etd_days: "5-7" },

  // Zone 3 — North America
  { code: "US", name: "United States", flag: "🇺🇸", dial: "+1",
    postal_pattern: /^\d{5}(-\d{4})?$/,
    postal_label: "ZIP code",
    delhivery_base_rate_inr: 3500, delhivery_per_kg_inr: 900, delhivery_etd_days: "7-10",
    dhl_base_rate_inr: 4000, dhl_per_kg_inr: 1000, dhl_etd_days: "5-7" },
  { code: "CA", name: "Canada", flag: "🇨🇦", dial: "+1",
    postal_pattern: /^[A-Z]\d[A-Z]\s*\d[A-Z]\d$/i,
    delhivery_base_rate_inr: 3500, delhivery_per_kg_inr: 900, delhivery_etd_days: "7-10",
    dhl_base_rate_inr: 4000, dhl_per_kg_inr: 1000, dhl_etd_days: "5-7" },

  // Zone 4 — Australia
  { code: "AU", name: "Australia", flag: "🇦🇺", dial: "+61",
    postal_pattern: /^\d{4}$/,
    delhivery_base_rate_inr: 4000, delhivery_per_kg_inr: 1000, delhivery_etd_days: "8-12",
    dhl_base_rate_inr: 4500, dhl_per_kg_inr: 1100, dhl_etd_days: "6-8" },
];

export type CourierKey = "delhivery" | "dhl";

export interface CourierRateOption {
  courier_company_id: number;     // 1 = Delhivery, 100 = DHL
  courier_name: string;            // "Delhivery" | "DHL Express"
  rate: number;                    // INR
  etd: string;                     // delivery estimate
}

/** Returns BOTH courier options (Delhivery + DHL) for the given country + weight. */
export function calculateStaticRates(
  country: string,
  weight_kg: number
): CourierRateOption[] {
  const cfg = COUNTRY_BY_CODE[country.toUpperCase()];
  if (!cfg) return [];
  const w = Math.max(0.5, weight_kg);
  return [
    {
      courier_company_id: 1,
      courier_name: "Delhivery",
      rate: Math.ceil(cfg.delhivery_base_rate_inr + cfg.delhivery_per_kg_inr * w),
      etd: cfg.delhivery_etd_days,
    },
    {
      courier_company_id: 100,
      courier_name: "DHL Express",
      rate: Math.ceil(cfg.dhl_base_rate_inr + cfg.dhl_per_kg_inr * w),
      etd: cfg.dhl_etd_days,
    },
  ];
}

/** Returns just the DHL static rate (used as final fallback inside getDhlRate). */
export function calculateStaticRate(
  country: string,
  weight_kg: number
): { rate_inr: number; etd_days: string } | null {
  const cfg = COUNTRY_BY_CODE[country.toUpperCase()];
  if (!cfg) return null;
  const w = Math.max(0.5, weight_kg);
  return {
    rate_inr: Math.ceil(cfg.dhl_base_rate_inr + cfg.dhl_per_kg_inr * w),
    etd_days: cfg.dhl_etd_days,
  };
}

export const COUNTRY_BY_CODE: Record<string, CountryConfig> = Object.fromEntries(
  SUPPORTED_COUNTRIES.map((c) => [c.code, c])
);

export function isSupportedCountry(code: string): boolean {
  return code in COUNTRY_BY_CODE;
}

export function isInternational(code: string | undefined | null): boolean {
  if (!code) return false;
  return code.toUpperCase() !== "IN";
}

export function validatePostalCode(code: string, country: string): boolean {
  const cfg = COUNTRY_BY_CODE[country.toUpperCase()];
  if (!cfg) return false;
  if (!cfg.postal_pattern) return code.trim().length >= 3 && code.trim().length <= 12;
  return cfg.postal_pattern.test(code.trim());
}

// Harmonized System code for sugar confectionery (Mysore Pak / Indian sweets fall here).
// Used in DHL commercial invoice for customs.
export const HS_CODE_SWEETS = "1704.90";
