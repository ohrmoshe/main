"use server"

import { stripe, SITE_ID } from "@/lib/stripe"
import { SUBSCRIPTION_TIERS, calculateCustomTier, calculateMonthlyCustomTier, ONE_TIME_PRICE_CENTS } from "@/lib/products"
import { isDealActive, DEAL_DISCOUNT, getDealPriceCents } from "@/lib/deal"
import { getDrawingInfo } from "@/lib/drawing"
import { headers, cookies } from "next/headers"

async function getReferralCode() {
  const cookieStore = await cookies()
  return cookieStore.get("ref_code")?.value || ""
}

// Ensure a reusable "half off first month" coupon exists and return its id.
// duration: "once" => the discount applies only to the first invoice; every
// renewal after that is charged the full price.
const HALF_OFF_COUPON_ID = "HALF_OFF_FIRST_MONTH"
async function getHalfOffFirstMonthCoupon() {
  try {
    await stripe.coupons.retrieve(HALF_OFF_COUPON_ID)
  } catch {
    await stripe.coupons.create({
      id: HALF_OFF_COUPON_ID,
      percent_off: Math.round(DEAL_DISCOUNT * 100),
      duration: "once",
      name: "Half Off - Today Only (First Month)",
    })
  }
  return HALF_OFF_COUPON_ID
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

    // Limited-time promo: subscribe before midnight ET tonight and the FIRST
    // month is 50% off. Entry counts are unchanged; renewals bill full price.
    const dealHalfOff = isDealActive()
    const fullMonthlyCents = amountCents
    const firstMonthCents = dealHalfOff ? getDealPriceCents(amountCents) : amountCents
    const drawingLabel = getDrawingInfo().dateLabel

    const productName = dealHalfOff
      ? `Watch & Learn - ${baseEntries} ${baseEntries === 1 ? "Entry" : "Entries"}/month (50% Off First Month!)`
      : `Watch & Learn - ${baseEntries} ${baseEntries === 1 ? "Entry" : "Entries"}/month`

    const description = dealHalfOff
      ? `Monthly donation supporting Kollel Ohr Moshe with ${baseEntries} raffle ${baseEntries === 1 ? "entry" : "entries"} every drawing. TODAY ONLY: your first month is 50% off ($${(firstMonthCents / 100).toFixed(2)} instead of $${(fullMonthlyCents / 100).toFixed(2)}) for the ${drawingLabel} drawing, then $${(fullMonthlyCents / 100).toFixed(2)}/month after.`
      : `Monthly donation supporting Kollel Ohr Moshe with ${baseEntries} raffle ${baseEntries === 1 ? "entry" : "entries"} every drawing`

    // First-month 50% off applied as a one-time Stripe coupon (duration: once).
    const discounts = dealHalfOff ? [{ coupon: await getHalfOffFirstMonthCoupon() }] : undefined

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      discounts,
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
      // Tag the subscription itself so every future renewal invoice carries the
      // site marker (invoices inherit subscription metadata).
      subscription_data: {
        metadata: {
          site: SITE_ID,
          referralCode,
        },
      },
      metadata: {
        // Marks this charge as belonging to Watch & Learn (shared Stripe account).
        site: SITE_ID,
        // `entries` carries the total for THIS drawing (used by success page & emails)
        entries: baseEntries.toString(),
        baseEntries: baseEntries.toString(),
        bonusEntries: "0",
        bonusUntil: "",
        // Amount actually charged now (first month is half off during the deal);
        // `monthlyCents` is the full recurring price billed on every renewal.
        amountCents: firstMonthCents.toString(),
        monthlyCents: fullMonthlyCents.toString(),
        emailConsent: consent?.email ? "true" : "false",
        smsConsent: consent?.sms ? "true" : "false",
        referralCode,
        dealHalfOff: dealHalfOff ? "true" : "false",
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
        // Marks this charge as belonging to Watch & Learn (shared Stripe account).
        site: SITE_ID,
        entries: entries.toString(),
        amountCents: amountCents.toString(),
        type: "one_time",
        emailConsent: consent?.email ? "true" : "false",
        smsConsent: consent?.sms ? "true" : "false",
        referralCode,
      },
      payment_intent_data: {
        metadata: {
          site: SITE_ID,
          referralCode,
        },
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
