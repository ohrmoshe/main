"use server"

import { stripe } from "@/lib/stripe"
import { db } from "@/lib/db"
import { donations, wheelNumbers } from "@/lib/db/schema"
import { cookies } from "next/headers"
import { sql } from "drizzle-orm"
import { sendDonorConfirmation, sendAdminNotification } from "@/lib/email"

export const WHEEL_MAX = 299

async function getReferralCode() {
  const cookieStore = await cookies()
  return cookieStore.get("ref_code")?.value || ""
}

// Returns how many numbers have been sold and whether the wheel is sold out.
export async function getWheelStatus() {
  try {
    const [row] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(wheelNumbers)
    const sold = Number(row?.count ?? 0)
    const available = WHEEL_MAX - sold
    return { sold, available, soldOut: available <= 0 }
  } catch (error) {
    console.error("[v0] Error fetching wheel status:", error)
    return { sold: 0, available: WHEEL_MAX, soldOut: false }
  }
}

// Step 1: create a Stripe customer and a SetupIntent so the donor can
// pre-authorize their card before the wheel determines the amount.
export async function createWheelSetupIntent(donor: {
  name: string
  email: string
  phone?: string
}) {
  if (!donor.name || !donor.email) {
    throw new Error("Name and email are required")
  }

  const customer = await stripe.customers.create({
    name: donor.name,
    email: donor.email,
    phone: donor.phone || undefined,
  })

  const setupIntent = await stripe.setupIntents.create({
    customer: customer.id,
    payment_method_types: ["card"],
    usage: "off_session",
  })

  return { clientSecret: setupIntent.client_secret, customerId: customer.id }
}

// Atomically reserve a random available number between 1 and WHEEL_MAX.
// The PRIMARY KEY on `number` guarantees each value is only ever taken once.
async function reserveNumber(amountPlaceholder: number): Promise<number | null> {
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      const result = await db.execute(sql`
        INSERT INTO wheel_numbers (number, amount_cents)
        SELECT s.n, ${amountPlaceholder}
        FROM generate_series(1, ${WHEEL_MAX}) AS s(n)
        WHERE NOT EXISTS (
          SELECT 1 FROM wheel_numbers w WHERE w.number = s.n
        )
        ORDER BY random()
        LIMIT 1
        RETURNING number
      `)
      const rows = (result as unknown as { rows?: { number: number }[] }).rows ?? (result as unknown as { number: number }[])
      const number = Array.isArray(rows) ? rows[0]?.number : undefined
      if (number) return Number(number)
      // No rows returned -> sold out
      return null
    } catch (err) {
      // Unique violation from a concurrent reservation: retry with a new pick
      console.log("[v0] reserveNumber retry", attempt, err)
    }
  }
  throw new Error("Could not reserve a number, please try again")
}

async function releaseNumber(number: number) {
  await db.execute(sql`DELETE FROM wheel_numbers WHERE number = ${number} AND stripe_payment_intent_id IS NULL`)
}

// Step 2: reserve a number, then charge the pre-authorized card that exact
// dollar amount. Returns the number the wheel should land on.
export async function spinAndCharge(input: {
  customerId: string
  paymentMethodId: string
  name: string
  email: string
  phone?: string
  consent?: { email: boolean; sms: boolean }
}) {
  const referralCode = (await getReferralCode()) || null

  // Reserve a number first (placeholder amount, updated after we know it)
  const number = await reserveNumber(0)
  if (number === null) {
    return { soldOut: true as const }
  }

  const amountCents = number * 100

  let paymentIntentId: string
  try {
    const pi = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: "usd",
      customer: input.customerId,
      payment_method: input.paymentMethodId,
      off_session: true,
      confirm: true,
      description: `Watch & Learn Prize Wheel - #${number}`,
      metadata: {
        wheelNumber: number.toString(),
        entries: "1",
        type: "wheel",
        referralCode: referralCode || "",
      },
    })

    if (pi.status !== "succeeded") {
      await releaseNumber(number)
      throw new Error("Payment was not completed")
    }
    paymentIntentId = pi.id
  } catch (err) {
    await releaseNumber(number)
    console.error("[v0] Wheel charge failed:", err)
    throw new Error("We couldn't charge your card. Please try a different card.")
  }

  // Persist the donor details on the reserved number
  await db.execute(sql`
    UPDATE wheel_numbers
    SET amount_cents = ${amountCents},
        donor_name = ${input.name},
        donor_email = ${input.email},
        donor_phone = ${input.phone || null},
        stripe_payment_intent_id = ${paymentIntentId},
        referral_code = ${referralCode}
    WHERE number = ${number}
  `)

  // Record the donation for admin stats / entries (1 entry per spin)
  await db.insert(donations).values({
    stripeCustomerId: input.customerId,
    stripeSubscriptionId: `wheel_${paymentIntentId}`,
    name: input.name,
    email: input.email,
    phone: input.phone || null,
    entries: 1,
    amountCents,
    status: "one_time",
    emailConsent: input.consent?.email ?? false,
    smsConsent: input.consent?.sms ?? false,
    referralCode,
  })

  await sendAdminNotification("one_time", {
    name: input.name,
    email: input.email,
    entries: 1,
    amount: amountCents / 100,
  })
  await sendDonorConfirmation({
    name: input.name,
    email: input.email,
    entries: 1,
    amount: amountCents / 100,
    isOneTime: true,
  })

  return { soldOut: false as const, number, amount: amountCents / 100 }
}
