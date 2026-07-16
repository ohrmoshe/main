export interface SubscriptionTier {
  id: string
  label: string
  entries: number
  priceInCents: number
  pricePerEntry: number
  savings?: string
  description: string
  featured?: boolean
  bestValue?: boolean
}

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: "tier-1-entry",
    label: "Double Chai",
    entries: 1,
    priceInCents: 3600,
    pricePerEntry: 36,
    description: "One entry every month into each drawing.",
  },
  {
    id: "tier-3-entries",
    label: "Quad Chai",
    entries: 3,
    priceInCents: 7200,
    pricePerEntry: 24,
    savings: "33%",
    description: "Triple your chances at $24 per entry.",
    featured: true,
  },
  {
    id: "tier-8-entries",
    label: "Partner",
    entries: 8,
    priceInCents: 18000,
    pricePerEntry: 22.5,
    savings: "38%",
    description: "Eight monthly entries at $22.50 per entry.",
  },
  {
    id: "tier-18-entries",
    label: "Seder Sponsor",
    entries: 18,
    priceInCents: 36000,
    pricePerEntry: 20,
    savings: "44%",
    description: "Our best value — just $20 per entry.",
    bestValue: true,
  },
]

// --- Win-back offer (special retention links for cancelled donors) ---
// The base "Double Chai" tier drops from $36 to $26. Every other tier gets a
// flat 10% discount. Entry counts stay exactly the same as the normal tiers.
export const WINBACK_BASE_PRICE_CENTS = 2600 // $36 -> $26
export const WINBACK_OTHER_DISCOUNT = 0.1 // 10% off all other tiers

export interface WinbackTier extends SubscriptionTier {
  originalPriceInCents: number
}

export function getWinbackTier(tierId: string): WinbackTier | null {
  const tier = SUBSCRIPTION_TIERS.find((t) => t.id === tierId)
  if (!tier) return null
  const isBase = tier.id === "tier-1-entry"
  const priceInCents = isBase
    ? WINBACK_BASE_PRICE_CENTS
    : Math.round(tier.priceInCents * (1 - WINBACK_OTHER_DISCOUNT))
  return {
    ...tier,
    priceInCents,
    pricePerEntry: Math.round((priceInCents / 100 / tier.entries) * 100) / 100,
    originalPriceInCents: tier.priceInCents,
  }
}

export function getWinbackTiers(): WinbackTier[] {
  return SUBSCRIPTION_TIERS.map((t) => getWinbackTier(t.id)!)
}

// One-time single ticket price: $42
export const ONE_TIME_PRICE_CENTS = 4200

// Prize wheel: numbers 1 through 299, each sold only once. Number = dollar amount.
export const WHEEL_MAX = 299

// One-time custom amount rate: $42 per entry
export const CUSTOM_PRICE_PER_ENTRY_CENTS = 4200

// Monthly custom amount rate: $20 per entry (only above $360)
export const MONTHLY_CUSTOM_PRICE_PER_ENTRY_CENTS = 2000
export const MONTHLY_CUSTOM_MIN_AMOUNT_CENTS = 36000 // must be above $360

export function calculateCustomTier(amountCents: number): { entries: number; amountCents: number } | null {
  if (amountCents < CUSTOM_PRICE_PER_ENTRY_CENTS) return null
  const entries = Math.floor(amountCents / CUSTOM_PRICE_PER_ENTRY_CENTS)
  return { entries, amountCents: entries * CUSTOM_PRICE_PER_ENTRY_CENTS }
}

export function calculateMonthlyCustomTier(amountCents: number): { entries: number; amountCents: number } | null {
  // Only eligible for entries if the amount is above $360
  if (amountCents <= MONTHLY_CUSTOM_MIN_AMOUNT_CENTS) return null
  const entries = Math.floor(amountCents / MONTHLY_CUSTOM_PRICE_PER_ENTRY_CENTS)
  if (entries < 1) return null
  // Charge the actual amount entered; entries are based on amount ÷ 20
  return { entries, amountCents }
}
