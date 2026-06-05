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
    priceInCents: 2600,
    pricePerEntry: 26,
    description: "One entry every month into each drawing.",
  },
  {
    id: "tier-3-entries",
    entries: 3,
    priceInCents: 6600,
    pricePerEntry: 22,
    savings: "15%",
    description: "Triple your chances at $22 per entry.",
    featured: true,
  },
  {
    id: "tier-5-entries",
    entries: 5,
    priceInCents: 10000,
    pricePerEntry: 20,
    savings: "23%",
    description: "Five monthly entries at $20 per entry.",
  },
  {
    id: "tier-10-entries",
    entries: 10,
    priceInCents: 18000,
    pricePerEntry: 18,
    savings: "31%",
    description: "Our best value — just $18 per entry.",
    bestValue: true,
  },
]

export function calculateCustomTier(amountCents: number): { entries: number; amountCents: number } | null {
  const PRICE_PER_ENTRY_CENTS = 1800 // $18
  if (amountCents < PRICE_PER_ENTRY_CENTS) return null
  const entries = Math.floor(amountCents / PRICE_PER_ENTRY_CENTS)
  return { entries, amountCents: entries * PRICE_PER_ENTRY_CENTS }
}
