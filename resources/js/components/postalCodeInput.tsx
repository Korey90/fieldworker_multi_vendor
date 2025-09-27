import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

interface PostalCodeInputProps {
  value: string
  onChange: (value: string) => void
  country: string
  onCountryChange: (country: string) => void
}

interface CountryRule {
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

export function PostalCodeInput({ value, onChange, country, onCountryChange }: PostalCodeInputProps) {
  const [matchingCountries, setMatchingCountries] = useState<CountryRule[]>([])
  const [isValid, setIsValid] = useState(true)

  useEffect(() => {
    if (!value) {
      setMatchingCountries([])
      setIsValid(true)
      return
    }

    const matches = countryRules.filter((rule) => rule.regex.test(value))
    setMatchingCountries(matches)
    // jeśli kraj wybrany i regex się zgadza → valid
    const valid = matches.some((rule) => rule.code === country)
    setIsValid(valid || matches.length === 0)
  }, [value, country])

  const handleFlagClick = (rule: CountryRule) => {
    onCountryChange(rule.code)
  }

  return (
    <div>
        <Label htmlFor="postal_code">Postal Code</Label>
        <Input
          id="postal_code"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter postal code"
          className={`pr-10 ${!isValid ? "border-red-500" : ""}`}
        />
        <div className="flex space-x-2">
          {matchingCountries.map((rule) => (
            <span
              key={rule.code}
              className="cursor-pointer text-xl"
              title={rule.name}
              onClick={() => handleFlagClick(rule)}
            >
              {rule.flag}
            </span>
          ))}
        </div>
      {!isValid && value && (
        <p className="text-sm text-red-600 mt-1">Postal code does not match the selected country</p>
      )}
    </div>
  )
}
