import "server-only"
import { and, eq, isNotNull, isNull } from "drizzle-orm"
import { db } from "@/lib/db"
import { donations, transactions } from "@/lib/db/schema"
import { getBillingMonthKey, getDrawingSchedule } from "@/lib/drawing"

export const MAX_MONTHS_LIMIT = 120

// Returns the validated month limit, or null when the donation has no limit.
export function parseMonthsLimit(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null
  const months = Number(value)
  if (!Number.isInteger(months) || months < 1 || months > MAX_MONTHS_LIMIT) {
    throw new Error(`Month limit must be a whole number between 1 and ${MAX_MONTHS_LIMIT}`)
  }
  return months
}

// The cutoff of the last drawing a donation made at `from` is entered in.
export function getLimitEndsAt(from: Date, monthsLimit: number): Date {
  return getDrawingSchedule(from, monthsLimit, "manual")[monthsLimit - 1].cutoff
}

type Executor = Pick<typeof db, "transaction">

// Brings manual donations with a month limit up to date: records the monthly
// charge for each drawing cycle that has opened since the last one, and marks
// the donation "completed" once its last drawing has passed.
//
// Progress is tracked in `monthsRecorded` rather than by looking for existing
// charges, so a charge the admin deletes is not recreated. The rows are locked
// for the duration so two simultaneous page loads cannot record a month twice.
export async function syncLimitedDonations(now: Date = new Date(), executor: Executor = db) {
  await executor.transaction(async (tx) => {
    const limited = await tx
      .select()
      .from(donations)
      .where(
        and(
          eq(donations.status, "active"),
          isNotNull(donations.monthsLimit),
          isNull(donations.stripeSubscriptionId),
        ),
      )
      .for("update")

    for (const donation of limited) {
      const limit = donation.monthsLimit
      if (!limit || limit < 1) continue

      const schedule = getDrawingSchedule(donation.createdAt ?? now, limit, "manual")
      // The first month's charge is recorded when the donation is added.
      let recorded = Math.max(1, donation.monthsRecorded)

      // Month N+1 opens the moment month N's drawing closes.
      while (recorded < limit && schedule[recorded - 1].cutoff.getTime() <= now.getTime()) {
        const chargedAt = schedule[recorded - 1].cutoff
        await tx.insert(transactions).values({
          donationId: donation.id,
          stripePaymentIntentId: `manual_${donation.id}_m${recorded + 1}`,
          name: donation.name,
          email: donation.email,
          amountCents: donation.amountCents,
          entries: donation.entries,
          type: "manual",
          status: "paid",
          billingMonth: getBillingMonthKey(chargedAt, "manual"),
          referralCode: donation.referralCode,
          chargedAt,
        })
        recorded += 1
      }

      const endsAt = donation.endsAt ?? schedule[limit - 1].cutoff
      const completed = endsAt.getTime() <= now.getTime()
      if (recorded === donation.monthsRecorded && !completed) continue

      await tx
        .update(donations)
        .set({
          monthsRecorded: recorded,
          ...(completed ? { status: "completed" } : {}),
          updatedAt: now,
        })
        .where(eq(donations.id, donation.id))
    }
  })
}
