"use server"

import { db } from "@/lib/db"
import { transactions, donations, affiliates } from "@/lib/db/schema"
import { desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/auth"
import { recordTransaction } from "@/lib/transactions"
import { getBillingMonthKey, getBillingMonthLabel } from "@/lib/drawing"
import { stripe } from "@/lib/stripe"

export type TransactionRow = typeof transactions.$inferSelect
export type TransactionWithAffiliate = TransactionRow & { affiliateName: string | null }

export async function getTransactions(): Promise<TransactionRow[]> {
  await requireAdmin()
  return db.select().from(transactions).orderBy(desc(transactions.chargedAt))
}

// Build a lookup of referral code -> affiliate display name.
async function getAffiliateNameMap(): Promise<Map<string, string>> {
  const list = await db.select().from(affiliates)
  return new Map(list.map((a) => [a.code, a.name]))
}

// Group all transactions into 15th-to-15th billing months for the admin view,
// resolving each charge's referral code to the affiliate's name.
export async function getTransactionsByMonth() {
  await requireAdmin()
  const [rows, affiliateNames] = await Promise.all([
    db.select().from(transactions).orderBy(desc(transactions.chargedAt)),
    getAffiliateNameMap(),
  ])

  const groups = new Map<
    string,
    {
      key: string
      label: string
      total: number
      entries: number
      count: number
      rows: TransactionWithAffiliate[]
    }
  >()

  for (const row of rows) {
    const key = row.billingMonth || getBillingMonthKey(row.chargedAt ? new Date(row.chargedAt) : new Date())
    let group = groups.get(key)
    if (!group) {
      group = { key, label: getBillingMonthLabel(key), total: 0, entries: 0, count: 0, rows: [] }
      groups.set(key, group)
    }
    group.total += row.amountCents
    group.entries += row.entries
    group.count += 1
    group.rows.push({
      ...row,
      affiliateName: row.referralCode ? affiliateNames.get(row.referralCode) ?? null : null,
    })
  }

  // Most recent billing month first.
  return Array.from(groups.values()).sort((a, b) => (a.key < b.key ? 1 : -1))
}

// Remove a single charge (e.g. a duplicate or a mistaken entry).
export async function deleteTransaction(id: number) {
  await requireAdmin()
  await db.delete(transactions).where(eq(transactions.id, id))
  revalidatePath("/admin")
}

// Manually adjust a charge's amount and/or entry count for corrections.
export async function updateTransaction(
  id: number,
  data: { amountCents?: number; entries?: number },
) {
  await requireAdmin()
  const patch: Partial<TransactionRow> = {}
  if (typeof data.amountCents === "number" && data.amountCents >= 0) patch.amountCents = data.amountCents
  if (typeof data.entries === "number" && data.entries >= 0) patch.entries = data.entries
  if (Object.keys(patch).length === 0) return
  await db.update(transactions).set(patch).where(eq(transactions.id, id))
  revalidatePath("/admin")
}

// Pull every Stripe charge that Stripe has already processed and insert any
// that are missing from the transactions table. Safe to run repeatedly — each
// charge is deduped on its invoice id / payment intent id.
export async function backfillTransactionsFromStripe(): Promise<{
  invoicesScanned: number
  oneTimeScanned: number
  inserted: number
}> {
  await requireAdmin()

  let invoicesScanned = 0
  let oneTimeScanned = 0
  let inserted = 0

  // --- Pass A: subscription invoices (initial charges + every renewal) ---
  const invoiceIterator = stripe.invoices.list({ status: "paid", limit: 100 })
  for await (const invoice of invoiceIterator) {
    invoicesScanned++

    const amountCents = invoice.amount_paid ?? invoice.amount_due ?? 0
    if (amountCents <= 0) continue

    const inv = invoice as any
    const subscriptionId: string | null =
      (typeof inv.subscription === "string" ? inv.subscription : null) ||
      inv.parent?.subscription_details?.subscription ||
      inv.lines?.data?.[0]?.subscription ||
      inv.lines?.data?.[0]?.parent?.subscription_item_details?.subscription ||
      null

    if (!subscriptionId) continue

    const [donor] = await db
      .select()
      .from(donations)
      .where(eq(donations.stripeSubscriptionId, subscriptionId))

    const paidAt = invoice.status_transitions?.paid_at
      ? new Date(invoice.status_transitions.paid_at * 1000)
      : new Date((invoice.created || Math.floor(Date.now() / 1000)) * 1000)

    const isInitial = invoice.billing_reason === "subscription_create"

    const result = await recordTransaction({
      stripeInvoiceId: invoice.id,
      stripePaymentIntentId: typeof inv.payment_intent === "string" ? inv.payment_intent : null,
      stripeChargeId: typeof inv.charge === "string" ? inv.charge : null,
      stripeCustomerId: typeof invoice.customer === "string" ? invoice.customer : null,
      stripeSubscriptionId: subscriptionId,
      name: donor?.name || invoice.customer_name || "Unknown",
      email: donor?.email || invoice.customer_email || "",
      amountCents,
      entries: donor?.entries ?? 0,
      type: isInitial ? "subscription_initial" : "subscription_renewal",
      status: "paid",
      referralCode: donor?.referralCode ?? null,
      chargedAt: paidAt,
      donationId: donor?.id ?? null,
    })
    if (result.inserted) inserted++
  }

  // --- Pass B: one-time donations already stored (no Stripe invoice) ---
  const oneTimers = await db.select().from(donations).where(eq(donations.status, "one_time"))
  for (const d of oneTimers) {
    oneTimeScanned++

    // Skip if this donor already has a transaction (idempotent re-runs).
    const existing = await db
      .select({ id: transactions.id })
      .from(transactions)
      .where(eq(transactions.donationId, d.id))
      .limit(1)
    if (existing.length) continue

    const chargedAt = d.createdAt ? new Date(d.createdAt) : new Date()
    // Stored one-time subscription id is a synthetic "onetime_<session>" key —
    // reuse it as a stable payment-intent key so re-runs stay idempotent.
    await recordTransaction({
      stripePaymentIntentId: d.stripeSubscriptionId || `donation_${d.id}`,
      stripeCustomerId: d.stripeCustomerId || null,
      name: d.name,
      email: d.email,
      amountCents: d.amountCents,
      entries: d.entries,
      type: "one_time",
      status: "paid",
      referralCode: d.referralCode ?? null,
      chargedAt,
      donationId: d.id,
    })
    inserted++
  }

  revalidatePath("/admin")
  return { invoicesScanned, oneTimeScanned, inserted }
}
