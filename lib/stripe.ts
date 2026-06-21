import "server-only"
import Stripe from "stripe"

export function getStripe() {
  const apiKey = process.env.STRIPE_SECRET_KEY
  if (!apiKey) {
    throw new Error("STRIPE_SECRET_KEY is not set in environment variables")
  }
  return new Stripe(apiKey, {
    apiVersion: "2025-05-28.basil" as any,
    typescript: true,
  })
}

// For backwards compatibility - lazy initialization
let _stripe: Stripe | null = null
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    if (!_stripe) {
      _stripe = getStripe()
    }
    return (_stripe as any)[prop]
  }
})
