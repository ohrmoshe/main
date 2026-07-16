"use server"

import { db } from "@/lib/db"
import { transactions, donations, affiliates } from "@/lib/db/schema"
import { desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/auth"
import { recordTransaction } from "@/lib/transactions"
import { getBillingMonthKey, getBillingMonthLabel, getDrawingWindow } from "@/lib/drawing"
import { stripe } from "@/lib/stripe"

export type TransactionRow = typeof transactions.$inferSelect
export type TransactionWithAffiliate = TransactionRow & { affiliateName: string | null }

const TYPE_EXPORT_LABELS: Record<string, string> = {
  subscription_initial: "New Monthly",
  subscription_renewal: "Renewal",
  one_time: "One-Time",
  manual: "Manual",
}

// Neutralize spreadsheet formula injection (Excel/Sheets treat a leading = + - @
// as a live formula), then quote and escape the cell.
function csvCell(value: unknown): string {
  let s = String(value ?? "")
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s
  return `"${s.replace(/"/g, '""')}"`
}

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

// Entrants for the UPCOMING drawing: every charge dated between the previous
// drawing (8 PM PT on the 15th) and the next one. This includes monthly
// renewals, new monthly signups, and one-time donations in the window — each
// charge is a separate entry line, which is what feeds the live wheel.
export async function getNextRaffleEntrants() {
  await requireAdmin()
  const window = getDrawingWindow()
  const [rows, affiliateNames] = await Promise.all([
    db.select().from(transactions).orderBy(desc(transactions.chargedAt)),
    getAffiliateNameMap(),
  ])

  const startMs = window.start.getTime()
  const endMs = window.end.getTime()

  const inWindow = rows
    .filter((r) => {
      const t = r.chargedAt ? new Date(r.chargedAt).getTime() : NaN
      return Number.isFinite(t) && t >= startMs && t < endMs
    })
    .map((row) => ({
      ...row,
      affiliateName: row.referralCode ? affiliateNames.get(row.referralCode) ?? null : null,
    }))

  return {
    key: window.key,
    label: window.label,
    dateLabel: window.dateLabel,
    startsAt: window.start,
    endsAt: window.end,
    count: inWindow.length,
    entries: inWindow.reduce((s, r) => s + r.entries, 0),
    total: inWindow.reduce((s, r) => s + r.amountCents, 0),
    rows: inWindow,
  }
}

// Export per-charge rows (INCLUDING renewals) as CSV. This is the correct source
// for building the wheel — unlike the donations export, a monthly donor who has
// renewed shows one line per charge. scope "next" limits to the upcoming drawing
// window; "all" exports every recorded charge.
export async function exportTransactionsCSV(scope: "all" | "next" = "next"): Promise<string> {
  await requireAdmin()
  const [rows, affiliateNames] = await Promise.all([
    db.select().from(transactions).orderBy(desc(transactions.chargedAt)),
    getAffiliateNameMap(),
  ])

  let data = rows
  if (scope === "next") {
    const window = getDrawingWindow()
    const startMs = window.start.getTime()
    const endMs = window.end.getTime()
    data = rows.filter((r) => {
      const t = r.chargedAt ? new Date(r.chargedAt).getTime() : NaN
      return Number.isFinite(t) && t >= startMs && t < endMs
    })
  }

  const headers = [
    "Charge ID",
    "Date",
    "Name",
    "Email",
    "Type",
    "Entries",
    "Amount ($)",
    "Affiliate",
    "Referral Code",
    "Billing Month",
    "Status",
  ]

  const lines = data.map((r) => [
    r.id,
    r.chargedAt ? new Date(r.chargedAt).toISOString() : "",
    r.name,
    r.email,
    TYPE_EXPORT_LABELS[r.type] || r.type,
    r.entries,
    (r.amountCents / 100).toFixed(2),
    r.referralCode ? affiliateNames.get(r.referralCode) ?? "" : "",
    r.referralCode || "",
    r.billingMonth || "",
    r.status,
  ])

  return [headers.join(","), ...lines.map((row) => row.map(csvCell).join(","))].join("\n")
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

    // Shared Stripe account: this backfill only claims charges whose
    // subscription already exists in OUR donations table. Charges from our
    // other websites have no matching donor row and are skipped.
    if (!donor) continue

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
