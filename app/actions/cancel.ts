"use server"

import { stripe } from "@/lib/stripe"
import { db } from "@/lib/db"
import { donations } from "@/lib/db/schema"
import { eq, sql } from "drizzle-orm"
import { headers } from "next/headers"
import { createCancelToken, verifyCancelToken } from "@/lib/auth"
import { checkRateLimit } from "@/lib/rate-limit"
import { sendCancelLinkEmail } from "@/lib/email"

// FIX (#2): donors must prove ownership of their email via a one-time signed magic link before they
// can view or cancel a subscription. The previous lookupSubscription/cancelSubscription actions —
// which acted on ANY email with no proof of ownership — have been removed.

export async function requestCancelLink(email: string) {
  const cleanEmail = (email || "").trim().toLowerCase()
  const h = await headers()
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"

  // Rate limit per IP+email to prevent email-bombing a donor or burning the email quota.
  const rl = checkRateLimit(`cancel-link:${ip}:${cleanEmail}`, 3, 15 * 60_000)
  if (rl.allowed && cleanEmail) {
    const [donor] = await db
      .select()
      .from(donations)
      .where(sql`lower(${donations.email}) = ${cleanEmail}`)
    if (donor && donor.status !== "cancelled" && donor.stripeSubscriptionId) {
      const token = createCancelToken(donor.email)
      const origin = h.get("origin") || process.env.NEXT_PUBLIC_VERCEL_URL || "http://localhost:3000"
      const link = `${origin}/cancel?token=${encodeURIComponent(token)}`
      await sendCancelLinkEmail(donor.email, donor.name, link)
    }
  }

  // Always generic — never reveal whether an email has a subscription (no account enumeration).
  return { ok: true as const }
}

export async function lookupWithToken(token: string) {
  const email = verifyCancelToken(token)
  if (!email) return { valid: false as const }

  const [donor] = await db.select().from(donations).where(eq(donations.email, email))
  if (!donor || donor.status === "cancelled" || !donor.stripeSubscriptionId) {
    return { valid: true as const, found: false as const }
  }

  return {
    valid: true as const,
    found: true as const,
    donor: {
      name: donor.name,
      email: donor.email,
      entries: donor.entries,
      amount: donor.amountCents / 100,
    },
  }
}

export async function cancelWithToken(token: string) {
  const email = verifyCancelToken(token)
  if (!email) {
    return { success: false as const, message: "This link is invalid or has expired. Please request a new one." }
  }

  const [donor] = await db.select().from(donations).where(eq(donations.email, email))
  if (!donor || !donor.stripeSubscriptionId) {
    return { success: false as const, message: "No active subscription found." }
  }

  try {
    await stripe.subscriptions.cancel(donor.stripeSubscriptionId)
    await db
      .update(donations)
      .set({ status: "cancelled", cancelledAt: new Date(), updatedAt: new Date() })
      .where(eq(donations.id, donor.id))
    return { success: true as const }
  } catch (error) {
    console.error("Cancel subscription error:", error instanceof Error ? error.message : "unknown")
    return { success: false as const, message: "Failed to cancel subscription. Please try again." }
  }
}
