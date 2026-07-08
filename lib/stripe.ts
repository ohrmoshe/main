import "server-only"
import Stripe from "stripe"

// Multiple of our websites share the same Stripe account. We stamp every
// checkout session and subscription created by THIS app with this identifier
// so the webhook and backfill can record only Watch & Learn charges and ignore
// charges belonging to the other sites.
export const SITE_ID = "watchnlearn"

// True when a Stripe object's metadata marks it as belonging to this site.
export function isThisSite(metadata: Stripe.Metadata | null | undefined): boolean {
  return metadata?.site === SITE_ID
}

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
