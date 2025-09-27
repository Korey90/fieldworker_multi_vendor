// countryRules.ts
export interface CountryRule {
  code: string
  name: string
  regex: RegExp
  flag: string
}

export const countryRules: CountryRule[] = [
  { code: "AT", name: "Austria", regex: /^\d{4}$/, flag: "🇦🇹" },
  { code: "BE", name: "Belgium", regex: /^\d{4}$/, flag: "🇧🇪" },
  { code: "BG", name: "Bulgaria", regex: /^\d{4}$/, flag: "🇧🇬" },
  { code: "HR", name: "Croatia", regex: /^\d{5}$/, flag: "🇭🇷" },
  { code: "CY", name: "Cyprus", regex: /^\d{4}$/, flag: "🇨🇾" },
  { code: "CZ", name: "Czech Republic", regex: /^\d{3} ?\d{2}$/, flag: "🇨🇿" },
  { code: "DK", name: "Denmark", regex: /^\d{4}$/, flag: "🇩🇰" },
  { code: "EE", name: "Estonia", regex: /^\d{5}$/, flag: "🇪🇪" },
  { code: "FI", name: "Finland", regex: /^\d{5}$/, flag: "🇫🇮" },
  { code: "FR", name: "France", regex: /^\d{5}$/, flag: "🇫🇷" },
  { code: "DE", name: "Germany", regex: /^\d{5}$/, flag: "🇩🇪" },
  { code: "GR", name: "Greece", regex: /^\d{3} ?\d{2}$/, flag: "🇬🇷" },
  { code: "HU", name: "Hungary", regex: /^\d{4}$/, flag: "🇭🇺" },
  { code: "IT", name: "Italy", regex: /^\d{5}$/, flag: "🇮🇹" },
  { code: "LV", name: "Latvia", regex: /^\d{4}$/, flag: "🇱🇻" },
  { code: "LT", name: "Lithuania", regex: /^\d{5}$/, flag: "🇱🇹" },
  { code: "LU", name: "Luxembourg", regex: /^\d{4}$/, flag: "🇱🇺" },
  { code: "MT", name: "Malta", regex: /^[A-Z]{3} ?\d{2}$/i, flag: "🇲🇹" },
  { code: "NL", name: "Netherlands", regex: /^\d{4} ?[A-Z]{2}$/i, flag: "🇳🇱" },
  { code: "PL", name: "Poland", regex: /^\d{2}-\d{3}$/, flag: "🇵🇱" },
  { code: "PT", name: "Portugal", regex: /^\d{4}-\d{3}$/, flag: "🇵🇹" },
  { code: "RO", name: "Romania", regex: /^\d{6}$/, flag: "🇷🇴" },
  { code: "SK", name: "Slovakia", regex: /^\d{3} ?\d{2}$/, flag: "🇸🇰" },
  { code: "SI", name: "Slovenia", regex: /^\d{4}$/, flag: "🇸🇮" },
  { code: "ES", name: "Spain", regex: /^\d{5}$/, flag: "🇪🇸" },
  { code: "SE", name: "Sweden", regex: /^\d{3} ?\d{2}$/, flag: "🇸🇪" },
  { code: "GB", name: "United Kingdom", regex: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i, flag: "🇬🇧" },
  { code: "IE", name: "Ireland", regex: /^[A-Z]{1,2}\d{1,2} ?[A-Z\d]{1,4}$/i, flag: "🇮🇪" },
]
