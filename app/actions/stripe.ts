"use server"

import { stripe } from "@/lib/stripe"
import { SUBSCRIPTION_TIERS, calculateCustomTier, calculateMonthlyCustomTier, ONE_TIME_PRICE_CENTS } from "@/lib/products"
import { isDealActive } from "@/lib/deal"
import { getDrawingDate, getDrawingInfo } from "@/lib/drawing"
import { headers, cookies } from "next/headers"

async function getReferralCode() {
  const cookieStore = await cookies()
  return cookieStore.get("ref_code")?.value || ""
}

export async function createCheckoutSession(
  tierId: string,
  customAmountCents?: number,
  consent?: { email: boolean; sms: boolean }
) {
  try {
    const headersList = await headers()
    const origin = headersList.get("origin") || process.env.NEXT_PUBLIC_VERCEL_URL || "http://localhost:3000"
    const referralCode = await getReferralCode()

    // baseEntries = the donor's permanent monthly entry weight (every drawing).
    let baseEntries: number
    let amountCents: number

    if (tierId === "custom" && customAmountCents) {
      const customTier = calculateMonthlyCustomTier(customAmountCents)
      if (!customTier) {
        throw new Error("Invalid custom amount")
      }
      baseEntries = customTier.entries
      amountCents = customTier.amountCents
    } else {
      const tier = SUBSCRIPTION_TIERS.find((t) => t.id === tierId)
      if (!tier) {
        throw new Error("Invalid tier")
      }
      baseEntries = tier.entries
      amountCents = tier.priceInCents
    }

    // Limited-time promo: subscribe before the deadline and entries are DOUBLED,
    // but only for THIS month's drawing. The bonus is stored separately and
    // expires after the upcoming drawing, then the donor reverts to baseEntries.
    const dealDoubled = isDealActive()
    const bonusEntries = dealDoubled ? baseEntries : 0
    const totalThisDrawing = baseEntries + bonusEntries
    const bonusUntil = dealDoubled ? getDrawingDate() : null
    const drawingLabel = getDrawingInfo().dateLabel

    const productName = dealDoubled
      ? `Watch & Learn - ${baseEntries} → ${totalThisDrawing} Entries (Double Entries Deal!)`
      : `Watch & Learn - ${baseEntries} ${baseEntries === 1 ? "Entry" : "Entries"}/month`

    const description = dealDoubled
      ? `Monthly donation supporting Kollel Ohr Moshe. LIMITED-TIME DEAL: entries doubled to ${totalThisDrawing} for the ${drawingLabel} drawing (normally ${baseEntries}), then ${baseEntries} every month after.`
      : `Monthly donation supporting Kollel Ohr Moshe with ${baseEntries} raffle ${baseEntries === 1 ? "entry" : "entries"} every drawing`

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      // Omitting payment_method_types lets Stripe automatically offer all
      // enabled methods, including Apple Pay & Google Pay wallets.
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
              description,
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
        // `entries` carries the total for THIS drawing (used by success page & emails)
        entries: totalThisDrawing.toString(),
        baseEntries: baseEntries.toString(),
        bonusEntries: bonusEntries.toString(),
        bonusUntil: bonusUntil ? bonusUntil.toISOString() : "",
        amountCents: amountCents.toString(),
        emailConsent: consent?.email ? "true" : "false",
        smsConsent: consent?.sms ? "true" : "false",
        referralCode,
        dealDoubled: dealDoubled ? "true" : "false",
      },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#donate`,
    })

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

export async function createOneTimeCheckout(
  consent?: { email: boolean; sms: boolean },
  customAmountCents?: number
) {
  try {
    const headersList = await headers()
    const origin = headersList.get("origin") || process.env.NEXT_PUBLIC_VERCEL_URL || "http://localhost:3000"
    const referralCode = await getReferralCode()

    let amountCents = ONE_TIME_PRICE_CENTS // default single ticket: $42
    let entries = 1

    if (customAmountCents) {
      const result = calculateCustomTier(customAmountCents)
      if (!result || result.entries < 1) {
        throw new Error("Invalid custom amount")
      }
      entries = result.entries
      amountCents = result.amountCents
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      // Omitting payment_method_types lets Stripe automatically offer all
      // enabled methods, including Apple Pay & Google Pay wallets.
      billing_address_collection: "required",
      phone_number_collection: {
        enabled: true,
      },
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Watch & Learn - One-Time ${entries === 1 ? "Entry" : `${entries} Entries`}`,
              description: `One-time donation supporting Kollel Ohr Moshe with ${entries} raffle ${entries === 1 ? "entry" : "entries"} for this month's drawing`,
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        entries: entries.toString(),
        amountCents: amountCents.toString(),
        type: "one_time",
        emailConsent: consent?.email ? "true" : "false",
        smsConsent: consent?.sms ? "true" : "false",
        referralCode,
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
