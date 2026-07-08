import "server-only"
import { db } from "@/lib/db"
import { transactions, donations } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { getBillingMonthKey } from "@/lib/drawing"

export type TransactionType =
  | "subscription_initial"
  | "subscription_renewal"
  | "one_time"
  | "manual"

export interface RecordTransactionInput {
  stripeInvoiceId?: string | null
  stripePaymentIntentId?: string | null
  stripeChargeId?: string | null
  stripeCustomerId?: string | null
  stripeSubscriptionId?: string | null
  name: string
  email: string
  amountCents: number
  entries: number
  type: TransactionType
  status?: string
  referralCode?: string | null
  chargedAt: Date
  /** When provided, skips the donation lookup. */
  donationId?: number | null
}

/**
 * Insert one charge as its own transaction row. Deduplicates on the Stripe
 * invoice id (recurring charges) or payment intent id (one-time payments), so
 * this is safe to call from both the webhook and the Stripe backfill.
 * Returns whether a new row was inserted.
 */
export async function recordTransaction(
  input: RecordTransactionInput,
): Promise<{ inserted: boolean }> {
  // Dedupe: never record the same Stripe charge twice.
  if (input.stripeInvoiceId) {
    const existing = await db
      .select({ id: transactions.id })
      .from(transactions)
      .where(eq(transactions.stripeInvoiceId, input.stripeInvoiceId))
      .limit(1)
    if (existing.length) return { inserted: false }
  } else if (input.stripePaymentIntentId) {
    const existing = await db
      .select({ id: transactions.id })
      .from(transactions)
      .where(eq(transactions.stripePaymentIntentId, input.stripePaymentIntentId))
      .limit(1)
    if (existing.length) return { inserted: false }
  }

  // Link back to the donor record when we can find one.
  let donationId = input.donationId ?? null
  if (donationId == null && input.stripeSubscriptionId) {
    const [d] = await db
      .select({ id: donations.id })
      .from(donations)
      .where(eq(donations.stripeSubscriptionId, input.stripeSubscriptionId))
      .limit(1)
    donationId = d?.id ?? null
  }

  await db
    .insert(transactions)
    .values({
      donationId,
      stripeInvoiceId: input.stripeInvoiceId || null,
      stripePaymentIntentId: input.stripePaymentIntentId || null,
      stripeChargeId: input.stripeChargeId || null,
      stripeCustomerId: input.stripeCustomerId || null,
      stripeSubscriptionId: input.stripeSubscriptionId || null,
      name: input.name || "",
      email: input.email || "",
      amountCents: input.amountCents,
      entries: input.entries,
      type: input.type,
      status: input.status || "paid",
      billingMonth: getBillingMonthKey(input.chargedAt),
      referralCode: input.referralCode || null,
      chargedAt: input.chargedAt,
    })
    .onConflictDoNothing()

  return { inserted: true }
}
