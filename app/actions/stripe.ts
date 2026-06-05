"use server"

import { stripe } from "@/lib/stripe"
import { SUBSCRIPTION_TIERS, calculateCustomTier } from "@/lib/products"
import { headers } from "next/headers"

export async function createCheckoutSession(
  tierId: string,
  customAmountCents?: number
) {
  try {
    const headersList = await headers()
    const origin = headersList.get("origin") || process.env.NEXT_PUBLIC_VERCEL_URL || "http://localhost:3000"

    console.log("[v0] Creating checkout session", { tierId, customAmountCents, origin })

    let entries: number
    let amountCents: number
    let productName: string

    if (tierId === "custom" && customAmountCents) {
      const customTier = calculateCustomTier(customAmountCents)
      if (!customTier) {
        throw new Error("Invalid custom amount")
      }
      entries = customTier.entries
      amountCents = customTier.amountCents
      productName = `Watch & Learn - ${entries} Entries/month`
    } else {
      const tier = SUBSCRIPTION_TIERS.find((t) => t.id === tierId)
      if (!tier) {
        throw new Error("Invalid tier")
      }
      entries = tier.entries
      amountCents = tier.priceInCents
      productName = `Watch & Learn - ${entries} ${entries === 1 ? "Entry" : "Entries"}/month`
    }

    console.log("[v0] Creating Stripe session with", { entries, amountCents, productName })

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      billing_address_collection: "required",
      phone_number_collection: {
        enabled: true,
      },
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: productName,
              description: `Monthly donation supporting Kollel Ohr Moshe with ${entries} raffle ${entries === 1 ? "entry" : "entries"}`,
            },
            unit_amount: amountCents,
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        entries: entries.toString(),
        amountCents: amountCents.toString(),
      },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#donate`,
    })

    console.log("[v0] Checkout session created", { sessionId: session.id, url: session.url })

    return { url: session.url }
  } catch (error) {
    console.error("[v0] Error creating checkout session:", error)
    throw error
  }
}

export async function getCheckoutSession(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["subscription", "customer"],
  })
  return session
}

export async function createOneTimeCheckout() {
  try {
    const headersList = await headers()
    const origin = headersList.get("origin") || process.env.NEXT_PUBLIC_VERCEL_URL || "http://localhost:3000"

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      billing_address_collection: "required",
      phone_number_collection: {
        enabled: true,
      },
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Watch & Learn - One-Time Entry",
              description: "One-time donation supporting Kollel Ohr Moshe with 1 raffle entry for this month's drawing",
            },
            unit_amount: 3600, // $36
          },
          quantity: 1,
        },
      ],
      metadata: {
        entries: "1",
        amountCents: "3600",
        type: "one_time",
      },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#donate`,
    })

    return { url: session.url }
  } catch (error) {
    console.error("[v0] Error creating one-time checkout:", error)
    throw error
  }
}
