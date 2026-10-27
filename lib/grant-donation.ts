import "server-only"

import { cookies } from "next/headers"
import { db } from "@/lib/db"
import { donations } from "@/lib/db/schema"
import { SUBSCRIPTION_TIERS, calculateMonthlyCustomTier } from "@/lib/products"
import { recordTransaction } from "@/lib/transactions"
import { sendAdminNotification, sendDonorConfirmation } from "@/lib/email"

export type GrantPlan = { kind: "tier"; tierId: string } | { kind: "custom"; amountCents: number }

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function resolvePlan(plan: GrantPlan) {
  if (plan?.kind === "tier") {
    const tier = SUBSCRIPTION_TIERS.find((t) => t.id === plan.tierId)
    return tier ? { entries: tier.entries, amountCents: tier.priceInCents, label: tier.id } : null
  }
  if (plan?.kind !== "custom" || !Number.isInteger(plan.amountCents) || plan.amountCents > 10_000_000) return null
  const custom = calculateMonthlyCustomTier(plan.amountCents)
  return custom ? { entries: custom.entries, amountCents: custom.amountCents, label: "monthly-custom" } : null
}

export function validateDonor(input: { name?: string; email?: string }) {
  const name = input.name?.trim().slice(0, 120) ?? ""
  const email = input.email?.trim().toLowerCase().slice(0, 200) ?? ""
  if (!name) return { ok: false as const, error: "Please enter your name." }
  if (!EMAIL_RE.test(email)) return { ok: false as const, error: "Please enter a valid email address." }
  return { ok: true as const, name, email }
}

// Records an already-approved monthly grant. Never throws: the donor's money
// has moved, so failures are logged for manual reconciliation instead.
export async function recordApprovedGrant(input: {
  source: string
  externalId: string
  name: string
  email: string
  entries: number
  amountCents: number
  consent: { email: boolean; sms: boolean }
}) {
  const referralCode = (await cookies()).get("ref_code")?.value || null
  const dedupeId = `${input.source}_${input.externalId}`

  try {
    const inserted = await db
      .insert(donations)
      .values({
        stripeCustomerId: dedupeId,
        stripeSubscriptionId: dedupeId,
        name: input.name,
        email: input.email,
        entries: input.entries,
        amountCents: input.amountCents,
        status: "active",
        emailConsent: !!input.consent?.email,
        smsConsent: !!input.consent?.sms,
        referralCode,
      })
      .onConflictDoNothing({ target: donations.stripeSubscriptionId })
      .returning({ id: donations.id })

    if (inserted.length === 0) return

    await recordTransaction({
      stripePaymentIntentId: dedupeId,
      stripeSubscriptionId: dedupeId,
      name: input.name,
      email: input.email,
      amountCents: input.amountCents,
      entries: input.entries,
      type: "subscription_initial",
      status: "paid",
      referralCode,
      chargedAt: new Date(),
      donationId: inserted[0].id,
    })
    const summary = { name: input.name, email: input.email, entries: input.entries, amount: input.amountCents / 100 }
    await sendAdminNotification("new_subscription", summary)
    await sendDonorConfirmation({ ...summary, isOneTime: false })
  } catch (error) {
    console.error(`[${input.source}] Grant approved but recording failed`, {
      externalId: input.externalId,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

export function easternDateToday() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date())
  const get = (type: string) => parts.find((p) => p.type === type)?.value
  return `${get("month")}/${get("day")}/${get("year")}`
}
