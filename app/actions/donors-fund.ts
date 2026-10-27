"use server"

import { cookies } from "next/headers"
import { db } from "@/lib/db"
import { donations } from "@/lib/db/schema"
import { SUBSCRIPTION_TIERS, calculateMonthlyCustomTier } from "@/lib/products"
import { recordTransaction } from "@/lib/transactions"
import { sendAdminNotification, sendDonorConfirmation } from "@/lib/email"
import { createGrant } from "@/lib/donors-fund"

export type DonorsFundPlan = { kind: "tier"; tierId: string } | { kind: "custom"; amountCents: number }

export interface DonorsFundInput {
  plan: DonorsFundPlan
  name: string
  email: string
  donor: string
  donorAuthorization: string
  consent: { email: boolean; sms: boolean }
}

export type DonorsFundResponse =
  | { ok: true; entries: number; amount: number; confirmationNumber: string }
  | { ok: false; error: string }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function resolvePlan(plan: DonorsFundPlan) {
  if (plan.kind === "tier") {
    const tier = SUBSCRIPTION_TIERS.find((t) => t.id === plan.tierId)
    return tier ? { entries: tier.entries, amountCents: tier.priceInCents, label: tier.id } : null
  }
  if (!Number.isInteger(plan.amountCents) || plan.amountCents > 10_000_000) return null
  const custom = calculateMonthlyCustomTier(plan.amountCents)
  return custom ? { entries: custom.entries, amountCents: custom.amountCents, label: "monthly-custom" } : null
}

export async function submitDonorsFundGrant(input: DonorsFundInput): Promise<DonorsFundResponse> {
  const name = input.name?.trim().slice(0, 120) ?? ""
  const email = input.email?.trim().toLowerCase().slice(0, 200) ?? ""
  const donor = input.donor?.replace(/\s+/g, "") ?? ""
  const donorAuthorization = input.donorAuthorization?.trim() ?? ""

  if (!name) return { ok: false, error: "Please enter your name." }
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Please enter a valid email address." }
  const isCard = /^\d{16}$/.test(donor)
  if (!isCard && !EMAIL_RE.test(donor)) {
    return { ok: false, error: "Enter your 16-digit giving card number or your Donors' Fund username." }
  }
  if (!/^\d{3,4}$/.test(donorAuthorization)) {
    return { ok: false, error: "Enter your card's 3-digit CVV or 4-digit PIN." }
  }

  const resolved = resolvePlan(input.plan)
  if (!resolved) return { ok: false, error: "Please choose a valid donation plan." }

  const grant = await createGrant({
    amountCents: resolved.amountCents,
    donor,
    donorAuthorization,
    monthly: true,
    purposeNote: `Watch & Learn ${resolved.label}`,
  })
  if (!grant.ok) return grant

  const referralCode = (await cookies()).get("ref_code")?.value || null
  const dedupeId = `tdf_${grant.transactionId}`

  try {
    const inserted = await db
      .insert(donations)
      .values({
        stripeCustomerId: dedupeId,
        stripeSubscriptionId: dedupeId,
        name,
        email,
        entries: resolved.entries,
        amountCents: resolved.amountCents,
        status: "active",
        emailConsent: !!input.consent?.email,
        smsConsent: !!input.consent?.sms,
        referralCode,
      })
      .onConflictDoNothing({ target: donations.stripeSubscriptionId })
      .returning({ id: donations.id })

    if (inserted.length > 0) {
      await recordTransaction({
        stripePaymentIntentId: dedupeId,
        stripeSubscriptionId: dedupeId,
        name,
        email,
        amountCents: resolved.amountCents,
        entries: resolved.entries,
        type: "subscription_initial",
        status: "paid",
        referralCode,
        chargedAt: new Date(),
        donationId: inserted[0].id,
      })
      await sendAdminNotification("new_subscription", {
        name,
        email,
        entries: resolved.entries,
        amount: resolved.amountCents / 100,
      })
      await sendDonorConfirmation({
        name,
        email,
        entries: resolved.entries,
        amount: resolved.amountCents / 100,
        isOneTime: false,
      })
    }
  } catch (error) {
    // The grant already went through, so never report failure to the donor here.
    console.error("[donors-fund] Grant approved but recording failed", {
      transactionId: grant.transactionId,
      error: error instanceof Error ? error.message : String(error),
    })
  }

  return {
    ok: true,
    entries: resolved.entries,
    amount: resolved.amountCents / 100,
    confirmationNumber: grant.confirmationNumber,
  }
}
