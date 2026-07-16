"use server"

import { randomBytes } from "node:crypto"
import { headers } from "next/headers"
import { desc, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { offerLinks } from "@/lib/db/schema"
import { requireAdmin } from "@/lib/auth"
import { stripe, SITE_ID } from "@/lib/stripe"
import { getWinbackTier } from "@/lib/products"

export type OfferLinkRow = typeof offerLinks.$inferSelect

// --- Admin: create a new one-time win-back link ---
export async function createOfferLink(label?: string): Promise<OfferLinkRow> {
  await requireAdmin()
  const token = randomBytes(24).toString("base64url")
  const [row] = await db
    .insert(offerLinks)
    .values({ token, label: label?.trim() || null })
    .returning()
  return row
}

// --- Admin: list all generated links (newest first) ---
export async function getOfferLinks(): Promise<OfferLinkRow[]> {
  await requireAdmin()
  return db.select().from(offerLinks).orderBy(desc(offerLinks.createdAt))
}

// --- Admin: delete a link (e.g. an unused one you no longer want live) ---
export async function deleteOfferLink(id: number) {
  await requireAdmin()
  await db.delete(offerLinks).where(eq(offerLinks.id, id))
}

// --- Public: is this token valid and still usable? ---
// Returns only what the offer page needs — never leaks other link data.
export async function getOfferLinkStatus(
  token: string,
): Promise<{ status: "valid" | "redeemed" | "invalid" }> {
  if (!token) return { status: "invalid" }
  const [row] = await db.select().from(offerLinks).where(eq(offerLinks.token, token)).limit(1)
  if (!row) return { status: "invalid" }
  return { status: row.redeemed ? "redeemed" : "valid" }
}

// --- Public: create a discounted subscription checkout for a valid link ---
export async function createOfferCheckoutSession(
  token: string,
  tierId: string,
  consent?: { email: boolean; sms: boolean },
) {
  // Re-validate server-side: the link must exist and be unredeemed. This is the
  // authoritative check — the client cannot bypass it or forge a token.
  const [link] = await db.select().from(offerLinks).where(eq(offerLinks.token, token)).limit(1)
  if (!link) throw new Error("This offer link is not valid.")
  if (link.redeemed) throw new Error("This offer link has already been used.")

  const tier = getWinbackTier(tierId)
  if (!tier) throw new Error("Invalid tier")

  const headersList = await headers()
  const origin =
    headersList.get("origin") || process.env.NEXT_PUBLIC_VERCEL_URL || "http://localhost:3000"

  const productName = `Watch & Learn - ${tier.entries} ${tier.entries === 1 ? "Entry" : "Entries"}/month (Member Exclusive)`
  const description = `Exclusive win-back rate: ${tier.entries} raffle ${tier.entries === 1 ? "entry" : "entries"} every drawing supporting Kollel Ohr Moshe.`

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    billing_address_collection: "required",
    phone_number_collection: { enabled: true },
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: productName, description },
          unit_amount: tier.priceInCents,
          recurring: { interval: "month" },
        },
        quantity: 1,
      },
    ],
    subscription_data: {
      metadata: {
        site: SITE_ID,
        offerToken: token,
      },
    },
    metadata: {
      site: SITE_ID,
      // Win-back offer never doubles entries — the value is the discount.
      entries: tier.entries.toString(),
      baseEntries: tier.entries.toString(),
      bonusEntries: "0",
      bonusUntil: "",
      amountCents: tier.priceInCents.toString(),
      emailConsent: consent?.email ? "true" : "false",
      smsConsent: consent?.sms ? "true" : "false",
      referralCode: "",
      offerToken: token,
    },
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/offer/${token}`,
  })

  return { url: session.url }
}
