export interface SubscriptionTier {
  id: string
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
    entries: 1,
    priceInCents: 3600,
    pricePerEntry: 36,
    description: "One entry every month into each drawing.",
  },
  {
    id: "tier-3-entries",
    entries: 3,
    priceInCents: 7200,
    pricePerEntry: 24,
    savings: "33%",
    description: "Triple your chances at $24 per entry.",
    featured: true,
  },
  {
    id: "tier-5-entries",
    entries: 5,
    priceInCents: 11800,
    pricePerEntry: 23.6,
    savings: "34%",
    description: "Five monthly entries at $23.60 per entry.",
  },
  {
    id: "tier-10-entries",
    entries: 10,
    priceInCents: 22600,
    pricePerEntry: 22.6,
    savings: "37%",
    description: "Our best value — just $22.60 per entry.",
    bestValue: true,
  },
]

// One-time single ticket price: $42
export const ONE_TIME_PRICE_CENTS = 4200

// One-time custom amount rate: $42 per entry
export const CUSTOM_PRICE_PER_ENTRY_CENTS = 4200

// Monthly custom amount rate: $20 per entry
export const MONTHLY_CUSTOM_PRICE_PER_ENTRY_CENTS = 2000

export function calculateCustomTier(amountCents: number): { entries: number; amountCents: number } | null {
  if (amountCents < CUSTOM_PRICE_PER_ENTRY_CENTS) return null
  const entries = Math.floor(amountCents / CUSTOM_PRICE_PER_ENTRY_CENTS)
  return { entries, amountCents: entries * CUSTOM_PRICE_PER_ENTRY_CENTS }
}

export function calculateMonthlyCustomTier(amountCents: number): { entries: number; amountCents: number } | null {
  if (amountCents < MONTHLY_CUSTOM_PRICE_PER_ENTRY_CENTS) return null
  const entries = Math.floor(amountCents / MONTHLY_CUSTOM_PRICE_PER_ENTRY_CENTS)
  return { entries, amountCents: entries * MONTHLY_CUSTOM_PRICE_PER_ENTRY_CENTS }
}
